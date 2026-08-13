import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelarCitaDialog } from './cancelar-cita-dialog';

describe('CancelarCitaDialog', () => {
  let component: CancelarCitaDialog;
  let fixture: ComponentFixture<CancelarCitaDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CancelarCitaDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(CancelarCitaDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
