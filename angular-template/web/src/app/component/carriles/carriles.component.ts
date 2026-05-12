import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-carriles',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatButtonModule
  ],
  templateUrl: './carriles.component.html',
  styleUrl: './carriles.component.scss'
})
export class CarrilesComponent {
  carrilForm: FormGroup;
  mensaje: string = '';

  constructor(private api: ApiService) {
    this.carrilForm = new FormGroup({
      id: new FormControl(''), // Clave primaria por defecto en Django
      tipo: new FormControl(''),
      longitud: new FormControl(0),
      geom: new FormControl('', [Validators.required]) // MultiLineString
    });
  }

  // 1. SELECT ONE (GET)
  selectOne() {
    const id = this.carrilForm.value.id;
    if (!id) return;

    const parametros = new HttpParams().set('id', id.toString());

    this.api.get('carriles', parametros).subscribe({
      next: (res) => {
        if (res.ok && res.data.length > 0) {
          const carril = res.data[0];

          // Traductor de GeoJSON a WKT para MultiLineString
          if (carril.geom && typeof carril.geom === 'object') {
            try {
              const lines = carril.geom.coordinates.map((line: any) => {
                return '(' + line.map((pt: any) => `${pt[0]} ${pt[1]}`).join(', ') + ')';
              }).join(', ');
              carril.geom = `MULTILINESTRING(${lines})`;
            } catch (e) {
              carril.geom = JSON.stringify(carril.geom);
            }
          }

          this.carrilForm.patchValue(carril);
          this.mensaje = "Carril recuperado con éxito";
        } else {
          this.mensaje = "No encontrado";
        }
      },
      error: (err) => {
        this.mensaje = "Error: " + err.message;
      }
    });
  }

  // 2. INSERTAR (POST)
  insert() {
    this.api.post('carriles', this.carrilForm.value).subscribe({
      next: (res) => {
        if (res.ok) {
          this.mensaje = "Carril bici creado correctamente";
        } else {
          this.mensaje = "Error: " + res.message;
        }
      },
      error: (err) => {
        const detalles = err.error && err.error.data ? JSON.stringify(err.error.data) : err.message;
        this.mensaje = "Django dice: " + detalles;
      }
    });
  }

  // 3. ACTUALIZAR (PUT)
  update() {
    this.api.put('carriles', this.carrilForm.value).subscribe({
      next: (res) => {
        if (res.ok) {
          this.mensaje = "Carril bici actualizado correctamente";
        } else {
          this.mensaje = "Error: " + res.message;
        }
      },
      error: (err) => {
        const detalles = err.error && err.error.data ? JSON.stringify(err.error.data) : err.message;
        this.mensaje = "Django dice: " + detalles;
      }
    });
  }

  // 4. BORRAR (DELETE)
  delete() {
    this.api.delete('carriles', this.carrilForm.value).subscribe({
      next: (res) => {
        if (res.ok) {
          this.mensaje = "Carril bici borrado correctamente";
          this.carrilForm.reset();
        } else {
          this.mensaje = "Error al borrar: " + res.message;
        }
      },
      error: (err) => {
        this.mensaje = "Error de conexión: " + err.message;
      }
    });
  }

  clean() {
    this.carrilForm.reset();
    this.mensaje = "Formulario limpio";
  }

  // Select ALL
  selectAll() {
  this.api.get('carriles').subscribe({
    next: (res) => {
      if (res.ok) {
        this.mensaje = `Select All: Se han recuperado ${res.data.length} carriles bici.`;
        console.log("Listado de carriles:", res.data);
      }
    },
    error: (err) => {
      this.mensaje = "Error al recuperar carriles: " + err.message;
    }
  });
}

}