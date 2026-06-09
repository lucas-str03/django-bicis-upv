import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute } from '@angular/router'; // Import necesario

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
export class EstacionesComponent implements OnInit {
  estacionForm: FormGroup;
  mensaje: string = '';

  constructor(private api: ApiService, private route: ActivatedRoute) {
    this.estacionForm = new FormGroup({
      numero: new FormControl('', [Validators.required]),
      nombre: new FormControl(''),
      capacidad: new FormControl(0),
      bicis_disponibles: new FormControl(0),
      bornes_libres: new FormControl(0),
      geom: new FormControl('', [Validators.required]) 
    });
  }

  ngOnInit() {
    // Captura automática desde URL
    this.route.queryParams.subscribe(params => {
      const geom = params['geom'];
      if (geom) {
        this.estacionForm.patchValue({ geom: geom });
        this.mensaje = "Coordenada de estación cargada desde el mapa.";
      }
    });
  }

  // ... (tus otros métodos se mantienen igual)

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
        } else { this.mensaje = "No encontrada"; }
      },
      error: (err) => { this.mensaje = "Error: " + err.message; }
    });
  }

  insert() {
    this.api.post('estaciones', this.estacionForm.value).subscribe({
      next: (res) => { if (res.ok) { this.mensaje = "Estación creada correctamente"; } else { this.mensaje = "Error al crear: " + res.message; } },
      error: (err) => { this.mensaje = "Django dice: " + (err.error?.data ? JSON.stringify(err.error.data) : err.message); }
    });
  }

  update() {
    this.api.put('estaciones', this.estacionForm.value).subscribe({
      next: (res) => { if (res.ok) { this.mensaje = "Estación actualizada correctamente"; } else { this.mensaje = "Error al actualizar: " + res.message; } },
      error: (err) => { this.mensaje = "Error de conexión: " + err.message; }
    });
  }

  delete() {
    this.api.delete('estaciones', this.estacionForm.value).subscribe({
      next: (res) => { if (res.ok) { this.mensaje = "Estación borrada correctamente"; this.estacionForm.reset(); } else { this.mensaje = "Error al borrar: " + res.message; } },
      error: (err) => { this.mensaje = "Error de conexión: " + err.message; }
    });
  }

  clean() { this.estacionForm.reset(); this.mensaje = "Formulario limpio"; }

  selectAll() {
    this.api.get('estaciones').subscribe({
      next: (res) => { if (res.ok) { this.mensaje = `Select All: Se han recuperado ${res.data.length} estaciones con éxito.`; } },
      error: (err) => { this.mensaje = "Error al recuperar todos: " + err.message; }
    });
  }
}