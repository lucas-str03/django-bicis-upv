import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { EventService } from '../../services/event.service';
import { MapService } from '../../services/map.service';
import Draw from 'ol/interaction/Draw';
import WKT from 'ol/format/WKT';

@Component({
  selector: 'app-draw-barrio',
  standalone: true,
  imports: [],
  templateUrl: './draw-barrio.component.html',
  styleUrl: './draw-barrio.component.scss'
})
// Implementamos OnInit (al arrancar el componente) y OnDestroy (al matarlo/cambiar de página)
export class DrawBarrioComponent implements OnInit, OnDestroy {
  isActive: boolean = false; // Controla si el botón está visualmente encendido o apagado
  private sub!: Subscription; // Guardará la conexión con la "radio" para poder cortarla luego
  readonly TOOL_NAME = 'draw-barrio'; // Identificador ÚNICO de este botón
  private drawInteraction!: Draw; // La herramienta real de OpenLayers que permite dibujar

  constructor(
    private eventService: EventService, // Para hablar con otros botones
    private mapService: MapService,     // Para acceder al mapa y a las capas vectoriales
    private router: Router              // Para navegar al formulario al terminar de dibujar
  ) {}

  ngOnInit() {
    // 1. CONFIGURAR LA HERRAMIENTA DE DIBUJO DE OPENLAYERS
    // Creamos la interacción diciéndole en qué capa debe guardar lo que dibuje (barriosVectorSource)
    // y qué tipo de geometría es ('Polygon' porque los barrios son áreas).
    this.drawInteraction = new Draw({
      source: this.mapService.barriosVectorSource,
      type: 'Polygon'
    });

    // 2. ESCUCHAR A LOS DEMÁS BOTONES (Patrón Observador)
    // Nos suscribimos al canal del EventService. Cada vez que ALGUIEN pulsa un botón, este código se ejecuta.
    this.sub = this.eventService.currentInteraction$.subscribe((activeTool: string) => {
      // Si el nombre de la herramienta que se acaba de activar NO es el mío...
      if (activeTool !== this.TOOL_NAME) {
        this.isActive = false; // ...apago mi botón...
        this.mapService.map.removeInteraction(this.drawInteraction); // ...y le quito el lápiz al mapa.
      }
    });

    // 3. ¿QUÉ PASA CUANDO TERMINO DE DIBUJAR?
    // Escuchamos el evento 'drawend' de OpenLayers, que salta justo al hacer el último clic del polígono.
    this.drawInteraction.on('drawend', (event) => {
      const geometry = event.feature.getGeometry(); // Extraemos la geometría matemática recién creada
      const wktFormat = new WKT(); // Instanciamos el traductor a formato WKT (Well-Known Text)
      
      if (geometry) {
        // Traducimos las coordenadas del mapa a una cadena de texto estándar (ej: POLYGON((x y, x y...)))
        const wktString = wktFormat.writeGeometry(geometry);
        console.log('Polígono dibujado en WKT:', wktString);

        // Apagamos el botón automáticamente porque ya hemos terminado de dibujar un barrio
        this.toggleDraw();

        // Le decimos a Angular que nos lleve a la página de "/barrios" y le pasamos 
        // el chorro de texto WKT en la URL para que el formulario lo pueda recoger.
        this.router.navigate(['/barrios'], {
          queryParams: { geom: wktString }
        });
      }
    });
  }

  // MÉTODO QUE SE EJECUTA AL HACER CLIC EN EL BOTÓN HTML
  toggleDraw() {
    this.isActive = !this.isActive; // Cambia el estado (de false a true o viceversa)
    
    if (this.isActive) {
      // Si me acabo de encender, grito mi nombre por la radio para que los demás se apaguen
      this.eventService.activateInteraction(this.TOOL_NAME);
      // Y le meto la herramienta de dibujo al mapa
      this.mapService.map.addInteraction(this.drawInteraction);
    } else {
      // Si me acabo de apagar yo mismo, digo por la radio que ya no hay "nadie" activo ('none')
      this.eventService.activateInteraction('none');
      // Y saco la herramienta del mapa
      this.mapService.map.removeInteraction(this.drawInteraction);
    }
  }

  // MÉTODO QUE SE EJECUTA CUANDO EL COMPONENTE DESAPARECE DE LA PANTALLA
  ngOnDestroy() {
    // Si la suscripción a la radio está abierta, la cancelo para que no consuma RAM en segundo plano
    if (this.sub) this.sub.unsubscribe();
    // Me aseguro de quitar la herramienta del mapa por si el usuario se fue a otra página a mitad de un dibujo
    this.mapService.map.removeInteraction(this.drawInteraction);
  }
}