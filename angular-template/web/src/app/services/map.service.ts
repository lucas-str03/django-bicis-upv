import { Injectable } from '@angular/core';
import { Map, View } from 'ol';
import { Projection } from 'ol/proj';
import LayerGroup from 'ol/layer/Group';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  map: Map;
  myLayersGroup: LayerGroup;

  constructor(public settingsService: SettingsService) {
    this.myLayersGroup = this.createMyLayers();
    this.map = this.createMap();
  }

  createMyLayers(): LayerGroup {
    // Definimos los parámetros comunes para que GeoServer entienda la proyección
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
        url: this.settingsService.GEOSERVER_URL + 'wms?',
        params: { ...wmsParams, 'LAYERS': 'streitenberger:bicicleta_barrio' }
      })
    });

    const carrilesWMS = new TileLayer({
      properties: { title: 'Carriles Bici WMS' },
      source: new TileWMS({
        url: this.settingsService.GEOSERVER_URL + 'wms?',
        params: { ...wmsParams, 'LAYERS': 'streitenberger:bicicleta_carrilbici' }
      })
    });

    const estacionesWMS = new TileLayer({
      properties: { title: 'Estaciones WMS' },
      source: new TileWMS({
        url: this.settingsService.GEOSERVER_URL + 'wms?',
        params: { ...wmsParams, 'LAYERS': 'streitenberger:bicicleta_estacionbicicleta' }
      })
    });

    const myLayersGroup = new LayerGroup({
      properties: { title: 'Mis Capas' },
      layers: [
        barriosWMS, carrilesWMS, estacionesWMS,
        new VectorLayer({ source: new VectorSource(), properties: { title: 'Barrios vector' } }),
        new VectorLayer({ source: new VectorSource(), properties: { title: 'Carriles vector' } }),
        new VectorLayer({ source: new VectorSource(), properties: { title: 'Estaciones vector' } })
      ]
    });
    return myLayersGroup;
  }

  createMap(): Map {
    // Definimos la proyección de Valencia (EPSG:25830)
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
      layers: [this.myLayersGroup]
    });
  }
}