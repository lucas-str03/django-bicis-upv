import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  // La URL base de tu API en Django
  public API_URL = 'http://localhost:8000/bicicleta'; 
  
  constructor() { }
}
