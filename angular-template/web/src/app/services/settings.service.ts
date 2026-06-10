import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  // mode = 1 → local (híbrido) | mode = 2 → producción VPS completada
  public mode = 2;

  public API_URL: string = '';         // URL base de la API (para core/login, core/isloggedin)
  public API_BICICLETA_URL: string = ''; // URL específica para los endpoints de bicicleta
  public GEOSERVER_URL: string = '';
  public GEOSERVER_WMS_URL: string = '';
  public WEB_URL: string = '';

  constructor() {
    if (this.mode == 1) {
      // Backend Django en tu Docker local
      this.API_URL = 'http://localhost:8033';
      this.API_BICICLETA_URL = 'http://localhost:8033/bicicleta';
      
      // GeoServer apuntando a la infraestructura de la UPV
      this.GEOSERVER_URL = 'https://geomaticaupv.es/geoserver/';
      this.GEOSERVER_WMS_URL = 'https://geomaticaupv.es/geoserver/streitenberger/wms';
      
      // Frontend en tu Angular local
      this.WEB_URL = 'http://localhost:4200/';
    } else {
      // Entorno 100% Producción
      this.API_URL = 'https://streitenberger.geomaticaupv.es/api';
      this.API_BICICLETA_URL = 'https://streitenberger.geomaticaupv.es/api/bicicleta';
      this.GEOSERVER_URL = 'https://streitenberger.geomaticaupv.es/geoserver/';
      this.GEOSERVER_WMS_URL = 'https://geomaticaupv.es/geoserver/streitenberger/wms';
      this.WEB_URL = 'https://streitenberger.geomaticaupv.es/';
    }
  }
}
