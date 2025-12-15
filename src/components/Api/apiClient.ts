import { apiRequest } from './api.ts';
import { type Piece } from '../Piece/Piece.ts';

// Interface pour les pieces
export interface PieceListResponse {
    pieces: Piece[];
}

export interface PieceOne {
    piece: Piece;
}

// https://medium.com/@ignatovich.dm/creating-a-type-safe-api-client-with-typescript-and-react-ce1b82bf8b9b
// Get toute les pieces
export const fetchAllPieces = async (): Promise<PieceListResponse | null> => {
    try {
        return await apiRequest<PieceListResponse>('/api/pieces/all', 'GET');
    } catch (error) {
        console.error('api.error.fetchAll', error);
        return null;
    }  
};

// Get une piece par id
export const fetchOnePieceById = async (id: string): Promise<PieceOne | null> => {
    try {
        return await apiRequest<PieceOne>('/api/pieces/one/' + id, 'GET');
    } catch (error) {
        console.error('api.error.fetchOne', error);
        return null;
    }  
};

// Get toute les pieces par isAlive
export const fetchPiecesByIsAlive = async (isAlive: boolean): Promise<PieceListResponse | null> => {
    try {
        return await apiRequest<PieceListResponse>('/api/pieces/alive/' + isAlive, 'GET');
    } catch (error) {
        console.error('api.error.fetchByAlive', error);
        return null;
    }  
};

// Get toute les pieces par between
export const fetchPiecesBetweenYears = async (start: number, end: number): Promise<PieceListResponse | null> => {
    try {
        return await apiRequest<PieceListResponse>(`/api/pieces/between/${start}/${end}`, 'GET');
    } catch (error) {
        console.error('api.error.fetchBetween', error);
        return null;
    }  
};

// Post une piece
export const addPiece = async (piece: Omit<Piece, '_id'>): Promise<PieceOne | null> => {
    try {
        return await apiRequest<PieceOne>('/api/pieces/add', 'POST', { piece });
    } catch (error) {
        console.error('api.error.add', error);
        return null;
    }  
};

// Put une piece
export const updatePiece = async (piece: Piece): Promise<PieceOne | null> => {
    try {
        return await apiRequest<PieceOne>('/api/pieces/update', 'PUT', { piece });
    } catch (error) {
        console.error('api.error.update', error);
        return null;
    }  
};

// Delete une piece
export const deletePiece = async (id: string): Promise<{ success: boolean } | null> => {
    try {
        return await apiRequest<{ success: boolean }>('/api/pieces/delete/' + id, 'DELETE');
    } catch (error) {
        console.error('api.error.delete', error);
        return null;
    }  
};