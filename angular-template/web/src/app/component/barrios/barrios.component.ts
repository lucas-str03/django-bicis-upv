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
export class BarriosComponent implements OnInit {
  barrioForm: FormGroup;
  mensaje: string = '';

  constructor(private api: ApiService, private route: ActivatedRoute) { // Inyectamos ActivatedRoute
    this.barrioForm = new FormGroup({
      codigo_barrio: new FormControl('', [Validators.required]),
      nombre: new FormControl(''),
      geom: new FormControl('', [Validators.required])
    });
  }

  ngOnInit() {
    // Captura automática desde URL
    this.route.queryParams.subscribe(params => {
      const geom = params['geom'];
      if (geom) {
        this.barrioForm.patchValue({ geom: geom });
        this.mensaje = "Geometría de barrio cargada desde el mapa.";
      }
    });
  }

  // ... (tus métodos selectOne, insert, update, delete, clean, selectAll se mantienen igual)
  
  selectOne() {
    const cod = this.barrioForm.value.codigo_barrio;
    if (!cod) return;
    const parametros = new HttpParams().set('codigo_barrio', cod.toString());
    this.api.get('barrios', parametros).subscribe({
      next: (res) => {
        if (res.ok && res.data.length > 0) {
          const barrio = res.data[0];
          if (barrio.geom && typeof barrio.geom === 'object') {
            try {
              const polys = barrio.geom.coordinates.map((poly: any) => {
                const rings = poly.map((ring: any) => {
                  return '(' + ring.map((pt: any) => `${pt[0]} ${pt[1]}`).join(', ') + ')';
                }).join(', ');
                return `(${rings})`;
              }).join(', ');
              barrio.geom = `MULTIPOLYGON(${polys})`;
            } catch (e) { barrio.geom = JSON.stringify(barrio.geom); }
          }
          this.barrioForm.patchValue(barrio);
          this.mensaje = "Barrio recuperado con éxito";
        } else { this.mensaje = "No encontrado"; }
      },
      error: (err) => { this.mensaje = "Error: " + err.message; }
    });
  }

  insert() {
    this.api.post('barrios', this.barrioForm.value).subscribe({
      next: (res) => { if (res.ok) { this.mensaje = "Barrio creado correctamente"; } else { this.mensaje = "Error al crear: " + res.message; } },
      error: (err) => { this.mensaje = "Django dice: " + (err.error?.data ? JSON.stringify(err.error.data) : err.message); }
    });
  }

  update() {
    this.api.put('barrios', this.barrioForm.value).subscribe({
      next: (res) => { if (res.ok) { this.mensaje = "Barrio actualizado correctamente"; } else { this.mensaje = "Error al actualizar: " + res.message; } },
      error: (err) => { this.mensaje = "Django dice: " + (err.error?.data ? JSON.stringify(err.error.data) : err.message); }
    });
  }

  delete() {
    this.api.delete('barrios', this.barrioForm.value).subscribe({
      next: (res) => { if (res.ok) { this.mensaje = "Barrio borrado correctamente"; this.barrioForm.reset(); } else { this.mensaje = "Error al borrar: " + res.message; } },
      error: (err) => { this.mensaje = "Error de conexión: " + err.message; }
    });
  }

  clean() { this.barrioForm.reset(); this.mensaje = "Formulario limpio"; }

  selectAll() {
    this.api.get('barrios').subscribe({
      next: (res) => { if (res.ok) { this.mensaje = `Select All: Se han recuperado ${res.data.length} barrios con éxito.`; } },
      error: (err) => { this.mensaje = "Error al recuperar barrios: " + err.message; }
    });
  }
}