import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuariosPerfil } from './usuarios-perfil';

describe('UsuariosPerfil', () => {
  let component: UsuariosPerfil;
  let fixture: ComponentFixture<UsuariosPerfil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosPerfil],
    }).compileComponents();

    fixture = TestBed.createComponent(UsuariosPerfil);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
