import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarrilesComponent } from './carriles.component';

describe('CarrilesComponent', () => {
  let component: CarrilesComponent;
  let fixture: ComponentFixture<CarrilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarrilesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarrilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
