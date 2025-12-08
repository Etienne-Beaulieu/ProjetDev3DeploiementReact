import { useState, useEffect } from 'react';
import { IntlProvider, useIntl } from 'react-intl';

import { ListeDePieces } from '../Piece/ListeDePieces.tsx';
import { UnePiece } from '../Piece/UnePiece.tsx';
import { Formulaire } from '../Formulaire/Formulaire.tsx';
import { type Piece } from '../Piece/Piece.ts';

import frMessages from '../../lang/fr.json';
import enMessages from '../../lang/en.json';

import './App.css';

// Contenu principal sorti pour charger les langues avant
function AppContent({ locale, setLocale }: { locale: string; setLocale: (locale: string) => void }) {
  const intl = useIntl();

  // Mes variables d'etat pour refresh
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [filterIsAlive, setFilterIsAlive] = useState<boolean | null>(null);
  const [yearStart, setYearStart] = useState('');
  const [yearEnd, setYearEnd] = useState('');
  const [applyYearFilter, setApplyYearFilter] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPiece, setEditingPiece] = useState<Piece | undefined>(undefined);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Si on clique une piece le id n'est plus null et on le selectionne
  function selectPiece(id: string) {
    setSelectedPieceId(id);
  }

  // Toggle le boolean pour le filtre isAlive et mettre mettre le filtre between false
  function toggleAlive() {
    if (filterIsAlive === null) {
      setFilterIsAlive(true);
    } else if (filterIsAlive === true) {
      setFilterIsAlive(false);
    } else {
      setFilterIsAlive(null);
    }
    setApplyYearFilter(false);
    setYearStart('');
    setYearEnd('');
  }

  // Appliquer le filtre between si des annees sont entrees et mettre isAlive a null
  function applyYearFilterFunc() {
    const start = parseInt(yearStart);
    const end = parseInt(yearEnd);
    
    if (!isNaN(start) && !isNaN(end) && start <= end) {
      setApplyYearFilter(true);
      setFilterIsAlive(null);
    } else {
      alert(intl.formatMessage({ id: 'app.filter.yearValidation' }));
    }
  }

  // Reset les filtres pour actualiser la liste et montrer toute les pieces
  function resetFilters() {
    setFilterIsAlive(null);
    setYearStart('');
    setYearEnd('');
    setApplyYearFilter(false);
  }

  // Petite mention sur ce qui est actuellement afficher selon le filtre
  function getFilterStatus() {
    if (filterIsAlive === true) return intl.formatMessage({ id: 'app.filter.status.alive' });
    if (filterIsAlive === false) return intl.formatMessage({ id: 'app.filter.status.deceased' });
    if (applyYearFilter && yearStart && yearEnd) {
      return intl.formatMessage(
        { id: 'app.filter.status.years' },
        { start: yearStart, end: yearEnd }
      );
    }
    return intl.formatMessage({ id: 'app.filter.status.all' });
  }

  // Caller le formulaire add vide
  function addPiece() {
    setEditingPiece(undefined);
    setShowForm(true);
  }

  // Caller le formulaire update rempli avec les infos de la piece
  function editPiece(piece: Piece) {
    setEditingPiece(piece);
    setShowForm(true);
  }

  // On ferme le formulaire si ca passe coter validations
  function formSuccess() {
    setShowForm(false);
    setEditingPiece(undefined);
    setRefreshTrigger(refreshTrigger + 1);
  }

  // On ferme le formulaire si l'utilisateur annule
  function formCancel() {
    setShowForm(false);
    setEditingPiece(undefined);
  }

  return (
    <div>
      {showForm ? (
        <Formulaire 
          piece={editingPiece}
          onSuccess={formSuccess}
          onCancel={formCancel}
        />
      ) : selectedPieceId ? (
        <UnePiece 
          id={selectedPieceId} 
          onBack={() => setSelectedPieceId(null)} 
        />
      ) : (
        <>
          <div className="filters-container">
            <h1>{intl.formatMessage({ id: 'app.title' })}</h1>
            
            {/* Bouton pour changer de langue */}
            <button 
              onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')} 
              className="language-button"
            >
              {locale === 'fr' ? 'English' : 'Français'}
            </button>
            
            <button onClick={addPiece} className="add-piece-button">
              ➕ {intl.formatMessage({ id: 'app.addPiece' })}
            </button>

            {/* Selon isAlive on affiche la bonne chose */}
            <div className="filter-section">
              <h3>{intl.formatMessage({ id: 'app.filter.status' })}</h3>
              <button onClick={toggleAlive} className="filter-button">
                {filterIsAlive === null && `✅ ${intl.formatMessage({ id: 'app.filter.all' })}`}
                {filterIsAlive === true && `😀 ${intl.formatMessage({ id: 'app.filter.alive' })}`}
                {filterIsAlive === false && `💀 ${intl.formatMessage({ id: 'app.filter.deceased' })}`}
              </button>
            </div>

            {/* Maximum des annees a l'annee actuelle */}
            <div className="filter-section">
              <h3>{intl.formatMessage({ id: 'app.filter.years' })}</h3>
              <div className="year-inputs">
                <input 
                  type="number" 
                  placeholder={intl.formatMessage({ id: 'app.filter.yearPlaceholder' })}
                  value={yearStart}
                  onChange={(e) => setYearStart(e.target.value)}
                  min="1000"
                  max={new Date().getFullYear()}
                />
                <span>{intl.formatMessage({ id: 'app.filter.to' })}</span>
                <input 
                  type="number" 
                  placeholder={intl.formatMessage({ id: 'app.filter.yearPlaceholder' })}
                  value={yearEnd}
                  onChange={(e) => setYearEnd(e.target.value)}
                  min="1000"
                  max={new Date().getFullYear()}
                />
                <button onClick={applyYearFilterFunc} className="apply-button">
                  {intl.formatMessage({ id: 'app.filter.apply' })}
                </button>
              </div>
            </div>

            {/* Si un filtre est appliquer le bouton reset apparait */}
            {(filterIsAlive !== null || applyYearFilter) && (
              <button onClick={resetFilters} className="reset-button">
                {intl.formatMessage({ id: 'app.filter.reset' })}
              </button>
            )}

            <p className="filter-status">{getFilterStatus()}</p>
          </div>
          
          {/* Relier aux fonctions de ListeDePieces les filtres pour afficher la bonne liste */}
          <ListeDePieces 
            onPieceSelect={selectPiece}
            onPieceEdit={editPiece}
            filterIsAlive={filterIsAlive}
            filterYearStart={applyYearFilter ? parseInt(yearStart) : null}
            filterYearEnd={applyYearFilter ? parseInt(yearEnd) : null}
            refreshTrigger={refreshTrigger}
          />
        </>
      )}
    </div>
  );
}

// J'ai du sortir le content pour charger les langues avant le login
function App() {
  const [locale, setLocale] = useState('fr');
  const [messages, setMessages] = useState(frMessages);

  useEffect(() => {
    if (locale === 'fr') {
      setMessages(frMessages);
    } else {
      setMessages(enMessages);
    }
  }, [locale]);

  return (
    <IntlProvider locale={locale} messages={messages}>
      <AppContent locale={locale} setLocale={setLocale} />
    </IntlProvider>
  );
}

export default App;