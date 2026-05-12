import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ServerAnswerModel } from '../models/server-answer.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public username: string = '';
  public isAuthenticated: boolean = false;

  constructor(public apiService: ApiService) {
    this.checkIsLoggedInInServer();
  }

  checkIsLoggedInInServer() {
    this.apiService.post('core/isloggedin/', {}).subscribe({
      next: (response: ServerAnswerModel) => {
        if (response.ok && response.data.length > 0) {
          this.username = response.data[0]['username'];
          this.isAuthenticated = true;
        }
      }
    });
  }
}