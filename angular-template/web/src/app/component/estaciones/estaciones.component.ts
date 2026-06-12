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
  selector: 'app-estaciones',
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
  templateUrl: './estaciones.component.html',
  styleUrl: './estaciones.component.scss'
})
export class EstacionesComponent implements OnInit {
  estacionForm: FormGroup;
  mensaje: string = '';

  opcionesEstaciones: string[] = [
    "209_AVDA_GASPAR_AGUILAR_ESQ_CALLE_MUSICO_PENELLA", "77_C/ MOLINELL", "007_PZA_DEL_MERCADO_TAULA_DE_CANVIS", "008_PLAZA_DE_LA_REINA_ESQUINA_CALLE_DEL_MAR", "018_COLON II", "025_CALLE_DEL_ALBERIC", "029_PLAZA AMERICA", "036_PZA_LOS_FUEROS_CONDE_TRENOR", "44_AVDA. GRAL. URRUTIA", "130_C/ CONVENTO CARMELITAS", "142_C/ GREGORIO GEA (PEATONAL)", "143_AVDA. MENENDEZ PIDAL", "004_PLAZA_DE_LA_VIRGEN_CALLE_BAILIA", "023_GRAN_VIA_FERNANDO_EL_CATOLICO", "027_CALLE_SAN_VICENTE_MARTIR_129", "46_AVDA. INSTITUTO OBRERO DE VALENCIA", "70_CALLE_COLON_ESQ_ALMIRANTE_ROGER_DE_LAURIA", "072_RAMIRO MAETZU", "95_AVDA. DE LOS NARANJOS", "097_AVDA. BLASCO IBAÑEZ 7", "132_C/ RUAYA", "140_AVENIDA_CAMPANAR", "193_CALLE_CARTEROS", "272_VICENTE_LA_RODA_C_INGENIERO_FAUSTO_ELIO", "005_PINTOR_LOPEZ_PZA_POETA_LLORENTE", "009_PLAZA_TETUAN_4", "34_AVDA. ANTIGUO REINO DE VALENCIA", "38_AVDA. PERIS Y VALERO", "40_CALLE_BARCAS_FRENTE _TEATRO_PRINCIPAL", "42_AVDA. DE LA PLATA", "163_PASEO NEPTUNO", "137_CALLE_ECONOMISTA_GAY", "138_SAN_PANCRACIO", "006_GUILLEN_CASTRO_CON_CALLE_SAN_PEDRO_PASCUAL", "059_AVDA. DE BALEARES I", "144_CALLE_MARQUES_DE_SAN_JUAN", "064_AVDA. DEL PUERTO II", "066_GUILLEN DE ANGLESOLA", "068_AVDA. DEL PUERTO IV", "134_C/ MAXIMILIANO THOUS", "135_AVDA. CONSTITUCIÓN", "136_CALLE_ECONOMISTA_GAY", "158_DR. LLUCH", "160_JOSE MARIA DE HARO", "161_MEDITERRANEO", "165_PAVIA 2", "169_PAVIA 4", "190_CTRA_MALILLA", "191_CTRA_MALILLA", "010_CALLE_DEL_HOSPITAL_FRENTE_CALLE_HORNO_DEL_HOSP", "012_CALLE_MINYANA", "014_BARÓN CARCER", "016_COLON I", "195_CALLE_GIORGETA", "211_CALLE_FRAY_JUNÍPERO_SERRA_ESQ_CALLE_VALL_D'UIX", "071_AVDA DEL PUERTO VI", "073_JERONIMO MONSORIU", "164_PAVIA 1", "171_CALLE GRAN CANARIA", "175_CALLE_JUAN_XXIII", "177_CALLE_ALCUDIA", "184_CALLE_BOMBER_RAMON_DUART", "223_CALLE_VALLE_BALLESTERA_ESQ_PLAZA_POLICIA_LOCAL", "227_CALLE_SAN_CLEMENTE_ENTRA_HOSPITAL_ARNAU_VILANO", "247_AVDA_TRES_CRUCES_MUSICO_AYLLON", "011_PZA_AYTO_CON_CALLE_COTANDA", "013_PZA. ALFONSO MAGNANIMO_CON_CALLE_LA_NAVE", "015_RIBERA", "017_ESTACION RENFE I", "249_AVDA_TRES_CRUCES_SEGUNDA_REPUBLICA_ESPAÑOLA", "251_ARQUITECTO_SEGURA_LAGO_CAMINO_NUEVO_DE_PICAÑA", "019_JUAN_LLORENS", "021_JUAN_LLORENS_29", "094_AVDA. BLASCO IBAÑEZ 5", "173_AVENIDA_PIO_XII_34", "180_AVENIDA_DOCTOR_WAKSMAN", "186_CALLE_INGENIERO_JOAQUIN_BENLLOCH", "228_AVDA_NICASIO_BENLLOCH_ESQ_CALLE_L'HORTA_SUD", "230_CALLE_POETA_SERRANO_CLAVERO_EQ_GENERAL_LLORENS", "020_FERNANDO_EL_CATOLICO_CALLE_QUART", "022_JUAN_LLORENS_57", "024_GRAN_VIA_RAMON_Y_CAJAL", "026_CALLE_SAN_JOSE_DE_CALASANZ", "028_NAVARRO REVERTE", "232_SAN_VICENTE_DE_PAUL_SANTIAGO_RUSIÑOL", "234_PLAZA MUSICO_ESPI_JOSE_ESTEVE", "236_RIO_SEGRE_RAFAEL_COMPANY", "030_CIRILO AMOROS", "032_C/ CONDE DE ALTEA", "179_AVENIDA_DE_LA_PLATA_45", "182_AVDA_AUSIAS_MARCH", "238_SAN_JOSE_ARTESANO_FRANCISCO_MOROTE_GREUS", "031_CALLE SALAMANCA", "033_GRAN_VIA_GERMANIAS_ESQ_CALLE_RUZAFA", "35_C/ DUQUE DE CALABRIA", "240_CAMP_DEL_TURIA_AVDA_CORTES_VALENCIANAS", "242_LA_SAFOR_AVDA_MAESTRO_RODRIGO", "262_AVDA_TRES_FORQUES_COLONIA_ESPANOLA_DE_MEXICO", "37_AVDA. PERIS Y VALERO", "39_AVDA. PERIS Y VALERO", "096_AVDA. BLASCO IBAÑEZ 6", "098_SANTOS JUSTO Y PASTOR", "104_ALBALAT DELS TARONGERS", "109_AVDA. NARANJOS", "113_ETS CAMINOS", "41_AVDA. GRAL. URRUTIA", "43_C/ DE ORIENTE", "108_ LUIS PEIXO", "110_KISSHOMARU", "124_C/ AZAGADOR DE ALBORAYA", "128_C/ ALFAUIR", "253_PLAZA_JOSE_MELIA_CASTELLO_CAMPOS_CRESPO", "255_SAN_VICENTE_MARTIR_TOMAS_DE_VILLAROYA", "112_AVDA. DE LOS NARANJOS", "114_ADOLFO SUAREZ", "116_C/ DR. VICENTE ZARAGOZA", "118_C/ DR. GOMEZ FERRER", "120_C_DR VICENTE ZARAGOZA", "122_C_MÚSICO HIPÓLITO MARTÍNEZ", "45_AVDA. GRAL. URRUTIA", "47_AVDA. AUTOPISTA DEL SALER", "117_PRIMADO REIG", "119_C/ JAIME ROIG", "121_C_MURTA", "123_C_ALBOCACER", "125_C/ MASQUEFA", "127_C/ DUQUE DE MANDAS", "139_C/ REUS", "141_C/ GREGORIO GEA (PEATONAL)", "162_PZA. ARMADA ESPAÑOLA", "188_HOSPITAL_NUEVA_FE", "001_GUILLEN_DE_CASTRO", "002_CALLE_SALVADOR_GINER_CALLE_MUSEO", "003_PLAZA_MUSICO_LOPEZ_CHAVARRI", "167_PAVIA 3", "170_PAVIA 5", "172_AVENIDA_PIO_XII", "192_CTRA_MALILLA", "194_ESTACION_AVE_JOAQUIN_SOROLLA", "196_AVDA_GASPAR_AGUILAR", "198_CALLE_FONTANARS_DELS_AFORINS", "208_CALLE_CARTEROS_ESQ_CALLE_MOSSEN_FEBRER", "210_CALLE_CAMPOS_CRESPO_ESQ_CALLE_JUAN_DE_GARAY", "257_PLAZA_SALVADOR_SORIA_ESQ_PIO_X", "48_AVDA. ANTONIO FERRANDIS", "50_AVDA. AUTOPISTA DEL SALER", "52_C/ LUIS GARCIA BERLANGA", "54_PASEO ALAMEDA", "56_AVDA. DE FRANCIA", "058_PLAZA DE ESPAÑA", "060_AVDA.BALEARES II", "062_MENORCA", "074_PLAZA SAN FELIPE NERI", "166_PROGRESO", "197_CALLE_FONTANARS_DELS_AFORINS", "078_AVDA. ARAGÓN I", "080_AMADEO SAVOIA", "49_C/ RICARDO MUÑOZ SUAY", "51_PSO. DE LAS MORERAS", "53_C/ LUIS GARCIA BERLANGA", "55_AVDA. DE FRANCIA", "057_CALLE PINTOR MONLEON", "061_VICENTE VIDAL", "063_AVDA. DEL PUERTO I", "065_AVDA. DEL PUERTO III", "067_JUAN VERDEGUER", "069_AVDA. DEL PUERTO", "075_CAMPOAMOR I", "076_CAMPOAMOR II", "079_AVDA. ARAGON II", "081_DOCTOR FORNOS", "133_C/ ALFAMBRA", "212_CALLE_FRAY_JUANÍPERO_SERRA_ESQ_CALLE_TORRENTE", "216_AVDA_DEL_CID_ESQ_CALLE_BURGOS", "218_CALLE_OLIMPIA AROZENA TORRES_ESQ_JUAN BAPTISTA", "220_CALLE_CASTAN_TOBEÑAS_ESQ_CALLE_DE_GOYA", "222_AVDA_MAESTRO_RODRIGO_ESQ_AVDA_MANUEL_DE_FALLA", "224_PLAZA_JOSE_MONFORTE_TUDELA_ESQ_CALLE_HERNANDEZ", "226_CALLE_SAFOR_ESQ_AVDA_DE_LAS_CORTES_VALENCIANAS", "082_GUILLEN_DE_CASTRO_TORRES_DE_QUART", "229_CALLE_AITANA_ESQ_AVDA_BURJASSOT", "231_CALLE_DE_ALCAÑIZ_ESQ_CALLE_CAMBRILS", "233_SAN_JUAN_BOSCO_SANTIAGO_RUSIÑOL", "235_CONDE_DE_TORREFIEL_CECILIO_PLA", "237_LEVANTE_UD_AVDA_ECUADOR", "239_LA_FLORISTA_TRANVIA_PALACIO_CONGRESOS", "241_VALL_DE_ALBAIDA_PEATONAL", "243_ALBACETE_ESQ_MALUQUER", "245_9_DE_OCTUBRE_CIEZA", "83_PZA. DE LA LEGIÓN ESPAÑOLA", "84_SERRERIA_ESQ_PINTOR FERRER CALATAYUD", "085_AVDA_BLASCO IBAÑEZ 1", "86_AVDA_GASPAR_AGUILAR_ESQ_VICENTE_PARRA", "87_AVDA BLASCO IBAÑEZ 2", "088_AVDA. BLASCO IBAÑEZ 3", "89_AVDA. BLASCO IBAÑEZ", "90_AVDA. BLASCO IBAÑEZ", "091_CALLE_GRABADOR_JORDAN_46_PLAZA_ESCULTOR_PASTOR", "092_AVDA. DE ARAGON, 4 - ESQ AVDA BLASCO IBAÑEZ", "93_AVADA_BLASCO_IBAÑEZ_DESP_C_POETA_DURAN_TORTAJAD", "157_AVENIDA_PEREZ_GALDOS", "159_FRANCISCO CUBELLS", "099_AVDA. BLASCO IBAÑEZ 166_PINTOR JOSÉ MONGRELL", "101_AVDA. BLASCO IBAÑEZ 10", "103_RUBEN DARIO", "270_CALLE_NINOT_ESQ_PZA_REGINO_MAS", "106_AVDA. DE LOS NARANJOS", "126_C/ ALFAUIR", "147_CALLE_PIE_DE_LA_CRUZ_CALLE_DE_LA_REJA", "149_AVDA. PERIS Y VALERO", "151_JERONIMO MONSORIU", "153_C/ LLANO DE ZAIDA", "155_C/ SALAMANCA", "154_PESCADORES", "100_AVDA. BLASCO IBAÑEZ 9", "102_AVDA.RAMON LLUL", "107_C/ CAMPILLO ALTO BUEY", "111_UNIVERSIDAD POLITECNICA – JUNTO PISTAS DEPORTI", "115_C/ DR. VICENTE ZARAGOZA", "129_C_ALMAZORA", "131_CALLE SANTA AMALIA  2", "145_PLAZA_BADAJOZ", "148_XÀTIVA_PLAZA_DE_TOROS", "150_DR. MANUEL CANDELA", "152_C/ LITERATO AZORÍN", "156_C/ CUBA", "221_AVDA_MANUEL_DE_FALLA_ESQ_CALLE_HERNANDEZ_LAZAR", "174_CALLE_MONDUBER", "176_CAMINO_DE_MONCADA_52", "178_CALLE_REIG_GENOVES", "200_AVDA_DEL_CID", "202_PASEO_PECHINA", "204_AVDA_GENERAL_AVILES", "206_CALLE_PERIODISTA_GIL_SUMBIELA", "213_CALLE_ARCHIDUQUE_CARLOS_ESQ_CALLE_JOSE_MA_MOR", "215_CALLE_MUSICO_AYLLON_ESQ_CALLE_FRANCISCO_DOLZ", "217_CALLE_9_DE_OCTUBRE_ESQ_CALLE_PINTOR_STOLZ", "219_CALLE_CASTAN_TOBEÑAS_ESQ_CALLE_VELAZQUEZ", "274_MANUEL_ANDRES_CASTELL_DE_POLOP", "276_EDIFICIO_VELES_E_VENTS", "181_CALLE_DEL_SALINAR", "183 - AVDA AUSIAS MARCH", "185_AVDA_AUSIAS_MARCH", "187_AVDA_AUSIAS_MARCH", "189_HOSPITAL_NUEVA_FE", "199_CALLE_BEATO_NICOLAS_FACTOR", "201_AVDA_PEREZ_GALDOS", "203_CALLE_REINA_VIOLANTE", "205_CALLE_NICASIO_BENLLOCH", "207_CALLE_MILLARES_ESQ_CALLE_FEDERICO_GARCA_LORCA", "214_CALLE_SANTA_CRUZ_DE_TENERIFE_ESQ_CALLE_LLOMBA", "225_CALLE_PADRE_BARRANCO_DESPUES_CALLE_BENIFAIRO", "259_CALLE_PIO_IX_POLIDEPORTIVO_RAMBLETA", "261_PZA_XUQUER_ESQ_VINALOPO", "263_PADRE ESTEBAN_PERNET_ANTES_CASA_MISERICORDIA", "265_C_ALCASSER_POETA_ALBERTO_LISTA", "267_C_BENIFERRI_VICENTE_TOMAS_MARTI", "269_CAMPAMENTO_81", "271_CALLE_SALVADOR_CERVERÓ_CALLE_CARLOS_CORTINA", "244_AVDA_PIO_BAROJA_VALLE_DE_LA_BALLESTERA", "246_AVDA_TRES_CRUCES_ENTRADA_HOSPITAL_GENERAL", "248_AVDA_TRES_CRUCES_JOSE_MARIA_MORTES_LERMA", "250_AVDA_TRES_CRUCES_PIO_XI", "252_DE_LOS_GREMIOS_CAMPOS_CRESPO", "254_AVDA_DR_TOMAS_SALA_CARTEROS", "256_AVDA_TRES_FORQUES_TURIS", "258_PINTOR_RAFAEL_SOLVES_ESQ_JOSE_SOTO_MICO", "260_DELS_FERRERS_ESQ_TRAGINERS", "264_AVDA_CID_ANTES_MARCONI", "266_PLANA_ALTA_ESQ_AVDA_MAESTRO_RODRIGO", "268_PZA_LUIS_CANO_5", "273_CALLE_MORAIRA_CALLE_DALT_DE_LA_MAR", "275_CAMINO_DE_LAS_MORERAS_ESQ_RONDA_DE_NAZARET"
  ];

