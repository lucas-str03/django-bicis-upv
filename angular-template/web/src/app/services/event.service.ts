import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// @Injectable con 'root' significa que Angular crea una ÚNICA instancia de este servicio 
// para toda la aplicación (patrón Singleton). Todos los botones comparten el mismo servicio.
@Injectable({
  providedIn: 'root'
})
export class EventService {
  // Un Subject es como una emisora de radio. Puede emitir valores (mensajes) 
  // y permitir que otros se suscriban para escucharlos.
  private interactionSource = new Subject<string>();
  
  // asObservable() convierte la emisora en un canal de "solo escucha". 
  // Los componentes se suscriben a esta variable para enterarse de quién está activo, 
  // pero no pueden emitir mensajes directamente por aquí para no romper el flujo.
  currentInteraction$ = this.interactionSource.asObservable();

  // Este es el método que llaman los botones cuando se encienden o se apagan.
  // Recibe el nombre de la herramienta (ej. 'draw-carril') y lo emite (.next) por la radio.
  activateInteraction(toolName: string) {
    this.interactionSource.next(toolName);
  }
}