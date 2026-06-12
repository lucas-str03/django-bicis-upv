import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { MapService } from '../../services/map.service';
import { AuthService } from '../../services/auth.service'; 

import { DrawEstacionComponent } from '../draw-estacion/draw-estacion.component';
import { DrawBarrioComponent } from '../draw-barrio/draw-barrio.component';
import { DrawCarrilComponent } from '../draw-carril/draw-carril.component';
import { SelectInteractionComponent } from '../select-interaction/select-interaction.component';
import { EditInteractionComponent } from '../edit-interaction/edit-interaction.component';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    CommonModule, 
    DrawEstacionComponent, 
    DrawBarrioComponent, 
    DrawCarrilComponent, 
    SelectInteractionComponent,
    EditInteractionComponent
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  public isLayerMenuOpen: boolean = false;

  // Estado inicial de visualizacion de los cuatro componentes basicos
  public layersState: { [key: string]: boolean } = {
    wms: true,
    poligono: true,
    lineas: true,
    puntos: true
  };

  
  public legendItems = [
    { label: 'Carril Bici / Bus-Bici', color: '#ff0000', style: 'solid' },
    { label: 'Ciclo Carrers / Ciclo Calles', color: '#0066ff', style: 'solid' },
    { label: 'Carrers de Vianants', color: '#ff6600', style: 'solid' },
    { label: 'Carril Bici Jardí del Túria', color: '#009926', style: 'solid' },
    { label: 'Senda Ciclable', color: '#00734c', style: 'solid' },
    { label: 'Ciclobarrio', color: '#ffff00', style: 'solid' },
    { label: 'Tallat per obres', color: '#000000', style: 'dashed' }
];

  constructor(
    public mapService: MapService,
    public authService: AuthService 
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    console.log('mapComponent initialized');
    this.mapService.map.setTarget(this.mapContainer.nativeElement);
  }

  toggleLayerMenu(): void {
    this.isLayerMenuOpen = !this.isLayerMenuOpen;
  }

  toggleLayer(layerName: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.layersState[layerName] = isChecked;

    // Control de la capa raiz en el mapa
    this.mapService.map.getLayers().forEach(layer => {
      if (layer.get('name') === layerName) {
        layer.setVisible(isChecked);
      }
    });

    // Control de las capas secundarias inyectadas dentro del grupo principal
    this.mapService.myLayersGroup.getLayers().forEach(layer => {
      if (layer.get('name') === layerName) {
        layer.setVisible(isChecked);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.mapService.map) {
      this.mapService.map.setTarget(undefined);
    }
  }
}