import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EspecialidadesList } from './especialidades-list';

describe('EspecialidadesList', () => {
  let component: EspecialidadesList;
  let fixture: ComponentFixture<EspecialidadesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EspecialidadesList],
    }).compileComponents();

    fixture = TestBed.createComponent(EspecialidadesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
