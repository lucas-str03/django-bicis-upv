import { Routes } from '@angular/router';
import { EstacionesComponent } from './component/estaciones/estaciones.component';
import { BarriosComponent } from './component/barrios/barrios.component';
import { CarrilesComponent } from './component/carriles/carriles.component';
import { LoginFormComponent } from './component/forms/login/login.component';
import { LogoutFormComponent } from './component/forms/logout/logout.component';

export const routes: Routes = [
  { path: 'estaciones', component: EstacionesComponent },
  { path: 'barrios', component: BarriosComponent },
  { path: 'carriles', component: CarrilesComponent },
  { path: 'login-form', component: LoginFormComponent },
  { path: 'logout-form', component: LogoutFormComponent },
  { path: '', redirectTo: '/estaciones', pathMatch: 'full' }
];