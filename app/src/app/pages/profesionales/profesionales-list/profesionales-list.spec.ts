import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfesionalesList } from './profesionales-list';

describe('ProfesionalesList', () => {
  let component: ProfesionalesList;
  let fixture: ComponentFixture<ProfesionalesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfesionalesList],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfesionalesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
