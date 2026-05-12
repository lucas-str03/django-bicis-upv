import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

// Importamos el servicio de autenticación
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [MatButtonModule, RouterLink, MatIconModule, CommonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  // Inyectamos el servicio en el constructor como 'public'
  constructor(public authService: AuthService) { } 
}