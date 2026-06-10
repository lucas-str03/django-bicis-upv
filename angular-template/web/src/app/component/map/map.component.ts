import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para el *ngIf
import { MapService } from '../../services/map.service';
import { AuthService } from '../../services/auth.service'; // <-- CAMBIO 1: Importamos TU servicio

// Botones de dibujo
import { DrawEstacionComponent } from '../draw-estacion/draw-estacion.component';
import { DrawBarrioComponent } from '../draw-barrio/draw-barrio.component';
import { DrawCarrilComponent } from '../draw-carril/draw-carril.component';

// Importamos las dos nuevas interacciones
import { SelectInteractionComponent } from '../select-interaction/select-interaction.component';
import { EditInteractionComponent } from '../edit-interaction/edit-interaction.component';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    CommonModule, 
    DrawEstacionComponent, 
    DrawBarrioComponent, 
    DrawCarrilComponent, 
    SelectInteractionComponent,
    EditInteractionComponent
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  // CAMBIO 2: Inyectamos el AuthService como 'public' igual que en tu Menú
  constructor(
    public mapService: MapService,
    public authService: AuthService 
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    console.log('mapComponent initialized');
    this.mapService.map.setTarget(this.mapContainer.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.mapService.map) {
      this.mapService.map.setTarget(undefined);
    }
  }
}