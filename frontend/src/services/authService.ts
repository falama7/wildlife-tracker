import axios, { AxiosResponse } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/** Payload attendu par l’endpoint POST /auth/login */
export interface LoginCredentials {
  username: string;
  password: string;
}

/** Réponse renvoyée par /auth/login */
export interface LoginResponse {
  access_token: string;
  token_type: string;
}

/** Appelle l’API pour obtenir un JWT */
export async function login(data: LoginCredentials): Promise<LoginResponse> {
  const res: AxiosResponse<LoginResponse> = await axios.post(
    `${API_URL}/auth/login`,
    data
  );
  return res.data;
}

/** Exemple d’appel pour s’inscrire (si votre back le permet) */
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export async function register(data: RegisterData): Promise<void> {
  await axios.post(`${API_URL}/auth/register`, data);
}
