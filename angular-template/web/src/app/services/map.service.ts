import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { Map, View } from 'ol';
import { Projection } from 'ol/proj';
import LayerGroup from 'ol/layer/Group';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import XYZ from 'ol/source/XYZ';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import WKT from 'ol/format/WKT'; 
import Feature from 'ol/Feature'; 
import { SettingsService } from './settings.service';
import proj4 from 'proj4'; 
import { register } from 'ol/proj/proj4'; 
import { Style, Fill, Stroke, Circle as CircleStyle, Icon } from 'ol/style';

// IMPORTACIONES PARA INTERACCIONES
import Select from 'ol/interaction/Select';
import { click } from 'ol/events/condition';
import { Router } from '@angular/router'; 
import { Modify, Snap } from 'ol/interaction';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  // --- CORE DE OPENLAYERS ---
  map: Map; // El lienzo principal
  myLayersGroup: LayerGroup; // Carpeta organizadora para encender/apagar capas de golpe

  // --- ALMACENES DE MEMORIA (Sources) ---
  barriosVectorSource = new VectorSource();
  carrilesVectorSource = new VectorSource();
  estacionesVectorSource = new VectorSource();

  // --- REPRESENTACIÓN VISUAL (Layers) ---
  barriosVectorLayer: VectorLayer<VectorSource>;
  carrilesVectorLayer: VectorLayer<VectorSource>;
  estacionesVectorLayer: VectorLayer<VectorSource>;

  // --- HERRAMIENTAS INTERACTIVAS ---
  selectInteraction!: Select;
  editSelectInteraction!: Select;
  modifyInteraction!: Modify;
  snapInteractions: Snap[] = [];

  constructor(
    public settingsService: SettingsService, 
    private http: HttpClient,
    private router: Router
  ) {
    // 1. ESTILOS VECTORIALES
    const barriosStyle = new Style({
      fill: new Fill({ color: 'rgba(144, 238, 144, 0.6)' }), 
      stroke: new Stroke({ color: 'rgba(34, 139, 34, 0.8)', width: 2 })
    });

    const carrilesStyle = new Style({
      stroke: new Stroke({ color: 'rgba(50, 50, 50, 0.6)', width: 1.5 }) 
    });

    const bikeSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="black"><path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6 1-.6 1.6 0 .6.2 1.1.6 1.6L11 14.8V19h1.5v-5l-1.7-3.5zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z"/></svg>';
    const estacionesStyle = new Style({
      image: new Icon({
        src: 'data:image/svg+xml;utf8,' + encodeURIComponent(bikeSvg),
        scale: 1.2
      })
    });

    // 2. VINCULACIÓN: SOURCE + LAYER + STYLE
    this.barriosVectorLayer = new VectorLayer({ 
      source: this.barriosVectorSource, 
      style: barriosStyle, 
      zIndex: 20, 
      properties: { title: 'Barrios vector', name: 'poligono' } 
    });

    this.carrilesVectorLayer = new VectorLayer({ 
      source: this.carrilesVectorSource, 
      style: carrilesStyle, 
      zIndex: 20, 
      properties: { title: 'Carriles vector', name: 'lineas' } 
    });

    this.estacionesVectorLayer = new VectorLayer({ 
      source: this.estacionesVectorSource, 
      style: estacionesStyle, 
      zIndex: 20, 
      properties: { title: 'Estaciones vector', name: 'puntos' } 
    });    

    // 3. SECUENCIA DE ARRANQUE
    this.myLayersGroup = this.createMyLayers(); 
    this.map = this.createMap(); 
    
    this.initSelectInteraction(); 
    this.initEditInteractions();  
    this.loadVectorData(); 
  }

  loadVectorData(): void {
    const url = `${this.settingsService.API_BICICLETA_URL}/selectall/`; 

    this.http.get<any>(url).subscribe({
      next: (response) => {
        if (response.ok) {
          const wktFormat = new WKT(); 
          const readOptions = { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:25830' };

          const barriosFeatures = response.data.barrios.map((b: any) => {
            const feature = wktFormat.readFeature(b.wkt, readOptions) as Feature;
            feature.setProperties({ id: b.nombre, _layerName: 'barrios' });
            return feature;
          });
          this.barriosVectorSource.addFeatures(barriosFeatures);

          const carrilesFeatures = response.data.carriles.map((c: any) => {
            const feature = wktFormat.readFeature(c.wkt, readOptions) as Feature;
            feature.setProperties({ id: c.id, estado: c.tipo, _layerName: 'carriles' });
            return feature;
          });
          this.carrilesVectorSource.addFeatures(carrilesFeatures);

          const estacionesFeatures = response.data.estaciones.map((e: any) => {
            const feature = wktFormat.readFeature(e.wkt, readOptions) as Feature;
            feature.setProperties({ id: e.nombre, numero: e.numero, _layerName: 'estaciones' });
            return feature;
          });
          this.estacionesVectorSource.addFeatures(estacionesFeatures);
        }
      },
      error: (err) => console.error('Error cargando geometrías:', err)
    });
  }

  createMyLayers(): LayerGroup {
    const wmsParams = { 'VERSION': '1.3.0', 'TILED': true, 'TRANSPARENT': true, 'FORMAT': 'image/png', 'CRS': 'EPSG:25830' };
    return new LayerGroup({
      properties: { title: 'Mis Capas' },
      layers: [
        new TileLayer({ zIndex: 10, properties: { title: 'Barrios WMS', name: 'wms' }, source: new TileWMS({ url: this.settingsService.GEOSERVER_WMS_URL, params: { ...wmsParams, 'LAYERS': 'streitenberger:bicicleta_barrio' } }) }),
        new TileLayer({ zIndex: 10, properties: { title: 'Carriles Bici WMS', name: 'wms' }, source: new TileWMS({ url: this.settingsService.GEOSERVER_WMS_URL, params: { ...wmsParams, 'LAYERS': 'streitenberger:bicicleta_carrilbici' } }) }),
        new TileLayer({ zIndex: 10, properties: { title: 'Estaciones WMS', name: 'wms' }, source: new TileWMS({ url: this.settingsService.GEOSERVER_WMS_URL, params: { ...wmsParams, 'LAYERS': 'streitenberger:bicicleta_estacionbicicleta' } }) }),
        this.barriosVectorLayer,
        this.carrilesVectorLayer,
        this.estacionesVectorLayer
      ]
    });
  }

  createMap(): Map {
    proj4.defs('EPSG:25830', '+proj=utm +zone=30 +ellps=GRS80 +units=m +no_defs');
    register(proj4);
    const epsg25830 = new Projection({ code: 'EPSG:25830', extent: [-729785.76, 3715125.82, 945351.10, 9522561.39], units: 'm' });

    return new Map({
      view: new View({ center: [729035, 4373419], zoom: 14, projection: epsg25830 }),
      layers: [
        new TileLayer({ zIndex: 1, properties: { name: 'background' }, source: new XYZ({ url: 'https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', attributions: '© CARTO' }) }),
        this.myLayersGroup
      ]
    });
  }

  private initSelectInteraction(): void {
    const highlightStyle = new Style({
      stroke: new Stroke({ color: '#00FFFF', width: 6 }), 
      fill: new Fill({ color: 'rgba(0, 255, 255, 0.3)' }), 
      image: new CircleStyle({ 
        radius: 12, 
        fill: new Fill({ color: '#00FFFF' }), 
        stroke: new Stroke({ color: '#000000', width: 2 })
      })
    });

    this.selectInteraction = new Select({
      condition: click,
      layers: [this.estacionesVectorLayer, this.carrilesVectorLayer, this.barriosVectorLayer],
      hitTolerance: 10,
      style: highlightStyle
    });

    this.map.addInteraction(this.selectInteraction);
    this.selectInteraction.setActive(false);

    this.selectInteraction.on('select', (e) => {
      const selectedFeatures = e.selected;
      if (selectedFeatures.length > 0) {
        const feature = selectedFeatures[0]; 
        const props = feature.getProperties();
        const layerName = props['_layerName']; 
        const id = props['id']; 

        if (id !== undefined) {
          this.selectInteraction.getFeatures().clear();
          this.router.navigate([`/${layerName}`, id]);
        }
      }
    });
  }

  private initEditInteractions(): void {
    this.editSelectInteraction = new Select({
      layers: [this.barriosVectorLayer, this.carrilesVectorLayer, this.estacionesVectorLayer],
      hitTolerance: 10
    });

    this.modifyInteraction = new Modify({
      features: this.editSelectInteraction.getFeatures()
    });

    this.snapInteractions = [
      new Snap({ source: this.barriosVectorSource }),
      new Snap({ source: this.carrilesVectorSource }),
      new Snap({ source: this.estacionesVectorSource })
    ];

    this.map.addInteraction(this.editSelectInteraction);
    this.map.addInteraction(this.modifyInteraction);
    this.snapInteractions.forEach(snap => this.map.addInteraction(snap));

    this.editSelectInteraction.setActive(false);
    this.modifyInteraction.setActive(false);
    this.snapInteractions.forEach(snap => snap.setActive(false));

    // CORRECCIÓN AQUÍ: Captura el WKT modificado y lo envía por queryParams
    this.modifyInteraction.on('modifyend', (e) => {
      const features = e.features.getArray();
      if (features.length > 0) {
        const feature = features[0];
        const props = feature.getProperties();
        const layerName = props['_layerName'];
        const id = props['id'];

        if (id !== undefined) {
          const wktFormat = new WKT();
          // Traduce la geometría visual (25830) a texto geográfico (4326) para la Base de Datos
          const newGeomWkt = wktFormat.writeGeometry(feature.getGeometry()!, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:25830'
          });

          this.editSelectInteraction.getFeatures().clear();
          
          // Navega inyectando la nueva geometría modificada en la URL
          this.router.navigate([`/${layerName}`, id], {
            queryParams: { geom: newGeomWkt }
          });
        }
      }
    });
  }

  toggleSelectInteraction(active: boolean): void {
    this.selectInteraction.setActive(active);
    if (!active) this.selectInteraction.getFeatures().clear(); 
  }

  toggleEditInteraction(active: boolean): void {
    this.editSelectInteraction.setActive(active);
    this.modifyInteraction.setActive(active);
    this.snapInteractions.forEach(snap => snap.setActive(active));

    if (!active) {
      this.editSelectInteraction.getFeatures().clear();
    }
  }
}