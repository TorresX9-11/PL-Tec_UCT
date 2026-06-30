import { api } from './apiClient';

export interface Coordinador {
  id_coordinador: number;
  correo_usuario: string;
  id_carrera: string | null;
  nombre: string;
  rut: string;
}

export type CreateCoordinadorInput = Omit<Coordinador, 'id_coordinador'>;
export type UpdateCoordinadorInput = Partial<CreateCoordinadorInput>;

export async function listCoordinadores(): Promise<Coordinador[]> {
  return await api.get('/coordinadores');
}

export async function createCoordinador(input: CreateCoordinadorInput): Promise<Coordinador> {
  return await api.post('/coordinadores', input);
}

export async function updateCoordinador(id: number, input: UpdateCoordinadorInput): Promise<Coordinador> {
  return await api.put(`/coordinadores/${id}`, input);
}

export async function deleteCoordinador(id: number): Promise<void> {
  return await api.del(`/coordinadores/${id}`);
}
