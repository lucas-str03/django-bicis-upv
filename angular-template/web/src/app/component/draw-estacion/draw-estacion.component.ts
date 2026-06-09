import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { EventService } from '../../services/event.service';
import { MapService } from '../../services/map.service';
import Draw from 'ol/interaction/Draw';
import WKT from 'ol/format/WKT';

@Component({
  selector: 'app-draw-estacion',
  standalone: true,
  imports: [],
  templateUrl: './draw-estacion.component.html',
  styleUrl: './draw-estacion.component.scss'
})
export class DrawEstacionComponent implements OnInit, OnDestroy {
  isActive: boolean = false;
  private sub!: Subscription;
  readonly TOOL_NAME = 'draw-estacion';
  private drawInteraction!: Draw;

  constructor(
    private eventService: EventService,
    private mapService: MapService,
    private router: Router
  ) {}

  ngOnInit() {
    this.drawInteraction = new Draw({
      source: this.mapService.estacionesVectorSource,
      type: 'Point'
    });

    this.sub = this.eventService.currentInteraction$.subscribe((activeTool: string) => {
      if (activeTool !== this.TOOL_NAME) {
        this.isActive = false;
        this.mapService.map.removeInteraction(this.drawInteraction);
      }
    });

    this.drawInteraction.on('drawend', (event) => {
      const geometry = event.feature.getGeometry();
      const wktFormat = new WKT();
      
      if (geometry) {
        const wktString = wktFormat.writeGeometry(geometry);
        console.log('Punto dibujado en WKT:', wktString);

        this.toggleDraw();

        this.router.navigate(['/estaciones'], {
          queryParams: { geom: wktString }
        });
      }
    });
  }

  toggleDraw() {
    this.isActive = !this.isActive;
    if (this.isActive) {
      this.eventService.activateInteraction(this.TOOL_NAME);
      this.mapService.map.addInteraction(this.drawInteraction);
    } else {
      this.eventService.activateInteraction('none');
      this.mapService.map.removeInteraction(this.drawInteraction);
    }
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
    this.mapService.map.removeInteraction(this.drawInteraction);
  }
}