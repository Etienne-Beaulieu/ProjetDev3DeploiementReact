import React, { useEffect, useState } from 'react';
import { fetchAllPieces, fetchOnePieceById } from '../Api/apiClient.ts'

import './Piece.css';

export interface Piece {
    id: String;
    pieceName: String;
    compositorName: String;
    durationMinutes: Number;
    dateOfRelease: Date;
    compositorIsAlive: Boolean;
    instruments: [String];
    difficultyLevel: Number;
    styles: [String];
    compositorImageUrl: String;
}

const PiecesList: React.FC = () => {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getPieces = async () => {
      try {
        const response = await fetchAllPieces();
        if (response != null)
        setPieces(response.pieces);
      } catch (err) {
        setError('Impossible de recuperer les pieces.');
      } finally {
        setLoading(false);
      }
    };

    getPieces();
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>{error}</p>;

  return (
    <ul>
      {pieces.map(piece => (
        <button onClick={PieceById(piece.id)}>
                    <h1>{piece.pieceName}</h1>
        </button>
      ))}
    </ul>
  );
};

const PieceById: React.FC<String> = ({ id }) => {
  const [piece, setPiece] = useState<Piece>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getPieceById = async () => {
      try {
        const response = await fetchOnePieceById(id);
        if (response != null)
        setPiece(response.piece);
      } catch (err) {
        setError('Impossible de recuperer la piece.');
      } finally {
        setLoading(false);
      }
    };

    getPieceById();
  }, [id]);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>{error}</p>;
  if (!piece) return <p>Aucune pièce trouvée.</p>;

  return (
    <ul>
        <h1>{piece.pieceName}</h1>
    </ul>
  );
};

export {PiecesList, PieceById};