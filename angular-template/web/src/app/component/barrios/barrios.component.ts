import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute } from '@angular/router'; 

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

  constructor(private api: ApiService, private route: ActivatedRoute) { 
    this.barrioForm = new FormGroup({
      objectid: new FormControl(''), // ⚠️ Clave primaria real en PostgreSQL
      codigo_barrio: new FormControl('', [Validators.required]),
      nombre: new FormControl(''),
      coddistbar: new FormControl(''),
      geom: new FormControl('', [Validators.required])
    });
  }

  // Manejo del modo selección por ID (/barrios/:id) y modo dibujo (?geom=...)
  ngOnInit() {
    // 1. MODO SELECCIÓN: Capturamos el objectid de la barra de direcciones
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        // Guardamos el objectid en el control del formulario
        this.barrioForm.patchValue({ objectid: id });
        this.mensaje = "Buscando datos del barrio en PostGIS...";
        
        // Lanzamos la búsqueda automática
        this.selectOne();
      }
    });

    // 2. MODO DIBUJO: Capturamos la geometría si venimos de pintar en el mapa
    this.route.queryParams.subscribe(params => {
      const geom = params['geom'];
      if (geom) {
        this.barrioForm.patchValue({ geom: geom });
        this.mensaje = "Polígono del mapa cargado correctamente.";
      }
    });
  }

  // 1. SELECT ONE (GET) - Adaptado para barrios con objectid
  selectOne() {
    const objId = this.barrioForm.value.objectid;
    if (!objId) return;

    // El parámetro enviado se llama estrictamente 'objectid'
    const parametros = new HttpParams().set('objectid', objId.toString());

    this.api.get('barrios', parametros).subscribe({
      next: (res) => {
        if (res.ok && res.data.length > 0) {
          const barrio = res.data[0];

          // Traductor de GeoJSON a WKT para MultiPolygon
          if (barrio.geom && typeof barrio.geom === 'object') {
            try {
              if (barrio.geom.type === 'MultiPolygon' && barrio.geom.coordinates) {
                const polygons = barrio.geom.coordinates.map((poly: any) => {
                  return '((' + poly[0].map((pt: any) => `${pt[0]} ${pt[1]}`).join(', ') + '))';
                }).join(', ');
                barrio.geom = `MULTIPOLYGON(${polygons})`;
              }
            } catch (e) {
              barrio.geom = JSON.stringify(barrio.geom);
            }
          }

          // Rellenamos el formulario con los datos reales devueltos por Django
          this.barrioForm.patchValue(barrio);
          this.mensaje = `Barrio [${barrio.nombre}] recuperado con éxito.`;
        } else {
          this.mensaje = "Barrio no encontrado en la base de datos.";
        }
      },
      error: (err) => {
        this.mensaje = "Error de comunicación con el servidor: " + err.message;
      }
    });
  }

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
        this.mensaje = "Django dice: " + (err.error?.data ? JSON.stringify(err.error.data) : err.message); 
      }
    });
  }

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
        this.mensaje = "Django dice: " + (err.error?.data ? JSON.stringify(err.error.data) : err.message); 
      }
    });
  }

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

  clean() { 
    this.barrioForm.reset(); 
    this.mensaje = "Formulario limpio"; 
  }

  selectAll() {
    this.api.get('barrios').subscribe({
      next: (res) => { 
        if (res.ok) { 
          this.mensaje = `Select All: Se han recuperado ${res.data.length} barrios con éxito.`; 
        } 
      },
      error: (err) => { 
        this.mensaje = "Error al recuperar barrios: " + err.message; 
      }
    });
  }
}