import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfesionalEdit } from './profesional-edit';

describe('ProfesionalEdit', () => {
  let component: ProfesionalEdit;
  let fixture: ComponentFixture<ProfesionalEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfesionalEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfesionalEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
