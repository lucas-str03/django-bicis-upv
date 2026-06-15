import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon'; // Importante
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service'; // Servicio de roles
import { ActivatedRoute } from '@angular/router'; 
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: 'app-carriles',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatButtonModule,
    MatAutocompleteModule,
    MatIconModule // Añadido
  ],
  templateUrl: './carriles.component.html',
  styleUrl: './carriles.component.scss'
})
export class CarrilesComponent implements OnInit {
  carrilForm: FormGroup;
  mensaje: string = '';

  opcionesTipos: string[] = [
    'Carril Bici',
    'Ciclo Carrers / Ciclo Calles',
    'Carrers de Vianants / Calles Peatonales',
    'Carril Bici Jardí del Túria',
    'Tallat per obres',
    'Senda Ciclable',
    'Carril Bus-Bici',
    'Ciclobarrio / Ciclobarrio'
  ];

  filteredTipos!: Observable<string[]>;

  private ESTADOS_MAP: { [key: string]: string } = {
    '1': 'Carril Bici',
    '8': 'Carril Bici',
    '2': 'Ciclo Carrers / Ciclo Calles',
    '3': 'Carrers de Vianants / Calles Peatonales',
    '4': 'Carril Bici Jardí del Túria',
    '5': 'Tallat per obres',
    '6': 'Senda Ciclable',
    '7': 'Carril Bus-Bici',
    '9': 'Ciclobarrio / Ciclobarrio'
  };

  // Inyectamos authService como public
  constructor(private api: ApiService, private route: ActivatedRoute, public authService: AuthService) {
    this.carrilForm = new FormGroup({
      id: new FormControl('', [Validators.required, Validators.min(1)]), 
      tipo: new FormControl('', [Validators.required]),
      longitud: new FormControl(0, [Validators.min(0)]), 
      geom: new FormControl('', [Validators.required]) 
    });
  }

  ngOnInit() {
    // Configuracion del filtro en tiempo real para el Autocomplete
    this.filteredTipos = this.carrilForm.get('tipo')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterTipos(value || ''))
    );

    // MODO SELECCION
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.carrilForm.patchValue({ id: id });
        this.mensaje = "Buscando datos del carril bici...";
        this.selectOne();
      }
    });

    // MODO DIBUJO
    this.route.queryParams.subscribe(params => {
      const coordenadaWKT = params['geom'];
      if (coordenadaWKT) {
        this.carrilForm.patchValue({ geom: coordenadaWKT });
        this.mensaje = "Coordenadas del mapa cargadas correctamente.";
      }
    });
  }

  // Logica interna del Autocomplete para filtrar resultados segun lo escrito
  private _filterTipos(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.opcionesTipos.filter(option => option.toLowerCase().includes(filterValue));
  }

  selectOne() {
    const idFormulario = this.carrilForm.value.id;
    console.log("Valor de ID leido desde el formulario:", idFormulario);

    if (!idFormulario) {
      this.mensaje = "Error: El campo ID esta vacio. Escribe un numero o pincha en el mapa.";
      return; 
    }

    const parametros = new HttpParams().set('objectid', idFormulario.toString());
    this.mensaje = "Consultando base de datos...";

    this.api.get('carriles', parametros).subscribe({
      next: (res) => {
        console.log("Respuesta cruda de Django:", res);

        if (res.ok && res.data.length > 0) {
          const carril = res.data.find((c: any) => (c.objectid || c.id)?.toString() === idFormulario.toString()) || res.data[0];
          console.log("Campos del carril unico recuperado:", carril);

          const keys = Object.keys(carril);
          
          const lengthKey = keys.find(k => k.toLowerCase().includes('length') || k.toLowerCase().includes('shape'));
          carril.longitud = lengthKey ? carril[lengthKey] : 0; 

          const estadoKey = keys.find(k => k.toLowerCase().includes('estado') || k.toLowerCase().includes('tipo'));
          const estadoValor = estadoKey ? carril[estadoKey] : null;

          if (estadoValor) {
            carril.tipo = this.ESTADOS_MAP[estadoValor.toString()] || `Tipo desconocido (${estadoValor})`;
          } else {
            carril.tipo = 'No especificado';
          }

          carril.id = carril.objectid || carril.id;

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

          // 1. Rellenamos el formulario con los datos antiguos de la BD
          this.carrilForm.patchValue(carril);
          this.mensaje = `Carril [${carril.tipo}] recuperado con exito.`;

          // 2. CORRECCIÓN DE ASINCRONÍA (BLINDAJE):
          // Rescatamos la nueva geometría (MULTILINESTRING) si venimos de arrastrar sus vértices en el mapa
          const geomDesdeMapa = this.route.snapshot.queryParams['geom'];
          if (geomDesdeMapa) {
            this.carrilForm.patchValue({ geom: geomDesdeMapa });
            this.mensaje = `Carril bici recuperado. ¡Nuevos vértices cargados desde el mapa listos para guardar!`;
          }

        } else {
          this.mensaje = "Carril bici no encontrado en la base de datos.";
        }
      },
      error: (err) => {
        this.mensaje = "Error de comunicacion: " + err.message;
      }
    });
  }

  insert() {
    // Validacion de seguridad antes de enviar
    if (this.carrilForm.invalid) {
      this.mensaje = "Error: Faltan datos obligatorios o hay campos incorrectos.";
      return;
    }
    this.api.post('carriles', this.carrilForm.value).subscribe({
      next: (res) => { if (res.ok) { this.mensaje = "Carril creado correctamente"; } else { this.mensaje = "Error al crear: " + res.message; } },
      error: (err) => { this.mensaje = "Error: " + err.message; }
    });
  }

  update() {
    if (this.carrilForm.invalid) {
      this.mensaje = "Error: Faltan datos obligatorios o hay campos incorrectos.";
      return;
    }
    this.api.put('carriles', this.carrilForm.value).subscribe({
      next: (res) => { if (res.ok) { this.mensaje = "Carril actualizado correctamente"; } else { this.mensaje = "Error al actualizar: " + res.message; } },
      error: (err) => { this.mensaje = "Error: " + err.message; }
    });
  }

  delete() {
    this.api.delete('carriles', this.carrilForm.value).subscribe({
      next: (res) => { if (res.ok) { this.mensaje = "Carril borrado correctamente"; this.carrilForm.reset(); } else { this.mensaje = "Error al borrar: " + res.message; } },
      error: (err) => { this.mensaje = "Error: " + err.message; }
    });
  }

  clean() { 
    this.carrilForm.reset(); 
    this.mensaje = "Formulario limpio"; 
  }

  selectAll() {
    this.api.get('carriles').subscribe({
      next: (res) => { if (res.ok) { this.mensaje = `Se han recuperado ${res.data.length} carriles con exito.`; } },
      error: (err) => { this.mensaje = "Error: " + err.message; }
    });
  }
}