import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SinAutorizacion } from './sin-autorizacion';

describe('SinAutorizacion', () => {
  let component: SinAutorizacion;
  let fixture: ComponentFixture<SinAutorizacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SinAutorizacion],
    }).compileComponents();

    fixture = TestBed.createComponent(SinAutorizacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
