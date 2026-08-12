import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaVisual } from './agenda-visual';

describe('AgendaVisual', () => {
  let component: AgendaVisual;
  let fixture: ComponentFixture<AgendaVisual>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendaVisual],
    }).compileComponents();

    fixture = TestBed.createComponent(AgendaVisual);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
