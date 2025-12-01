import axios, { type AxiosResponse } from 'axios';

// https://medium.com/@ignatovich.dm/creating-a-type-safe-api-client-with-typescript-and-react-ce1b82bf8b9b
// Create an instance of axios with some default configuration
const apiClient = axios.create({
  baseURL: 'https://piecesapi-e6ceaydmdfd0hghx.canadacentral-01.azurewebsites.net',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Define a generic API function
export const apiRequest = async <T>(url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', data?: any): Promise<T> => {
  const response: AxiosResponse<T> = await apiClient({
    method,
    url,
    data,
  });

  return response.data;
};