import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteCitasByEstado } from './reporte-citas-by-estado';

describe('ReporteCitasByEstado', () => {
  let component: ReporteCitasByEstado;
  let fixture: ComponentFixture<ReporteCitasByEstado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteCitasByEstado],
    }).compileComponents();

    fixture = TestBed.createComponent(ReporteCitasByEstado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
