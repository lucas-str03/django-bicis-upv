import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventService } from '../../services/event.service';
import { MapService } from '../../services/map.service';

@Component({
  selector: 'app-select-interaction',
  standalone: true,
  imports: [],
  templateUrl: './select-interaction.component.html',
  styleUrl: './select-interaction.component.scss'
})
export class SelectInteractionComponent implements OnInit, OnDestroy {
  // Estado local de la UI. Dicta si el botón HTML está presionado o no.
  isActive: boolean = false;
  
  // El "cable" que nos conecta a la centralita de eventos. Lo guardamos
  // para poder desenchufarlo después.
  private sub!: Subscription;
  
  // Constante inmutable. Es el identificador único en el bus de eventos.
  readonly TOOL_NAME = 'select-interaction';

  // Inyección de dependencias: 
  // - eventService: Controlador del tráfico del Frontend (Angular).
  // - mapService: Controlador del tráfico del motor gráfico (OpenLayers).
  constructor(private eventService: EventService, private mapService: MapService) {}

  // Fase de Inicialización (Lifecycle Hook)
  ngOnInit() {
    // Escuchamos de forma reactiva (patrón Observer) cualquier cambio en la herramienta activa
    this.sub = this.eventService.currentInteraction$.subscribe((activeTool: string) => {
      // Condición de exclusión mutua: si la herramienta que está hablando no soy yo...
      if (activeTool !== this.TOOL_NAME) {
        // 1. Sincronizo mi UI local apagando el botón.
        this.isActive = false;
        // 2. Sincronizo el mapa, ordenándole que quite la clase 'Select' de OpenLayers.
        // Esto es vital porque el EventService solo avisa a Angular, no a OpenLayers.
        this.mapService.toggleSelectInteraction(false);
      }
    });
  }

  // Controlador del Evento (Binding desde el HTML)
  toggleSelect() {
    // Alternamos el estado local de forma síncrona
    this.isActive = !this.isActive;
    
    // Delegamos la lógica compleja de SIG al MapService.
    // Le pasamos nuestro nuevo estado (true/false) para que añada o quite 
    // la interacción de selección en el canvas del mapa.
    this.mapService.toggleSelectInteraction(this.isActive);

    // Broadcast (emisión) del estado al resto de la aplicación
    if (this.isActive) {
      this.eventService.activateInteraction(this.TOOL_NAME);
      console.log('Modo Selección: ACTIVADO');
    } else {
      // Si el usuario nos apaga, liberamos el canal para que el sistema 
      // sepa que no hay ninguna herramienta activa ('none').
      this.eventService.activateInteraction('none');
      console.log('Modo Selección: DESACTIVADO');
    }
  }

  // Fase de Destrucción (Lifecycle Hook)
  ngOnDestroy() {
    // Liberación de memoria RAM: rompemos la suscripción de RxJS.
    if (this.sub) this.sub.unsubscribe();
    
    // Cortafuegos de estado: Forzamos el apagado en OpenLayers.
    // Garantiza que el mapa no se quede capturando clics si el componente desaparece del DOM.
    this.mapService.toggleSelectInteraction(false); 
  }
}