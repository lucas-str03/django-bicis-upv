import { Routes } from '@angular/router';
import { EstacionesComponent } from './component/estaciones/estaciones.component';
import { BarriosComponent } from './component/barrios/barrios.component';
import { CarrilesComponent } from './component/carriles/carriles.component';
import { LoginFormComponent } from './component/forms/login/login.component';
import { LogoutFormComponent } from './component/forms/logout/logout.component';
import { MapComponent } from './component/map/map.component'; 

export const routes: Routes = [
  { path: 'map', component: MapComponent }, // Ruta para el mapa
  { path: 'estaciones', component: EstacionesComponent },
  { path: 'barrios', component: BarriosComponent },
  { path: 'carriles', component: CarrilesComponent },
  { path: 'login-form', component: LoginFormComponent },
  { path: 'logout-form', component: LogoutFormComponent },
  
  // ⚠️ CORREGIDO: Rutas dinámicas con parámetros usando los componentes que ya tienes importados
  { path: 'barrios/:id', component: BarriosComponent },
  { path: 'carriles/:id', component: CarrilesComponent },
  { path: 'estaciones/:id', component: EstacionesComponent },

  { path: '', redirectTo: '/map', pathMatch: 'full' },
  { path: '**', redirectTo: '/map' } // Opcional: Redirige al mapa si escriben cualquier cosa mal en la URL
];