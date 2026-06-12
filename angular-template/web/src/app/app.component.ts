import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router'; // <-- AÑADIDO RouterLink
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon'; // <-- AÑADIDO MatIconModule
import { MenuComponent } from './component/menu/menu.component'; 
import { FooterComponent } from './component/footer/footer.component';
import { AuthService } from './services/auth.service'; // Asegúrate de que la ruta es correcta

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    RouterLink,      // <-- AÑADIDO AQUÍ
    MenuComponent, 
    FooterComponent,
    MatSidenavModule, 
    MatListModule,
    MatIconModule    // <-- AÑADIDO AQUÍ
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Gestión de Bicicletas - Valencia';

  constructor(public authService: AuthService) {}
}