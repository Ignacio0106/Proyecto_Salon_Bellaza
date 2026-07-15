import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfesionalForm } from './profesional-form';

describe('ProfesionalForm', () => {
  let component: ProfesionalForm;
  let fixture: ComponentFixture<ProfesionalForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfesionalForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfesionalForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
