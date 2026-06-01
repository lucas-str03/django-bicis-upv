import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para el *ngIf
import { MatButtonModule } from '@angular/material/button';

// Subimos los 3 niveles para llegar a services y models
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { ServerAnswerModel } from '../../../models/server-answer.model';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule, MatButtonModule], 
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss'
})
export class LogoutFormComponent {
  serverMessage = '';

  constructor(private apiService: ApiService, private authService: AuthService) {}

  logout() {
    this.apiService.post('core/logout/', {}).subscribe({
      next: (response: ServerAnswerModel) => {
        if (response.ok) {
          // Limpiamos los datos del servicio
          this.authService.username = '';
          this.authService.isAuthenticated = false;
          this.serverMessage = "Sesión cerrada correctamente.";
        } else {
          this.serverMessage = response.message;
        }
      },
      error: (error: any) => {
        console.log("Error al cerrar sesión:", error);
        this.serverMessage = "Error de conexión.";
      }
    });
  }
}