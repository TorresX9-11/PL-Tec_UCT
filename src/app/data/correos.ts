import { api } from './apiClient';

export interface CorreoDestinatario {
  to: string;
  subject: string;
  text: string;
}

export interface SendCorreosResult {
  exitosos: number;
  fallidos: number;
  previewUrl: string;
}

export async function sendCorreosMasivos(destinatarios: CorreoDestinatario[]): Promise<SendCorreosResult> {
  const result = await api.post<SendCorreosResult>('/correos/masivos', { destinatarios });
  return result;
}
