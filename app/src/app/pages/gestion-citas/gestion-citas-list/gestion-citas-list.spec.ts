import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionCitasList } from './gestion-citas-list';

describe('GestionCitasList', () => {
  let component: GestionCitasList;
  let fixture: ComponentFixture<GestionCitasList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionCitasList],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionCitasList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
