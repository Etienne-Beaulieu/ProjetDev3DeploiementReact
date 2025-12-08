// Mon modele pour Piece
export interface Piece {
  _id: string;
  pieceName: string;
  compositorName: string;
  durationMinutes: number;
  dateOfRelease: Date;
  compositorIsAlive: boolean;
  instruments: string[];
  difficultyLevel: number;
  styles: string[];
  compositorImageUrl: string;
}