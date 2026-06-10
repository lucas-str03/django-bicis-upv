import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ServerAnswerModel } from '../models/server-answer.model';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public username: string = '';
  public isAuthenticated: boolean = false;
  public userGroups: string[] = [];

  constructor(public apiService: ApiService) {
    this.checkIsLoggedInInServer();
  }

  // --- COMPROBAR SESIÓN AL ARRANCAR ---
  checkIsLoggedInInServer() {
    this.apiService.get('isloggedin/').subscribe({
      next: (response: ServerAnswerModel) => {
        if (response.ok && response.data.length > 0) {
          this.username = response.data[0]['username'];
          this.userGroups = response.data[0]['groups'] || [];
          this.isAuthenticated = true;
        }
      },
      error: (err) => {
        console.error("Sesión no activa o error de conexión", err);
        this.isAuthenticated = false;
      }
    });
  }

  // --- LOGIN ---
  login(credentials: any): Observable<ServerAnswerModel> {
    return this.apiService.post('login/', credentials).pipe(
      tap((response: ServerAnswerModel) => {
        if (response.ok) {
          this.username = response.data[0]['username'];
          this.userGroups = response.data[0]['groups'];
          this.isAuthenticated = true;
        }
      })
    );
  }

  // --- LOGOUT ---
  logout(): Observable<ServerAnswerModel> {
    return this.apiService.get('logout/').pipe(
      tap((response: ServerAnswerModel) => {
        if (response.ok) {
          this.username = '';
          this.userGroups = [];
          this.isAuthenticated = false;
        }
      })
    );
  }

  // --- UTILIDAD PARA SABER SI ES EDITOR ---
  isEditor(): boolean {
    return this.isAuthenticated && (this.userGroups.includes('editor') || this.username === 'admin');
  }
}