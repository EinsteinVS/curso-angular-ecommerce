import { StoreSession } from '../../../core/models/session.model';

export interface LoginUser {
    email: string;
    role: string;
    department: string;
    profile: string;
}

export interface LoginCustomer {
    clienteID: string;
    tipo: string;
    geo1: string;
    addresses: string;
    payments: string;
}

export interface loginResponse {
    token: string;
    expiration?: string;
    user?: LoginUser;
    customer?: LoginCustomer;
    storeSession?: StoreSession;
}

export interface RegisterResponse {
    userId: number;
    email: string;
    clienteId: string;
    role: string;
}

export interface RegisterRequest {
    name: string;
    lastName: string;
    email: string;
    password: string;
    tipoDocumento: string;
    numeroDocumento: string;
    edad: string;
    genero: string;
    phoneNumber?: string;
    geo1?: string;
    addresses?: string;
    payments?: string;
}