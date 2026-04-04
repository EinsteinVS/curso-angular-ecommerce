import { StoreSession } from '../../../core/models/session.model';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthenticatedUser {
    email: string;
    role: string;
    department: string;
    profile: string;
}

/** @deprecated Use AuthenticatedUser instead */
export type LoginUser = AuthenticatedUser;

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
    accessTokenExpiresIn?: number;
    user?: AuthenticatedUser;
    customer?: LoginCustomer;
    storeSession?: StoreSession;
}

export interface RefreshTokenResponse {
    token: string;
    accessTokenExpiresIn: number;
    tokenType: string;
}

export interface RegisterResponse {
    message: string;
    userId: number;
    email: string;
    verificationLink?: string;
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