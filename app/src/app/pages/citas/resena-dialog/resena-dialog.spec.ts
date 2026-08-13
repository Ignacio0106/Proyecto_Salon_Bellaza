import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResenaDialog } from './resena-dialog';

describe('ResenaDialog', () => {
  let component: ResenaDialog;
  let fixture: ComponentFixture<ResenaDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResenaDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(ResenaDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
