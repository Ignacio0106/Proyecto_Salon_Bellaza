import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiciosList } from './servicios-list';

describe('ServiciosList', () => {
  let component: ServiciosList;
  let fixture: ComponentFixture<ServiciosList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiciosList],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiciosList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
