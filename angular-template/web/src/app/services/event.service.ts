import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private interactionSource = new Subject<string>();
  currentInteraction$ = this.interactionSource.asObservable();

  activateInteraction(toolName: string) {
    this.interactionSource.next(toolName);
  }
}