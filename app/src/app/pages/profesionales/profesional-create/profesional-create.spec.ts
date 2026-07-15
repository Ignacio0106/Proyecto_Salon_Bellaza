import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfesionalCreate } from './profesional-create';

describe('ProfesionalCreate', () => {
  let component: ProfesionalCreate;
  let fixture: ComponentFixture<ProfesionalCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfesionalCreate],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfesionalCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
