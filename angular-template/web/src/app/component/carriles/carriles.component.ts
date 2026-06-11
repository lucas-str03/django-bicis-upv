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
export class CarrilesComponent implements OnInit {
  carrilForm: FormGroup;
  mensaje: string = '';

  // Diccionario oficial de traducción de estados
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

  constructor(private api: ApiService, private route: ActivatedRoute) {
    this.carrilForm = new FormGroup({
      id: new FormControl(''), // Control para el identificador numérico
      tipo: new FormControl(''),
      longitud: new FormControl(0), // Control para la longitud en metros
      geom: new FormControl('', [Validators.required]) 
    });
  }

  ngOnInit() {
    // 1. MODO SELECCIÓN (/carriles/:id)
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.carrilForm.patchValue({ id: id });
        this.mensaje = "Buscando datos del carril bici...";
        this.selectOne();
      }
    });

    // 2. MODO DIBUJO (?geom=...)
    this.route.queryParams.subscribe(params => {
      const coordenadaWKT = params['geom'];
      if (coordenadaWKT) {
        this.carrilForm.patchValue({ geom: coordenadaWKT });
        this.mensaje = "Coordenadas del mapa cargadas correctamente.";
      }
    });
  }

  // 1. SELECT ONE (GET)
  selectOne() {
    const idFormulario = this.carrilForm.value.id;
    
    // Chivato en la consola del navegador para ver si lee el cuadro de texto
    console.log("Valor de ID leído desde el formulario:", idFormulario);

    if (!idFormulario) {
      this.mensaje = "⚠️ Error: El campo ID está vacío. Escribe un número o pincha en el mapa.";
      return; 
    }

    // ⚠️ CORRECCIÓN CRÍTICA: Cambiado a 'objectid' para que Django aplique el filtro
    // y devuelva solo 1 registro en lugar de los 1449 carriles.
    const parametros = new HttpParams().set('objectid', idFormulario.toString());
    this.mensaje = "Consultando base de datos...";

    this.api.get('carriles', parametros).subscribe({
      next: (res) => {
        console.log("Respuesta cruda de Django:", res);

        if (res.ok && res.data.length > 0) {
          // Por seguridad, si Django aún devolviera una lista, buscamos el que coincida o extraemos el primero
          const carril = res.data.find((c: any) => (c.objectid || c.id)?.toString() === idFormulario.toString()) || res.data[0];
          console.log("Campos del carril único recuperado:", carril);

          const keys = Object.keys(carril);
          
          // 📏 EXTRAER LONGITUD: Buscamos cualquier columna que contenga 'length' o 'shape' (ej: st_length(shape))
          const lengthKey = keys.find(k => k.toLowerCase().includes('length') || k.toLowerCase().includes('shape'));
          carril.longitud = lengthKey ? carril[lengthKey] : 0; 

          // 🏷️ TRADUCIR TIPO: Buscamos dinámicamente la columna del estado (puede ser 'estado' o 'tipo')
          const estadoKey = keys.find(k => k.toLowerCase().includes('estado') || k.toLowerCase().includes('tipo'));
          const estadoValor = estadoKey ? carril[estadoKey] : null;

          if (estadoValor) {
            carril.tipo = this.ESTADOS_MAP[estadoValor.toString()] || `Tipo desconocido (${estadoValor})`;
          } else {
            carril.tipo = 'No especificado';
          }

          // Aseguramos que la clave primaria se asigne correctamente de vuelta al control del formulario
          carril.id = carril.objectid || carril.id;

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

          // Inyectamos todos los valores procesados en las casillas del formulario HTML
          this.carrilForm.patchValue(carril);
          this.mensaje = `Carril [${carril.tipo}] recuperado con éxito.`;
        } else {
          this.mensaje = "❌ Carril bici no encontrado en la base de datos.";
        }
      },
      error: (err) => {
        this.mensaje = "Error de comunicación: " + err.message;
      }
    });
  }

  insert() {
    this.api.post('carriles', this.carrilForm.value).subscribe({
      next: (res) => { if (res.ok) { this.mensaje = "Carril creado correctamente"; } else { this.mensaje = "Error al crear: " + res.message; } },
      error: (err) => { this.mensaje = "Error: " + err.message; }
    });
  }

  update() {
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
      next: (res) => { if (res.ok) { this.mensaje = `Se han recuperado ${res.data.length} carriles con éxito.`; } },
      error: (err) => { this.mensaje = "Error: " + err.message; }
    });
  }
}