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
  isActive: boolean = false;
  private sub!: Subscription;
  readonly TOOL_NAME = 'edit-interaction';

  constructor(
    private eventService: EventService,
    private mapService: MapService 
  ) {}

  ngOnInit() {
    this.sub = this.eventService.currentInteraction$.subscribe((activeTool: string) => {
      if (activeTool !== this.TOOL_NAME) {
        this.isActive = false;
        this.mapService.toggleEditInteraction(false); 
      }
    });
  }

  toggleEdit() {
    this.isActive = !this.isActive;
    
    this.mapService.toggleEditInteraction(this.isActive);

    if (this.isActive) {
      this.eventService.activateInteraction(this.TOOL_NAME);
      console.log('Modo Edicion: ACTIVADO');
    } else {
      this.eventService.activateInteraction('none');
      console.log('Modo Edicion: DESACTIVADO');
    }
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
    this.mapService.toggleEditInteraction(false);
  }
}