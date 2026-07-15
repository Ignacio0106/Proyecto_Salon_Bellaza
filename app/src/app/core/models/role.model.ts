export type Role = 'ADMINISTRADOR' | 'PROFESIONAL' | 'CLIENTE';

export interface RoleOption {
    value: Role;
    label: string;
}