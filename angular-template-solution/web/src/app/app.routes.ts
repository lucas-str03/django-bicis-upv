import { Routes } from '@angular/router';
import { MapComponent } from './components/map/map.component';
import { AboutComponent } from './components/about/about.component';
import { HelpComponent } from './components/help/help.component';
import { HomeComponent } from './components/home/home.component';
import { BuildingFormComponent } from './components/forms/building-form/building-form.component';
import { LoginFormComponent } from './components/forms/login-form/login-form.component';
import { LogoutFormComponent } from './components/forms/logout-form/logout-form.component';



export const routes: Routes = [
    {path: '', redirectTo: '/home', pathMatch: 'full'},
    {path: 'home', component: HomeComponent},
    {path: 'help', component:HelpComponent},
    {path: 'about', component:AboutComponent},
    {path: 'map', component:MapComponent},
    {path: 'building-form', component:BuildingFormComponent},
    {path: 'login-form', component:LoginFormComponent},
    {path: 'logout-form', component:LogoutFormComponent},
];
