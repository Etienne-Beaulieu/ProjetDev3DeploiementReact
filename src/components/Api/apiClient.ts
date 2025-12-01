import { apiRequest } from './api.ts';
import { type Piece } from '../Piece/Piece.tsx';

export interface PieceListResponse {
    pieces: Piece[];
}

export interface PieceOne {
    piece: Piece;
}

// https://medium.com/@ignatovich.dm/creating-a-type-safe-api-client-with-typescript-and-react-ce1b82bf8b9b
export const fetchAllPieces = async (): Promise<PieceListResponse | null> => {
    try {
        return await apiRequest<PieceListResponse>('/api/pieces/all', 'GET');
    } catch (error) {
        console.error('Erreur lors du fetch de toute les pieces: ', error);
        return null;
    }  
};

export const fetchOnePieceById = async (id: String): Promise<PieceOne | null> => {
    try {
        return await apiRequest<PieceOne>('/api/pieces/one/' + id, 'GET');
    } catch (error) {
        console.error('Erreur lors du fetch de la piece: ', error);
        return null;
    }  
};