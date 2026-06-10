import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { EventService } from '../../services/event.service';
import { MapService } from '../../services/map.service';
import Draw from 'ol/interaction/Draw';
import WKT from 'ol/format/WKT';

@Component({
  selector: 'app-draw-carril',
  standalone: true,
  imports: [],
  templateUrl: './draw-carril.component.html',
  styleUrl: './draw-carril.component.scss'
})
export class DrawCarrilComponent implements OnInit, OnDestroy {
  isActive: boolean = false; // Variable conectada al HTML para pintar el botón de azul cuando está activo
  private sub!: Subscription; // El "cable" que nos conecta al servicio de eventos
  readonly TOOL_NAME = 'draw-carril'; // El DNI de esta herramienta para que el EventService no la confunda
  private drawInteraction!: Draw; // La variable que almacena la herramienta de dibujo de OpenLayers

  constructor(
    private eventService: EventService, // Inyectamos el intercomunicador entre botones
    private mapService: MapService,     // Inyectamos el mapa para poder meterle el "lápiz"
    private router: Router              // Inyectamos el enrutador para viajar al formulario
  ) {}

  ngOnInit() {
    // 1. DEFINICIÓN DE LA INTERACCIÓN GEOMÉTRICA
    // Al instanciar Draw, le decimos a OpenLayers dos cosas vitales:
    // - source: Dónde va a guardar temporalmente lo que dibuje (en la capa de carriles).
    // - type: 'LineString' (cadena de líneas), porque un carril bici es una sucesión de vértices sin cerrar.
    this.drawInteraction = new Draw({
      source: this.mapService.carrilesVectorSource,
      type: 'LineString'
    });

    // 2. GESTIÓN DE EXCLUSIVIDAD (Manejo de estados)
    // Escuchamos continuamente el canal del EventService. Si llega un mensaje diciendo 
    // que se ha activado 'draw-estacion' o 'draw-barrio', comprobamos que no somos nosotros (this.TOOL_NAME) 
    // y nos auto-desactivamos, quitando nuestro lápiz del mapa.
    this.sub = this.eventService.currentInteraction$.subscribe((activeTool: string) => {
      if (activeTool !== this.TOOL_NAME) {
        this.isActive = false;
        this.mapService.map.removeInteraction(this.drawInteraction);
      }
    });

    // 3. CAPTURA DEL DATO Y NAVEGACIÓN
    // El evento 'drawend' se dispara al hacer doble clic para terminar de dibujar la línea.
    this.drawInteraction.on('drawend', (event) => {
      // Extraemos el objeto geométrico puro recién creado en el mapa
      const geometry = event.feature.getGeometry(); 
      // Preparamos el conversor a Well-Known Text (WKT)
      const wktFormat = new WKT(); 
      
      if (geometry) {
        // Convertimos el objeto a un String estructurado (ej: LINESTRING(x y, x y, x y))
        // Este formato es el que entiende tu base de datos PostGIS en el backend.
        const wktString = wktFormat.writeGeometry(geometry);
        console.log('Carril dibujado en WKT:', wktString);

        // Llamamos a la función local para apagar el botón y limpiar la herramienta del mapa
        this.toggleDraw();

        // 4. ENVÍO DE DATOS AL FORMULARIO
        // Navegamos a la vista de creación de carriles y le pasamos el string WKT 
        // a través de la URL (queryParams) para que el formulario lo intercepte y lo precargue.
        this.router.navigate(['/carriles'], {
          queryParams: { geom: wktString }
        });
      }
    });
  }

  // FUNCIÓN DEL BOTÓN HTML
  // Controla el flujo manual: si el usuario hace clic, encendemos o apagamos.
  toggleDraw() {
    this.isActive = !this.isActive; // Invertimos el estado visual
    
    if (this.isActive) {
      // Avisamos a los demás de que entramos en juego y activamos la herramienta en OpenLayers
      this.eventService.activateInteraction(this.TOOL_NAME);
      this.mapService.map.addInteraction(this.drawInteraction);
    } else {
      // Avisamos de que nos vamos y retiramos la herramienta
      this.eventService.activateInteraction('none');
      this.mapService.map.removeInteraction(this.drawInteraction);
    }
  }

  // DESTRUCTOR DEL COMPONENTE (Gestión de Memoria)
  // Fundamental en Angular. Si el usuario cierra la barra de herramientas o cambia de vista,
  // nos aseguramos de cortar el cable de la suscripción (.unsubscribe) y sacar 
  // la herramienta de OpenLayers para evitar bugs y consumo inútil de memoria RAM.
  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
    this.mapService.map.removeInteraction(this.drawInteraction);
  }
}