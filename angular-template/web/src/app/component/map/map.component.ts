import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MapService } from '../../services/map.service';

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
  // Metemos los componentes aquí para que Angular permita sus etiquetas HTML
  imports: [DrawEstacionComponent, DrawBarrioComponent, DrawCarrilComponent, SelectInteractionComponent,
    EditInteractionComponent],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  // Referencia al div del HTML donde OpenLayers pintará el mapa
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  constructor(public mapService: MapService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    console.log('mapComponent initialized');
    // Le pasamos el div real al mapa
    this.mapService.map.setTarget(this.mapContainer.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.mapService.map) {
      this.mapService.map.setTarget(undefined);
    }
  }
}