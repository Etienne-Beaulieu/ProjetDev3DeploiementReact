import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { 
  fetchAllPieces, 
  fetchPiecesByIsAlive, 
  fetchPiecesBetweenYears, 
  deletePiece 
} from '../Api/apiClient.ts';
import { type Piece } from './Piece.ts';
import './Piece.css';

interface ListeDePiecesProps {
  onPieceSelect: (pieceId: string) => void;
  onPieceEdit: (piece: Piece) => void;
  filterIsAlive: boolean | null;
  filterYearStart: number | null;
  filterYearEnd: number | null;
  refreshTrigger: number;
}

// Le composant ListeDePieces pour afficher toutes les pieces selon le filtre dans la page d'accueil
export function ListeDePieces({
  onPieceSelect,
  onPieceEdit,
  filterIsAlive,
  filterYearStart,
  filterYearEnd,
  refreshTrigger
}: ListeDePiecesProps) {
  const intl = useIntl();
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // useEffect pour charger les pieces
  useEffect(() => {
    async function chargerPieces() {
      setLoading(true);
      setError('');

      try {
        let response = null;

        // Ici je gere les filtre pour afficher les pieces demandees
        if (filterYearStart && filterYearEnd) {
          response = await fetchPiecesBetweenYears(filterYearStart, filterYearEnd);
        } else if (filterIsAlive !== null) {
          response = await fetchPiecesByIsAlive(filterIsAlive);
        } else {
          response = await fetchAllPieces();
        }

        if (response) {
          setPieces(response.pieces);
        }
      } catch (err) {
        setError(intl.formatMessage({ id: 'list.error' }));
      } finally {
        setLoading(false);
      }
    }

    chargerPieces();
  }, [filterIsAlive, filterYearStart, filterYearEnd, refreshTrigger, intl]);

  // La fonction pour supprimer avec le id
  async function supprimerPiece(e: React.MouseEvent, pieceId: string, pieceName: string) {
    e.stopPropagation();

    const confirmation = window.confirm(
      intl.formatMessage(
        { id: 'list.deleteConfirm' },
        { name: pieceName }
      )
    );
    
    if (confirmation) {
      const response = await deletePiece(pieceId.toString());
      console.log('Delete response:', response);
      if (response && response.success) {
        setPieces(pieces.filter(p => p._id !== pieceId));
      } else {
        alert(intl.formatMessage({ id: 'list.deleteError' }));
      }
    }
  }

  // La fonction pour supprimer une piece (on passe la piece au complet et non juste le id pour recuperer les informations et les afficher dans le formulaire)
  function modifierPiece(e: React.MouseEvent, piece: Piece) {
    e.stopPropagation();
    onPieceEdit(piece);
  }

  if (loading) return <p>{intl.formatMessage({ id: 'list.loading' })}</p>;
  if (error) return <p>{error}</p>;

  // Le html retourner (Le html template est en bonne partie fait par l'ia mais adapter et modifier par moi)
  return (
    <ul>

      {/* Boucle pour afficher chaque pièce */}
      {pieces.map((piece) => (
        <li key={piece._id} style={{ display: 'flex', alignItems: 'center', gap: '10px' , padding: '3px'}}>

          {/* Bouton principal pour sélectionner une pièce */}
          <div onClick={() => onPieceSelect(piece._id)} style={{ flex: 1, cursor: 'pointer' }}>

            {/* Nom de la pièce affiché */}
            <h1>{piece.pieceName}</h1>

          </div>

          <div className="piece-actions">

            {/* Bouton pour modifier la pièce */}
            <button
              className="edit-button"
              onClick={(e) => modifierPiece(e, piece)}
              title={intl.formatMessage({ id: 'list.edit' })}
            >
              ✏️
            </button>

            {/* Bouton pour supprimer la pièce */}
            <button
              className="delete-button"
              onClick={(e) => supprimerPiece(e, piece._id, piece.pieceName)}
              title={intl.formatMessage({ id: 'list.delete' })}
            >
              ✕
            </button>

          </div>

        </li>
      ))}
    </ul>
  );
}
