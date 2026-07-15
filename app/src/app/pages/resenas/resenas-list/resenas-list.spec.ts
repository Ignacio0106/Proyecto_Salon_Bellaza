import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResenasList } from './resenas-list';

describe('ResenasList', () => {
  let component: ResenasList;
  let fixture: ComponentFixture<ResenasList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResenasList],
    }).compileComponents();

    fixture = TestBed.createComponent(ResenasList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