  filteredEstaciones!: Observable<string[]>;

  // Inyectamos authService como public
  constructor(private api: ApiService, private route: ActivatedRoute, public authService: AuthService) {
    this.estacionForm = new FormGroup({
      numero: new FormControl('', [Validators.required]),
      nombre: new FormControl('', [Validators.required]),
      capacidad: new FormControl(0),
      bicis_disponibles: new FormControl(0),
      bornes_libres: new FormControl(0),
      geom: new FormControl('', [Validators.required]) 
    });
  }

  ngOnInit() {
    this.filteredEstaciones = this.estacionForm.get('nombre')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterEstaciones(value || ''))
    );

    this.route.paramMap.subscribe(params => {
      const idStr = params.get('id');
      if (idStr) {
        this.estacionForm.patchValue({ nombre: idStr });
        this.mensaje = "Buscando datos de la estacion...";
        this.selectOne(); 
      }
    });

    this.route.queryParams.subscribe(params => {
      const geom = params['geom'];
      if (geom) {
        this.estacionForm.patchValue({ geom: geom });
        this.mensaje = "Coordenada de estacion cargada desde el mapa. Rellena el resto de datos.";
      }
    });
  }

  private _filterEstaciones(value: string): string[] {
    const filterValue = this.normalizeStr(value);
    return this.opcionesEstaciones.filter(option => this.normalizeStr(option).includes(filterValue));
  }

  private normalizeStr(str: string): string {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  selectOne() {
    const nombreEstacion = this.estacionForm.value.nombre;
    if (!nombreEstacion) {
      this.mensaje = "Error: Escribe o selecciona un Nombre de Estacion para buscar.";
      return;
    }
    
    this.mensaje = "Consultando base de datos...";

    this.api.get('estaciones').subscribe({
      next: (res) => {
        if (res.ok && res.data.length > 0) {
          
          const nombreBuscado = this.normalizeStr(nombreEstacion);
          
          let estacion = res.data.find((e: any) => 
            this.normalizeStr(e.nombre || e.name) === nombreBuscado
          );
          
          if (!estacion) {
            estacion = res.data.find((e: any) => 
              this.normalizeStr(e.nombre || e.name || '').includes(nombreBuscado)
            );
          }

          if (!estacion) {
            this.mensaje = `Estación '${nombreEstacion}' no encontrada en la base de datos.`;
            return;
          }

          if (estacion.geom && typeof estacion.geom === 'object') {
            try {
              if (estacion.geom.type === 'Point' && estacion.geom.coordinates) {
                const coords = estacion.geom.coordinates;
                estacion.geom = `POINT(${coords[0]} ${coords[1]})`;
              }
            } catch (e) {
              estacion.geom = JSON.stringify(estacion.geom);
            }
          }

          const estacionParaFormulario = {
            numero: estacion.numero || estacion.number || estacion.id || '',
            nombre: estacion.nombre || estacion.name || '',
            capacidad: estacion.capacidad || estacion.total || 0,
            bicis_disponibles: estacion.bicis_disponibles || estacion.available || 0,
            bornes_libres: estacion.bornes_libres || estacion.free || 0,
            geom: estacion.geom
          };

          this.estacionForm.patchValue(estacionParaFormulario);
          this.mensaje = `Estación recuperada con éxito.`;
        } else { 
          this.mensaje = "No se encontraron estaciones en la base de datos."; 
        }
      },
      error: (err) => { 
        this.mensaje = "Error de conexión: " + err.message; 
      }
    });
  }

  insert() {
    if (this.estacionForm.invalid) {
      this.mensaje = "Error: Revisa los campos marcados en rojo.";
      return;
    }
    this.api.post('estaciones', this.estacionForm.value).subscribe({
      next: (res) => { if (res.ok) { this.mensaje = "Estación creada correctamente"; } else { this.mensaje = "Error al crear: " + res.message; } },
      error: (err) => { this.mensaje = "Django dice: " + (err.error?.data ? JSON.stringify(err.error.data) : err.message); }
    });
  }

  update() {
    if (this.estacionForm.invalid) {
      this.mensaje = "Error: Revisa los campos marcados en rojo.";
      return;
    }
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

  // --- SINCRONIZACIÓN AUTOMÁTICA CON VALENBISI ---
  sincronizarValenbisi() {
    this.mensaje = "Sincronizando con el Geoportal de Valencia... Por favor, espera.";
    
    // Hacemos un POST vacío hacia el endpoint de Django
    this.api.post('actualizar-estaciones/', {}).subscribe({
      next: (res) => {
        if (res.ok) {
          this.mensaje = `✅ Éxito: ${res.message}`;
          // Opcional: Si el usuario tenía una estación seleccionada en el formulario, 
          // la refrescamos automáticamente para que vea los nuevos datos de bicis
          if (this.estacionForm.value.numero) {
            this.selectOne();
          }
        } else {
          this.mensaje = `❌ Error: ${res.message}`;
        }
      },
      error: (err) => {
        this.mensaje = "Error de conexión al intentar sincronizar: " + err.message;
      }
    });
  }

}