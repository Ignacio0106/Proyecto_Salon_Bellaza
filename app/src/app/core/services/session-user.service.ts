import { Injectable, signal } from '@angular/core';

export type Role = 'ADMINISTRADOR' | 'PROFESIONAL' | 'CLIENTE';

export interface SessionUser {
  nombre: string;
  role: Role;
}

const CURRENT_USER_KEY = 'currentUser';

@Injectable({
  providedIn: 'root',
})
export class SessionUserService {
  currentUser = signal<SessionUser | null>(this.readCurrentUser());

  setUser(user: SessionUser): void {
    this.currentUser.set(user);
    this.saveCurrentUser(user);
  }

  clearUser(): void {
    this.currentUser.set(null);
    this.saveCurrentUser(null);
  }

  private readCurrentUser(): SessionUser | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const stored = localStorage.getItem(CURRENT_USER_KEY);
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as SessionUser;
    } catch {
      return null;
    }
  }

  private saveCurrentUser(user: SessionUser | null): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return;
    }

    localStorage.removeItem(CURRENT_USER_KEY);
  }
}