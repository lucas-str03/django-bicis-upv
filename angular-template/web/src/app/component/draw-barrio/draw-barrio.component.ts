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
export class DrawBarrioComponent implements OnInit, OnDestroy {
  isActive: boolean = false;
  private sub!: Subscription;
  readonly TOOL_NAME = 'draw-barrio';
  private drawInteraction!: Draw;

  constructor(
    private eventService: EventService,
    private mapService: MapService,
    private router: Router
  ) {}

  ngOnInit() {
    this.drawInteraction = new Draw({
      source: this.mapService.barriosVectorSource,
      type: 'Polygon'
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
        console.log('Polígono dibujado en WKT:', wktString);

        this.toggleDraw();

        // ruta barrio
        this.router.navigate(['/barrios'], {
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