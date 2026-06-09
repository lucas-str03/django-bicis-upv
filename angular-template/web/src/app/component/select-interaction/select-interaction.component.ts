import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventService } from '../../services/event.service';



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

  constructor(private eventService: EventService) {}

  ngOnInit() {
    this.sub = this.eventService.currentInteraction$.subscribe((activeTool: string) => {
      if (activeTool !== this.TOOL_NAME) this.isActive = false;
    });
  }

  toggleSelect() {
    this.isActive = !this.isActive;
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
  }
}