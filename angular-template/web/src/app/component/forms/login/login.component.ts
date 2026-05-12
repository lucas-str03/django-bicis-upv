import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { ServerAnswerModel } from '../../../models/server-answer.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginFormComponent {
  serverMessage = '';

  controlsGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  constructor(private apiService: ApiService, private authService: AuthService) {}

  login() {
    this.serverMessage = '';
    this.apiService.post('core/login', this.controlsGroup.value).subscribe({
      next: (response: ServerAnswerModel) => {
        if (response.ok) {
          this.authService.username = this.controlsGroup.value.username!;
          this.authService.isAuthenticated = true;
          this.serverMessage = "¡Bienvenido!";
        } else {
          this.serverMessage = response.message;
        }
      },
      error: () => {
        this.serverMessage = "Usuario o contraseña incorrectos";
      }
    });
  }
}