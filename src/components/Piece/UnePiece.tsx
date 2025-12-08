import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { fetchOnePieceById } from '../Api/apiClient.ts';
import { type Piece } from './Piece.ts';
import './Piece.css';

interface UnePieceProps {
  id: string;
  onBack: () => void;
}

// Le composant UnePiece pour afficher les informations d'une seule piece
export function UnePiece({ id, onBack }: UnePieceProps) {
  const intl = useIntl();
  const [piece, setPiece] = useState<Piece | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function chargerPiece() {
      setLoading(true);
      try {
        const response = await fetchOnePieceById(id);
        if (response) {
          setPiece(response.piece);
        }
      } catch (err) {
        setError(intl.formatMessage({ id: 'piece.error' }));
      } finally {
        setLoading(false);
      }
    }

    chargerPiece();
  }, [id, intl]);

  if (loading) return <p>{intl.formatMessage({ id: 'piece.loading' })}</p>;
  if (error) return <p>{error}</p>;
  if (!piece) return <p>{intl.formatMessage({ id: 'piece.notFound' })}</p>;

  // Le html retourner (Le html template est en bonne partie fait par l'ia mais adapter et modifier par moi)
  return (
    <div className="piece-details">

      {/* Bouton pour revenir à la liste */}
      <button onClick={onBack}>← {intl.formatMessage({ id: 'piece.back' })}</button>

      {/* Nom de la pièce */}
      <h1>{piece.pieceName}</h1>

      {/* Section compositeur avec image et informations */}
      <div className="piece-info compositor-section">
        {piece.compositorImageUrl && (
          <img src={piece.compositorImageUrl} alt={piece.compositorName} />
        )}
        <h2>{piece.compositorName}</h2>
        <p>
          {piece.compositorIsAlive 
            ? intl.formatMessage({ id: 'piece.alive' })
            : intl.formatMessage({ id: 'piece.deceased' })
          }
        </p>
      </div>

      {/* Tableau avec les autres informations*/}
      <table className="info-table">
        <tbody>

          {/* Durée */}
          <tr>
            <th>{intl.formatMessage({ id: 'piece.duration' })}</th>
            <td>
              {intl.formatMessage(
                { id: 'piece.minutes' },
                { duration: piece.durationMinutes }
              )}
            </td>
          </tr>

          {/* Date de sortie */}
          <tr>
            <th>{intl.formatMessage({ id: 'piece.releaseDate' })}</th>
            <td>{new Date(piece.dateOfRelease).toLocaleDateString(intl.locale)}</td>
          </tr>

          {/* Difficulté */}
          <tr>
            <th>{intl.formatMessage({ id: 'piece.difficulty' })}</th>
            <td>
              {intl.formatMessage(
                { id: 'piece.difficultyLevel' },
                { level: piece.difficultyLevel }
              )}
            </td>
          </tr>

          {/* Instruments */}
          <tr>
            <th>{intl.formatMessage({ id: 'piece.instruments' })}</th>
            <td>
              <ul>
                {piece.instruments.map((instrument, index) => (
                  <li key={index}>{instrument}</li>
                ))}
              </ul>
            </td>
          </tr>

          {/* Styles */}
          <tr>
            <th>{intl.formatMessage({ id: 'piece.styles' })}</th>
            <td>
              <ul>
                {piece.styles.map((style, index) => (
                  <li key={index}>{style}</li>
                ))}
              </ul>
            </td>
          </tr>

        </tbody>
      </table>
    </div>
  );
}