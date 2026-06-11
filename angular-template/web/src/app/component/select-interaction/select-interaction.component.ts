import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventService } from '../../services/event.service';
import { MapService } from '../../services/map.service'; // <-- NUEVO

@Component({
  selector: 'app-select-interaction',
  standalone: true,
  imports: [],
  templateUrl: './select-interaction.component.html',
  styleUrl: './select-interaction.component.scss'
})
export class SelectInteractionComponent implements OnInit, OnDestroy {
  isActive: boolean = false;
  private sub!: Subscription;
  readonly TOOL_NAME = 'select-interaction';

  // Añadimos el MapService al constructor
  constructor(private eventService: EventService, private mapService: MapService) {}

  ngOnInit() {
    this.sub = this.eventService.currentInteraction$.subscribe((activeTool: string) => {
      // Si alguien activa otra herramienta, me apago a mí mismo y limpio el mapa
      if (activeTool !== this.TOOL_NAME) {
        this.isActive = false;
        this.mapService.toggleSelectInteraction(false);
      }
    });
  }

  toggleSelect() {
    this.isActive = !this.isActive;
    
    // Le decimos a OpenLayers que encienda/apague la interacción
    this.mapService.toggleSelectInteraction(this.isActive);

    if (this.isActive) {
      this.eventService.activateInteraction(this.TOOL_NAME);
      console.log('Modo Selección: ACTIVADO');
    } else {
      this.eventService.activateInteraction('none');
      console.log('Modo Selección: DESACTIVADO');
    }
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
    // Por seguridad, si destruimos el botón, apagamos la herramienta del mapa
    this.mapService.toggleSelectInteraction(false); 
  }
}