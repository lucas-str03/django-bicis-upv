import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon'; 
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service'; 
import { ActivatedRoute } from '@angular/router'; 
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: 'app-barrios',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatButtonModule,
    MatAutocompleteModule,
    MatIconModule 
  ],
  templateUrl: './barrios.component.html',
  styleUrl: './barrios.component.scss'
})
export class BarriosComponent implements OnInit {
  barrioForm: FormGroup;
  mensaje: string = '';

  opcionesBarrios: string[] = [
    'La Seu', 'La Xerea', 'El Carme', 'El Pilar', 'El Mercat', 'Sant Francesc',
    'Russafa', 'El Pla Del Remei', 'La Gran Via', 'Ruzafa',
    'El Botanic', 'La Roqueta', 'La Petxina', 'Arrancapins',
    'Campanar', 'Les Tendetes', 'El Calvari', 'Sant Pau',
    'Marxalenes', 'Morvedre', 'Trinitat', 'Tormos', 'Sant Antoni',
    'Els Orriols', 'Torrefiel', 'Sant Llorens',
    'Nou Moles', 'Soternes', 'Tres Forques', 'La Fontsanta', 'La Llum',
    'Patraix', 'Sant Isidre', 'Vara De Quart', 'Safranar', 'Favara',
    'La Raiosa', 'L\'Hort De Senabre', 'La Creu Coberta', 'Sant Marcel.li', 'Cami Real',
    'En Corts', 'Malilla', 'La Fonteta S.Lluis', 'Na Rovella', 'La Punta', 'Ciutat De Les Arts I De Les Ciencies',
    'El Grau', 'Cabanyal-Canyamelar', 'La Malva-Rosa', 'Betero', 'Natzaret',
    'Aiora', 'Albors', 'La Creu Del Grau', 'Cami Fondo', 'Penya-Roja',
    'La Vega Baixa', 'L\'Illa Perduda', 'Ciutat Jardi', 'L\'Amistat', 'La Carrasca',
    'Benimaclet', 'Cami De Vera',
    'Exposicio', 'Mestalla', 'Jaume Roig', 'Ciutat Universitaria',
    'Benicalap', 'Ciutat Fallera',
    'Benimamet', 'Beniferri', 'Carpesa', 'Poble Nou', 'Massarrojos', 'El Forn D\'Alcedo', 'La Torre', 'Pinedo', 'El Saler', 'El Palmar', 'El Perellonet', 'Mahuella-Tauladella', 'Rafalell-Vistabella', 'Borboto'
  ];

  filteredBarrios!: Observable<string[]>;

  constructor(private api: ApiService, private route: ActivatedRoute, public authService: AuthService) { 
    this.barrioForm = new FormGroup({
      objectid: new FormControl(''),
      coddistbar: new FormControl(''), 
      nombre: new FormControl('', [Validators.required]),
      geom: new FormControl('', [Validators.required]) 
    });
  }

  ngOnInit() {
    this.filteredBarrios = this.barrioForm.get('nombre')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterBarrios(value || ''))
    );

    this.route.paramMap.subscribe(params => {
      const idNombre = params.get('id');
      if (idNombre) {
        this.barrioForm.patchValue({ nombre: idNombre });
        this.mensaje = `Buscando barrio: ${idNombre}...`;
        this.selectOne();
      }
    });

    this.route.queryParams.subscribe(params => {
      const geom = params['geom'];
      if (geom) {
        this.barrioForm.patchValue({ geom: geom });
        this.mensaje = "Polígono del mapa cargado correctamente.";
      }
    });
  }

  private _filterBarrios(value: string): string[] {
    const filterValue = this.normalizeStr(value);
    return this.opcionesBarrios.filter(option => this.normalizeStr(option).includes(filterValue));
  }

  private normalizeStr(str: string): string {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  selectOne() {
    const nombreBarrio = this.barrioForm.value.nombre;
    if (!nombreBarrio) {
      this.mensaje = "Error: Escribe o selecciona un Nombre de Barrio para buscar.";
      return;
    }

    this.mensaje = "Consultando base de datos...";

    this.api.get('barrios').subscribe({
      next: (res) => {
        if (res.ok && res.data.length > 0) {
          const nombreBuscado = this.normalizeStr(nombreBarrio);
          let barrio = res.data.find((b: any) => this.normalizeStr(b.nombre) === nombreBuscado);
          
          if (!barrio) {
            barrio = res.data.find((b: any) => this.normalizeStr(b.nombre).includes(nombreBuscado));
          }

          if (!barrio) {
            this.mensaje = `Barrio '${nombreBarrio}' no encontrado en la base de datos.`;
            return;
          }

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

          // 1. Carga los datos alfanuméricos guardados de la base de datos
          this.barrioForm.patchValue(barrio);
          this.mensaje = `Barrio [${barrio.nombre}] recuperado con éxito.`;

          // CORRECCIÓN DE ASINCRONÍA (BLINDAJE):
          // Si venimos de editar gráficamente el mapa, extrae el parámetro 'geom' de la URL
          const geomDesdeMapa = this.route.snapshot.queryParams['geom'];
          if (geomDesdeMapa) {
            // Sobreescribe la geometría antigua de la BD con los nuevos vértices modificados
            this.barrioForm.patchValue({ geom: geomDesdeMapa });
            this.mensaje = `Barrio recuperado. ¡Nuevos vértices del mapa cargados listos para actualizar!`;
          }

        } else {
          this.mensaje = "No se pudieron recuperar los barrios de la base de datos.";
        }
      },
      error: (err) => {
        this.mensaje = "Error de comunicación con el servidor: " + err.message;
      }
    });
  }

  insert() {
    if (this.barrioForm.invalid) {
      this.mensaje = "Error: Revisa los campos marcados en rojo.";
      return;
    }
    this.api.post('barrios', this.barrioForm.value).subscribe({
      next: (res) => { if (res.ok) this.mensaje = "Barrio creado correctamente"; else this.mensaje = "Error al crear: " + res.message; },
      error: (err) => { this.mensaje = "Django dice: " + (err.error?.data ? JSON.stringify(err.error.data) : err.message); }
    });
  }

  update() {
    if (this.barrioForm.invalid) {
      this.mensaje = "Error: Revisa los campos marcados en rojo.";
      return;
    }
    this.api.put('barrios', this.barrioForm.value).subscribe({
      next: (res) => { if (res.ok) this.mensaje = "Barrio actualizado correctamente"; else this.mensaje = "Error al actualizar: " + res.message; },
      error: (err) => { this.mensaje = "Django dice: " + (err.error?.data ? JSON.stringify(err.error.data) : err.message); }
    });
  }

  delete() {
    this.api.delete('barrios', this.barrioForm.value).subscribe({
      next: (res) => { if (res.ok) { this.mensaje = "Barrio borrado correctamente"; this.barrioForm.reset(); } else this.mensaje = "Error al borrar: " + res.message; },
      error: (err) => { this.mensaje = "Error de conexión: " + err.message; }
    });
  }

  clean() { 
    this.barrioForm.reset(); 
    this.mensaje = "Formulario limpio"; 
  }

  selectAll() {
    this.api.get('barrios').subscribe({
      next: (res) => { if (res.ok) this.mensaje = `Select All: Se han recuperado ${res.data.length} barrios con éxito.`; },
      error: (err) => { this.mensaje = "Error al recuperar barrios: " + err.message; }
    });
  }
}