import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // <-- NUEVO: Para hacer la petición a Django
import { Map, View } from 'ol';
import { Projection } from 'ol/proj';
import LayerGroup from 'ol/layer/Group';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import XYZ from 'ol/source/XYZ';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import WKT from 'ol/format/WKT'; // <-- NUEVO: Para leer el texto WKT
import Feature from 'ol/Feature'; // <-- NUEVO: Para crear los objetos espaciales
import { SettingsService } from './settings.service';
import proj4 from 'proj4'; 
import { register } from 'ol/proj/proj4'; 

@Injectable({
  providedIn: 'root'
})
export class MapService {
  map: Map;
  myLayersGroup: LayerGroup;

  barriosVectorSource = new VectorSource();
  carrilesVectorSource = new VectorSource();
  estacionesVectorSource = new VectorSource();

  // Inyectamos el HttpClient en el constructor
  constructor(public settingsService: SettingsService, private http: HttpClient) {
    this.myLayersGroup = this.createMyLayers();
    this.map = this.createMap();
    
    // Llamamos a la función de carga nada más arrancar el servicio
    this.loadVectorData();
  }

  // --- NUEVA FUNCIÓN PARA CARGAR LAS GEOMETRÍAS ---
  // --- NUEVA FUNCIÓN PARA CARGAR LAS GEOMETRÍAS ---
  loadVectorData(): void {
    // Magia pura: usamos tu servicio de configuración para que la URL sea dinámica
    const url = `${this.settingsService.API_BICICLETA_URL}/selectall/`; 

    this.http.get<any>(url).subscribe({
      next: (response) => {
        if (response.ok) {
          const wktFormat = new WKT();
          
          // CRÍTICO: Transformación al vuelo. Django manda WGS84 (4326) y el mapa usa UTM 30N (25830)
          const readOptions = {
            dataProjection: 'EPSG:4326', 
            featureProjection: 'EPSG:25830'
          };

          // 1. Cargar Barrios
          const barriosFeatures = response.data.barrios.map((b: any) => {
            const feature = wktFormat.readFeature(b.wkt, readOptions) as Feature;
            feature.setProperties({ codigo_barrio: b.codigo_barrio, nombre: b.nombre });
            return feature;
          });
          this.barriosVectorSource.addFeatures(barriosFeatures);

          // 2. Cargar Carriles
          const carrilesFeatures = response.data.carriles.map((c: any) => {
            const feature = wktFormat.readFeature(c.wkt, readOptions) as Feature;
            feature.setProperties({ id: c.id, tipo: c.tipo });
            return feature;
          });
          this.carrilesVectorSource.addFeatures(carrilesFeatures);

          // 3. Cargar Estaciones
          const estacionesFeatures = response.data.estaciones.map((e: any) => {
            const feature = wktFormat.readFeature(e.wkt, readOptions) as Feature;
            feature.setProperties({ numero: e.numero, nombre: e.nombre });
            return feature;
          });
          this.estacionesVectorSource.addFeatures(estacionesFeatures);

          console.log('✅ Capas vectoriales cargadas e inyectadas en el mapa.');
        }
      },
      error: (err) => {
        console.error('❌ Error cargando geometrías desde Django:', err);
      }
    });
  }

  createMyLayers(): LayerGroup {
    const wmsParams = {
      'VERSION': '1.3.0',
      'TILED': true,
      'TRANSPARENT': true,
      'FORMAT': 'image/png',
      'CRS': 'EPSG:25830'
    };

    const barriosWMS = new TileLayer({
      properties: { title: 'Barrios WMS' },
      source: new TileWMS({
        url: this.settingsService.GEOSERVER_WMS_URL, 
        params: { ...wmsParams, 'LAYERS': 'streitenberger:bicicleta_barrio' }
      })
    });

    const carrilesWMS = new TileLayer({
      properties: { title: 'Carriles Bici WMS' },
      source: new TileWMS({
        url: this.settingsService.GEOSERVER_WMS_URL,
        params: { ...wmsParams, 'LAYERS': 'streitenberger:bicicleta_carrilbici' }
      })
    });

    const estacionesWMS = new TileLayer({
      properties: { title: 'Estaciones WMS' },
      source: new TileWMS({
        url: this.settingsService.GEOSERVER_WMS_URL,
        params: { ...wmsParams, 'LAYERS': 'streitenberger:bicicleta_estacionbicicleta' }
      })
    });

    return new LayerGroup({
      properties: { title: 'Mis Capas' },
      layers: [
        barriosWMS, carrilesWMS, estacionesWMS,
        new VectorLayer({ source: this.barriosVectorSource, properties: { title: 'Barrios vector' } }),
        new VectorLayer({ source: this.carrilesVectorSource, properties: { title: 'Carriles vector' } }),
        new VectorLayer({ source: this.estacionesVectorSource, properties: { title: 'Estaciones vector' } })
      ]
    });
  }

  createMap(): Map {
    // Registrar la proyección EPSG:25830
    proj4.defs('EPSG:25830', '+proj=utm +zone=30 +ellps=GRS80 +units=m +no_defs');
    register(proj4);

    const epsg25830 = new Projection({
      code: 'EPSG:25830',
      extent: [-729785.76, 3715125.82, 945351.10, 9522561.39],
      units: 'm'
    });

    return new Map({
      view: new View({ 
        center: [729035, 4373419], 
        zoom: 14,
        projection: epsg25830 
      }),
      layers: [
        // capa base CartoDB Positron
        new TileLayer({ 
          source: new XYZ({
            url: 'https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
            attributions: '© CARTO'
          }) 
        }),
        this.myLayersGroup
      ]
    });
  }
}