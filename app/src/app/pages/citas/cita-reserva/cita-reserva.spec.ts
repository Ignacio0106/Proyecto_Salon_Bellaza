import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitaReserva } from './cita-reserva';

describe('CitaReserva', () => {
  let component: CitaReserva;
  let fixture: ComponentFixture<CitaReserva>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitaReserva],
    }).compileComponents();

    fixture = TestBed.createComponent(CitaReserva);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
