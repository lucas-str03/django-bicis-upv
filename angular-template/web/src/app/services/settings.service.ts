import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  // Cambiamos a mode = 2 para compilar en Producción hacia el VPS
  public mode = 2; 

  // Inicializamos con string vacío para evitar el error TS2564
  public API_URL: string = '';
  public GEOSERVER_URL: string = '';
  public WEB_URL: string = '';

  constructor() { 
    if (this.mode == 1) {
      // Configuración local original
      this.API_URL = 'http://localhost:8000/';
      this.GEOSERVER_URL = 'http://localhost:8080/geoserver/';
      this.WEB_URL = 'http://localhost:4200/';

    } else {
      // Configuración de Producción en el VPS 
      // Si no es 1, aplicamos siempre la producción
      this.API_URL = 'https://streitenberger.geomaticaupv.es/api/bicicleta/'; 
      this.GEOSERVER_URL = 'https://streitenberger.geomaticaupv.es/geoserver/';
      this.WEB_URL = 'https://streitenberger.geomaticaupv.es/';
    }
  }
}