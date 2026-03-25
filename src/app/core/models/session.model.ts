export interface LoginInfo {
  clienteID: string;
  rutHash: string;
  emailHash: string;
  edad: string;
  genero: string;
  tipo: 'person' | 'company' | 'guest';
  geo1: string;
  addresses: string;
  payments: string;
}

export interface PageInfo {
  loginStatus: string;
  canal: string;
  serverName: string;
  sessionId: string;
  geolocation: string;
}

export interface StoreSession {
  login: LoginInfo;
  page: PageInfo;
}
