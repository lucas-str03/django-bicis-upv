import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// 1. Importamos el componente del menú y el footer 
import { MenuComponent } from './component/menu/menu.component'; 
import { FooterComponent } from './component/footer/footer.component'; // <-- 1. IMPORTAR

@Component({
  selector: 'app-root',
  standalone: true,
  // 2. AÑADIR AQUÍ EL MENUCOMPONENT
  imports: [RouterOutlet, MenuComponent, FooterComponent], //
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Gestión de Bicicletas - Valencia';
}