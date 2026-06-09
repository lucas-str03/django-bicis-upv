import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventService } from '../../services/event.service';



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

  constructor(private eventService: EventService) {}

  ngOnInit() {
    this.sub = this.eventService.currentInteraction$.subscribe((activeTool: string) => {
      if (activeTool !== this.TOOL_NAME) this.isActive = false;
    });
  }

  toggleEdit() {
    this.isActive = !this.isActive;
    if (this.isActive) {
      this.eventService.activateInteraction(this.TOOL_NAME);
      console.log('Modo Edición: ACTIVADO');
    } else {
      this.eventService.activateInteraction('none');
      console.log('Modo Edición: DESACTIVADO');
    }
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}