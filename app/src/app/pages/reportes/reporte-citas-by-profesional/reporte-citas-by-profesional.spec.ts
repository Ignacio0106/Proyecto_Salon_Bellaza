import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteCitasByProfesional } from './reporte-citas-by-profesional';

describe('ReporteCitasByProfesional', () => {
  let component: ReporteCitasByProfesional;
  let fixture: ComponentFixture<ReporteCitasByProfesional>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteCitasByProfesional],
    }).compileComponents();

    fixture = TestBed.createComponent(ReporteCitasByProfesional);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
