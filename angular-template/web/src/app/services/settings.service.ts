import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  // mode = 1 → local | mode = 2 → producción VPS
  public mode = 2;

  public API_URL: string = '';         // URL base de la API (para core/login, core/isloggedin)
  public API_BICICLETA_URL: string = ''; // URL específica para los endpoints de bicicleta
  public GEOSERVER_URL: string = '';
  public GEOSERVER_WMS_URL: string = '';
  public WEB_URL: string = '';

  constructor() {
    if (this.mode == 1) {
      this.API_URL = 'http://localhost:8033';
      this.API_BICICLETA_URL = 'http://localhost:8033/bicicleta';
      this.GEOSERVER_URL = 'http://localhost:8080/geoserver/';
      this.GEOSERVER_WMS_URL = 'http://localhost:8080/geoserver/streitenberger/wms';
      this.WEB_URL = 'http://localhost:4200/';
    } else {
      this.API_URL = 'https://streitenberger.geomaticaupv.es/api';
      this.API_BICICLETA_URL = 'https://streitenberger.geomaticaupv.es/api/bicicleta';
      this.GEOSERVER_URL = 'https://streitenberger.geomaticaupv.es/geoserver/';
      this.GEOSERVER_WMS_URL = 'https://geomaticaupv.es/geoserver/streitenberger/wms';
      this.WEB_URL = 'https://streitenberger.geomaticaupv.es/';
    }
  }
}