import { Routes } from '@angular/router';
import { EstacionesComponent } from './component/estaciones/estaciones.component';
import { BarriosComponent } from './component/barrios/barrios.component';
import { CarrilesComponent } from './component/carriles/carriles.component';
import { LoginFormComponent } from './component/forms/login/login.component';
import { LogoutFormComponent } from './component/forms/logout/logout.component';
// Añadimos la importación del mapa (ajusta la ruta si tu carpeta se llama distinto)
import { MapComponent } from './component/map/map.component'; 

export const routes: Routes = [
  { path: 'map', component: MapComponent }, // <-- ¡NUEVA RUTA!
  { path: 'estaciones', component: EstacionesComponent },
  { path: 'barrios', component: BarriosComponent },
  { path: 'carriles', component: CarrilesComponent },
  { path: 'login-form', component: LoginFormComponent },
  { path: 'logout-form', component: LogoutFormComponent },
  { path: '', redirectTo: '/map', pathMatch: 'full' } // Cambiado a /map temporalmente para probar
];