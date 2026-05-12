import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  headers = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded'
  });

  constructor(
    public settingsService: SettingsService, 
    private httpClient: HttpClient
  ) { }

  // Función interna para no repetir código y evitar el lío de las barras
  private buildUrl(endPointUrl: string): string {
    // Quitamos barras sobrantes al principio y final para que no se dupliquen
    const cleanEndPoint = endPointUrl.replace(/^\/|\/$/g, '');
    return `${this.settingsService.API_URL}/${cleanEndPoint}/`;
  }

  get(endPointUrl: string, getParams: HttpParams = new HttpParams({})) {
    return this.httpClient.get<any>(this.buildUrl(endPointUrl), {
      headers: this.headers,
      responseType: 'json',
      params: getParams,
      withCredentials: true 
    });
  }

  post(endPointUrl: string, postParams: any = {}) {
    const postData = this.generarHttpParamsDesdeObjeto(postParams);
    return this.httpClient.post<any>(this.buildUrl(endPointUrl), postData, {
      headers: this.headers,
      responseType: 'json',
      withCredentials: true
    });
  }

  put(endPointUrl: string, postParams: any = {}) {
    const postData = this.generarHttpParamsDesdeObjeto(postParams);
    return this.httpClient.put<any>(this.buildUrl(endPointUrl), postData, {
      headers: this.headers,
      responseType: 'json',
      withCredentials: true
    });
  }

  delete(endPointUrl: string, postParams: any = {}) {
    const postData = this.generarHttpParamsDesdeObjeto(postParams);
    return this.httpClient.delete<any>(this.buildUrl(endPointUrl), {
      headers: this.headers,
      body: postData, 
      withCredentials: true
    });
  }

  private generarHttpParamsDesdeObjeto(data: { [key: string]: any }): string {
    let params = new HttpParams();
    for (const key in data) {
      if (data.hasOwnProperty(key) && data[key] !== null && data[key] !== undefined) {
        params = params.set(key, data[key].toString());
      }
    }
    return params.toString();
  }
}