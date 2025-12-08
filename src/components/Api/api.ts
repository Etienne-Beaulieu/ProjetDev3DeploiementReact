import axios, { type AxiosResponse } from 'axios';

// https://medium.com/@ignatovich.dm/creating-a-type-safe-api-client-with-typescript-and-react-ce1b82bf8b9b
// Creer une instance d'axios avec l'url de mon api
const apiClient = axios.create({
  baseURL: 'https://piecesapi-e6ceaydmdfd0hghx.canadacentral-01.azurewebsites.net',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fonction générique pour faire des requêtes API
export async function apiRequest<T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  body?: any
): Promise<T> {
  const response: AxiosResponse<T> = await apiClient({
    method,
    url,
    // Ajouter le body uniquement si method POST ou PUT
    ...(body && (method === 'POST' || method === 'PUT') ? { data: body } : {}),
  });

  return response.data;
}
