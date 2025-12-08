import { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { type Piece } from '../Piece/Piece.ts';
import { addPiece, updatePiece } from '../Api/apiClient.ts';
import './Formulaire.css';

interface FormulaireProps {
  piece?: Piece;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormErrors {
  pieceName?: string;
  compositorName?: string;
  durationMinutes?: string;
  dateOfRelease?: string;
  instruments?: string;
  difficultyLevel?: string;
  styles?: string;
  compositorImageUrl?: string;
}

// Le formulaire exporter, selon si une piece est recue, on est en mode ajouter ou supprimer
export function Formulaire({ piece, onSuccess, onCancel }: FormulaireProps) {
  const intl = useIntl();
  const [formData, setFormData] = useState({
    pieceName: '',
    compositorName: '',
    durationMinutes: 0,
    dateOfRelease: '',
    compositorIsAlive: false,
    instruments: '',
    difficultyLevel: 5,
    styles: '',
    compositorImageUrl: '',
  });

  // Variables d'etat
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Si une piece est recue on assigne ses informations pour les afficher dans le formulaire update
  useEffect(() => {
    if (piece) {
      setFormData({
        pieceName: piece.pieceName,
        compositorName: piece.compositorName,
        durationMinutes: piece.durationMinutes,
        dateOfRelease: new Date(piece.dateOfRelease).toISOString().split('T')[0],
        compositorIsAlive: piece.compositorIsAlive,
        instruments: piece.instruments.join(', '),
        difficultyLevel: piece.difficultyLevel,
        styles: piece.styles.join(', '),
        compositorImageUrl: piece.compositorImageUrl,
      });
    }
  }, [piece]);

  function validateForm(): FormErrors {
    const newErrors: FormErrors = {};

    // Validation du nom de la pièce
    if (!formData.pieceName.trim()) {
      newErrors.pieceName = intl.formatMessage({ id: 'form.error.pieceNameRequired' });
    } else if (formData.pieceName.length > 100) {
      newErrors.pieceName = intl.formatMessage({ id: 'form.error.pieceNameLength' });
    }

    // Validation du nom du compositeur
    if (!formData.compositorName.trim()) {
      newErrors.compositorName = intl.formatMessage({ id: 'form.error.compositorNameRequired' });
    } else if (formData.compositorName.length > 100) {
      newErrors.compositorName = intl.formatMessage({ id: 'form.error.compositorNameLength' });
    }

    // Validation de la durée
    if (formData.durationMinutes <= 0) {
      newErrors.durationMinutes = intl.formatMessage({ id: 'form.error.durationPositive' });
    }

    // Validation de la date de sortie
    if (!formData.dateOfRelease) {
      newErrors.dateOfRelease = intl.formatMessage({ id: 'form.error.dateRequired' });
    } else {
      const selectedDate = new Date(formData.dateOfRelease);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate > today) {
        newErrors.dateOfRelease = intl.formatMessage({ id: 'form.error.dateFuture' });
      }
    }

    // Validation des instruments
    const instrumentsArray = formData.instruments.split(',').map(i => i.trim()).filter(i => i);
    if (instrumentsArray.length === 0) {
      newErrors.instruments = intl.formatMessage({ id: 'form.error.instrumentsRequired' });
    } else {
      for (const instrument of instrumentsArray) {
        if (instrument.length > 100) {
          newErrors.instruments = intl.formatMessage({ id: 'form.error.instrumentLength' });
          break;
        }
      }
      const uniqueInstruments = new Set(instrumentsArray);
      if (uniqueInstruments.size !== instrumentsArray.length) {
        newErrors.instruments = intl.formatMessage({ id: 'form.error.instrumentsDuplicate' });
      }
    }

    // Validation du niveau de difficulté
    if (formData.difficultyLevel < 1 || formData.difficultyLevel > 6) {
      newErrors.difficultyLevel = intl.formatMessage({ id: 'form.error.difficultyRange' });
    }

    // Validation des styles
    const stylesArray = formData.styles.split(',').map(s => s.trim()).filter(s => s);
    if (stylesArray.length === 0) {
      newErrors.styles = intl.formatMessage({ id: 'form.error.stylesRequired' });
    } else {
      for (const style of stylesArray) {
        if (style.length > 50) {
          newErrors.styles = intl.formatMessage({ id: 'form.error.styleLength' });
          break;
        }
      }
      const uniqueStyles = new Set(stylesArray);
      if (uniqueStyles.size !== stylesArray.length) {
        newErrors.styles = intl.formatMessage({ id: 'form.error.stylesDuplicate' });
      }
    }

    // Validation de l'URL de l'image
    if (!formData.compositorImageUrl.trim()) {
      newErrors.compositorImageUrl = intl.formatMessage({ id: 'form.error.imageUrlRequired' });
    } else if (formData.compositorImageUrl.length > 200) {
      newErrors.compositorImageUrl = intl.formatMessage({ id: 'form.error.imageUrlLength' });
    }

    return newErrors;
  }

  // Si il y a un changement on enregistre les erreurs pour les afficher les bannieres d'erreur lorsque l'utilisateur veux envoyer le formulaire et empecher l'envoi
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'number') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Enlever l'erreur du champ modifié
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  }

  // Fonction pour envoyer le formulaire
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Si il n'y a pas d'erreurs, le formulaire est envoyer
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    // On assigne la piece recue dans les champs du formulaire en mode update ou ajouter pour ensuite faire les changements
    try {
      const pieceData = {
        pieceName: formData.pieceName.trim(),
        compositorName: formData.compositorName.trim(),
        durationMinutes: formData.durationMinutes,
        dateOfRelease: new Date(formData.dateOfRelease),
        compositorIsAlive: formData.compositorIsAlive,
        instruments: formData.instruments.split(',').map(i => i.trim()).filter(i => i),
        difficultyLevel: formData.difficultyLevel,
        styles: formData.styles.split(',').map(s => s.trim()).filter(s => s),
        compositorImageUrl: formData.compositorImageUrl.trim(),
      };

      let response;
      if (piece) {
        response = await updatePiece({ ...pieceData, _id: piece._id });
      } else {
        response = await addPiece(pieceData);
      }

      if (response) {
        onSuccess();
      } else {
        setErrors({ pieceName: intl.formatMessage({ id: 'form.error.saveFailed' }) });
      }
    } catch (err) {
      setErrors({ pieceName: intl.formatMessage({ id: 'form.error.generic' }) });
    } finally {
      setLoading(false);
    }
  }

  // Le html retourner (Le html template est en bonne partie fait par l'ia mais adapter et modifier par moi)
  return (
    <div className="form-container">

      <h1>
        {piece 
          ? intl.formatMessage({ id: 'form.titleEdit' })
          : intl.formatMessage({ id: 'form.titleAdd' })
        }
      </h1>

      <form onSubmit={handleSubmit}>

        {/* Champ du nom de la pièce */}
        <div className="form-group">
          {errors.pieceName && (
            <div className="error-banner">{errors.pieceName}</div>
          )}

          <label htmlFor="pieceName">
            {intl.formatMessage({ id: 'form.pieceName' })} {intl.formatMessage({ id: 'form.required' })}
          </label>

          <input
            type="text"
            id="pieceName"
            name="pieceName"
            value={formData.pieceName}
            onChange={handleChange}
          />
        </div>

        {/* Champ du nom du compositeur */}
        <div className="form-group">
          {errors.compositorName && (
            <div className="error-banner">{errors.compositorName}</div>
          )}

          <label htmlFor="compositorName">
            {intl.formatMessage({ id: 'form.compositorName' })} {intl.formatMessage({ id: 'form.required' })}
          </label>

          <input
            type="text"
            id="compositorName"
            name="compositorName"
            value={formData.compositorName}
            onChange={handleChange}
          />
        </div>

        {/* URL de l'image du compositeur */}
        <div className="form-group">
          {errors.compositorImageUrl && (
            <div className="error-banner">{errors.compositorImageUrl}</div>
          )}

          <label htmlFor="compositorImageUrl">
            {intl.formatMessage({ id: 'form.compositorImage' })} {intl.formatMessage({ id: 'form.required' })}
          </label>

          <input
            type="url"
            id="compositorImageUrl"
            name="compositorImageUrl"
            value={formData.compositorImageUrl}
            onChange={handleChange}
          />
        </div>

        {/* Compositeur est vivant */}
        <div className="form-group checkbox-group">
          <label htmlFor="compositorIsAlive">
            <input
              type="checkbox"
              id="compositorIsAlive"
              name="compositorIsAlive"
              checked={formData.compositorIsAlive}
              onChange={handleChange}
            />
            {intl.formatMessage({ id: 'form.compositorAlive' })}
          </label>
        </div>

        {/* Ligne avec durée et difficulté */}
        <div className="form-row">

          {/* Durée en minutes */}
          <div className="form-group">
            {errors.durationMinutes ? (
              <div className="error-banner">{errors.durationMinutes}</div>
            ) : (
              <div className="error-banner" style={{ visibility: 'hidden' }}>Placeholder</div>
            )}

            <label htmlFor="durationMinutes">
              {intl.formatMessage({ id: 'form.duration' })} {intl.formatMessage({ id: 'form.required' })}
            </label>

            <input
              type="number"
              id="durationMinutes"
              name="durationMinutes"
              value={formData.durationMinutes}
              onChange={handleChange}
            />
          </div>

          {/* Niveau de difficulté */}
          <div className="form-group">
            {errors.difficultyLevel ? (
              <div className="error-banner">{errors.difficultyLevel}</div>
            ) : (
              <div className="error-banner" style={{ visibility: 'hidden' }}>Placeholder</div>
            )}

            <label htmlFor="difficultyLevel">
              {intl.formatMessage({ id: 'form.difficulty' })} {intl.formatMessage({ id: 'form.required' })}
            </label>

            <input
              type="number"
              id="difficultyLevel"
              name="difficultyLevel"
              value={formData.difficultyLevel}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Date de sortie */}
        <div className="form-group">
          {errors.dateOfRelease && (
            <div className="error-banner">{errors.dateOfRelease}</div>
          )}

          <label htmlFor="dateOfRelease">
            {intl.formatMessage({ id: 'form.releaseDate' })} {intl.formatMessage({ id: 'form.required' })}
          </label>

          <input
            type="date"
            id="dateOfRelease"
            name="dateOfRelease"
            value={formData.dateOfRelease}
            onChange={handleChange}
          />
        </div>

        {/* Instruments */}
        <div className="form-group">
          {errors.instruments && (
            <div className="error-banner">{errors.instruments}</div>
          )}

          <label htmlFor="instruments">
            {intl.formatMessage({ id: 'form.instruments' })} {intl.formatMessage({ id: 'form.required' })}
          </label>

          <textarea
            id="instruments"
            name="instruments"
            value={formData.instruments}
            onChange={handleChange}
            placeholder={intl.formatMessage({ id: 'form.instrumentsPlaceholder' })}
            rows={3}
          />
        </div>

        {/* Styles */}
        <div className="form-group">
          {errors.styles && (
            <div className="error-banner">{errors.styles}</div>
          )}

          <label htmlFor="styles">
            {intl.formatMessage({ id: 'form.styles' })} {intl.formatMessage({ id: 'form.required' })}
          </label>

          <textarea
            id="styles"
            name="styles"
            value={formData.styles}
            onChange={handleChange}
            placeholder={intl.formatMessage({ id: 'form.stylesPlaceholder' })}
            rows={3}
          />
        </div>

        <div className="form-buttons">

          {/* Bouton envoyer */}
          <button type="submit" disabled={loading} className="submit-button">
            {loading 
              ? intl.formatMessage({ id: 'form.saving' })
              : (piece 
                  ? intl.formatMessage({ id: 'form.update' })
                  : intl.formatMessage({ id: 'form.submit' })
                )
            }
          </button>

          {/* Bouton annuler */}
          <button type="button" onClick={onCancel} className="cancel-button">
            {intl.formatMessage({ id: 'form.cancel' })}
          </button>

        </div>
      </form>
    </div>
  );
}