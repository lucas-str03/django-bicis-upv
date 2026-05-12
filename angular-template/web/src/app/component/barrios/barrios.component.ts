import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-barrios',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatButtonModule
  ],
  templateUrl: './barrios.component.html',
  styleUrl: './barrios.component.scss'
})
export class BarriosComponent {
  barrioForm: FormGroup;
  mensaje: string = '';

  constructor(private api: ApiService) {
    this.barrioForm = new FormGroup({
      codigo_barrio: new FormControl('', [Validators.required]), // Clave primaria
      nombre: new FormControl(''),
      geom: new FormControl('', [Validators.required]) // MultiPolygon
    });
  }

  // 1. SELECT ONE (GET)
  selectOne() {
    const cod = this.barrioForm.value.codigo_barrio;
    if (!cod) return;

    // Usamos 'codigo_barrio' en lugar de 'numero'
    const parametros = new HttpParams().set('codigo_barrio', cod.toString());

    this.api.get('barrios', parametros).subscribe({
      next: (res) => {
        if (res.ok && res.data.length > 0) {
          const barrio = res.data[0];

          // Traductor de GeoJSON a WKT para MultiPolygon
          if (barrio.geom && typeof barrio.geom === 'object') {
            try {
              const polys = barrio.geom.coordinates.map((poly: any) => {
                const rings = poly.map((ring: any) => {
                  return '(' + ring.map((pt: any) => `${pt[0]} ${pt[1]}`).join(', ') + ')';
                }).join(', ');
                return `(${rings})`;
              }).join(', ');
              barrio.geom = `MULTIPOLYGON(${polys})`;
            } catch (e) {
              barrio.geom = JSON.stringify(barrio.geom); // Plan B por si falla
            }
          }

          this.barrioForm.patchValue(barrio);
          this.mensaje = "Barrio recuperado con éxito";
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
    this.api.post('barrios', this.barrioForm.value).subscribe({
      next: (res) => {
        if (res.ok) {
          this.mensaje = "Barrio creado correctamente";
        } else {
          this.mensaje = "Error al crear: " + res.message;
        }
      },
      error: (err) => {
        const detalles = err.error && err.error.data ? JSON.stringify(err.error.data) : err.message;
        this.mensaje = "Django dice: " + detalles;
        console.log("Error de Django:", err.error);
      }
    });
  }

  // 3. ACTUALIZAR (PUT)
  update() {
    this.api.put('barrios', this.barrioForm.value).subscribe({
      next: (res) => {
        if (res.ok) {
          this.mensaje = "Barrio actualizado correctamente";
        } else {
          this.mensaje = "Error al actualizar: " + res.message;
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
    this.api.delete('barrios', this.barrioForm.value).subscribe({
      next: (res) => {
        if (res.ok) {
          this.mensaje = "Barrio borrado correctamente";
          this.barrioForm.reset();
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
    this.barrioForm.reset();
    this.mensaje = "Formulario limpio";
  }

  // Select All
  selectAll() {
  this.api.get('barrios').subscribe({
    next: (res) => {
      if (res.ok) {
        // Mostramos el conteo en el párrafo de mensaje como pide el PDF
        this.mensaje = `Select All: Se han recuperado ${res.data.length} barrios con éxito.`;
        console.log("Listado de barrios:", res.data);
      }
    },
    error: (err) => {
      this.mensaje = "Error al recuperar barrios: " + err.message;
    }
  });
  }

}