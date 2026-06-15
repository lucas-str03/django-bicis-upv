import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventService } from '../../services/event.service';
import { MapService } from '../../services/map.service';

@Component({
  selector: 'app-edit-interaction',
  standalone: true,
  imports: [],
  templateUrl: './edit-interaction.component.html',
  styleUrl: './edit-interaction.component.scss'
})
export class EditInteractionComponent implements OnInit, OnDestroy {
  // Estado visual del botón (encendido/apagado). 
  // Angular usa esto en el HTML para ponerle la clase CSS "active" o cambiar el icono.
  isActive: boolean = false;
  
  // Guardamos la "suscripción" a la emisora de radio en una variable privada.
  // Es OBLIGATORIO guardarla para poder "colgar" cuando el componente se destruya.
  private sub!: Subscription;
  
  // El DNI de este componente. Lo hacemos 'readonly' (solo lectura) para asegurar
  // que nadie por error le cambie el nombre en tiempo de ejecución.
  readonly TOOL_NAME = 'edit-interaction';

  constructor(
    private eventService: EventService, // Para hablar con otros botones
    private mapService: MapService    // Para darle órdenes al mapa (OpenLayers)
  ) {}

  // Se ejecuta automáticamente en cuanto el botón aparece en la pantalla
  ngOnInit() {
    // Nos conectamos a la "radio" central
    this.sub = this.eventService.currentInteraction$.subscribe((activeTool: string) => {
      // Si escuchamos que alguien se ha activado, y ese alguien NO somos nosotros...
      if (activeTool !== this.TOOL_NAME) {
        this.isActive = false; // 1. Apagamos el color de nuestro botón
        
        // 2. Le ordenamos al MapService que apague los "Tres Mosqueteros" 
        // (Select, Modify y Snap) pasándole un 'false'.
        this.mapService.toggleEditInteraction(false); 
      }
    });
  }

  // Se ejecuta cuando el usuario hace CLIC FÍSICO en el botón HTML
  toggleEdit() {
    // Invertimos el estado: si era false pasa a true, y viceversa
    this.isActive = !this.isActive;
    
    // Aquí está la magia de la delegación: 
    // Este componente NO sabe cómo editar polígonos. Solo sabe llamar al jefe del mapa
    // y decirle: "Oye, enciende (o apaga) la maquinaria de edición".
    this.mapService.toggleEditInteraction(this.isActive);

    // Lógica de comunicación con el resto de la app
    if (this.isActive) {
      // Si nos acabamos de encender, avisamos a los demás botones para que se apaguen
      this.eventService.activateInteraction(this.TOOL_NAME);
      console.log('Modo Edicion: ACTIVADO');
    } else {
      // Si el usuario nos ha vuelto a hacer clic para apagarnos, avisamos de que
      // el mapa vuelve a estar "libre" ('none').
      this.eventService.activateInteraction('none');
      console.log('Modo Edicion: DESACTIVADO');
    }
  }

  // Se ejecuta si el usuario cambia de ruta (ej. se va a la lista de estaciones)
  // y este botón desaparece de la pantalla.
  ngOnDestroy() {
    // 1. Apagamos la radio para no dejar procesos fantasma consumiendo memoria RAM
    if (this.sub) this.sub.unsubscribe();
    
    // 2. POR SEGURIDAD: Apagamos el modo edición en el mapa.
    // Imagina que el usuario estaba editando y, sin apagar el botón, le da a "Ir a Barrios".
    // Si no hacemos esto, la herramienta de OpenLayers se quedaría "encendida" e invisible
    // en segundo plano, causando bugs horribles.
    this.mapService.toggleEditInteraction(false);
  }
}