export enum Role {
    ADMIN = 'ADMINISTRADOR',
    PROFESIONAL = 'PROFESIONAL',
    CLIENTE = 'CLIENTE',
}

export interface RoleOption {
    value: Role;
    label: string;
}