import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-estaciones',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatButtonModule
  ],
  templateUrl: './estaciones.component.html',
  styleUrl: './estaciones.component.scss'
})
export class EstacionesComponent {
  estacionForm: FormGroup;
  mensaje: string = '';

  constructor(private api: ApiService) {
      this.estacionForm = new FormGroup({
        numero: new FormControl('', [Validators.required]),
        nombre: new FormControl(''),
        capacidad: new FormControl(0),
        bicis_disponibles: new FormControl(0),
        bornes_libres: new FormControl(0),
        geom: new FormControl('', [Validators.required]) 
      });
    }

  selectOne() {
      const num = this.estacionForm.value.numero;
      if (!num) return;

      const parametros = new HttpParams().set('numero', num.toString());

      this.api.get('estaciones', parametros).subscribe({
        next: (res) => {
          if (res.ok && res.data.length > 0) {
            const estacion = res.data[0];


            if (estacion.geom && typeof estacion.geom === 'object') {
              const coords = estacion.geom.coordinates;
              estacion.geom = `POINT(${coords[0]} ${coords[1]})`;
            }

            this.estacionForm.patchValue(estacion);
            this.mensaje = "Estación recuperada con éxito";
          } else {
            this.mensaje = "No encontrada";
          }
        },
        error: (err) => {
          this.mensaje = "Error: " + err.message;
        }
      });
    }

// 2. INSERTAR (POST)
  insert() {
    this.api.post('estaciones', this.estacionForm.value).subscribe({
      next: (res) => {
        if (res.ok) {
          this.mensaje = "Estación creada correctamente";
        } else {
          this.mensaje = "Error al crear: " + res.message;
        }
      },
      error: (err) => {
        // AQUÍ ESTÁ EL TRUCO: Leemos la respuesta interna de Django
        const detalles = err.error && err.error.data ? JSON.stringify(err.error.data) : err.message;
        this.mensaje = "Django dice: " + detalles;
        console.log("Error de Django:", err.error); // Para que salga en el F12 también
      }
    });
  }

  // 3. ACTUALIZAR (PUT)
  update() {
    this.api.put('estaciones', this.estacionForm.value).subscribe({
      next: (res) => {
        if (res.ok) {
          this.mensaje = "Estación actualizada correctamente";
        } else {
          this.mensaje = "Error al actualizar: " + res.message;
        }
      },
      error: (err) => {
        this.mensaje = "Error de conexión: " + err.message;
      }
    });
  }

  // 4. BORRAR (DELETE)
  delete() {
    this.api.delete('estaciones', this.estacionForm.value).subscribe({
      next: (res) => {
        if (res.ok) {
          this.mensaje = "Estación borrada correctamente";
          this.estacionForm.reset(); // Vaciamos los campos tras borrar
        } else {
          this.mensaje = "Error al borrar: " + res.message;
        }
      },
      error: (err) => {
        this.mensaje = "Error de conexión: " + err.message;
      }
    });
  }

  // LIMPIAR PANTALLA
  clean() {
    this.estacionForm.reset();
    this.mensaje = "Formulario limpio";
  }

  // 5. SELECT ALL (GET sin parámetros)
  selectAll() {
    this.api.get('estaciones').subscribe({
      next: (res) => {
        if (res.ok) {
          // 'res.data' ahora contiene un array con todas las estaciones
          const total = res.data.length;
          this.mensaje = `Select All: Se han recuperado ${total} estaciones con éxito.`;
          console.log("Lista completa:", res.data); 
        }
      },
      error: (err) => {
        this.mensaje = "Error al recuperar todos: " + err.message;
      }
    });
  }
}