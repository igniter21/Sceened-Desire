import React, { useState, useRef, useEffect } from 'react';

const languageMap = {
  en: 'ENG', hi: 'HIN', ja: 'JPN', ko: 'KOR', fr: 'FRA', de: 'DEU',
  es: 'ESP', ru: 'RUS', it: 'ITA', tr: 'TUR', pl: 'POL', sv: 'SWE',
  fi: 'FIN', cs: 'CZE', th: 'THA',
};

const MovieCard = ({ movie: { title, vote_average, poster_path, release_date, original_language, trailerKey } }) => {
  const [showTrailer, setShowTrailer] = useState(false);
  const trailerRef = useRef(null);

  const handleClickOutside = (e) => {
    if (trailerRef.current && !trailerRef.current.contains(e.target)) {
      setShowTrailer(false);
    }
  };

  useEffect(() => {
    if (showTrailer) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTrailer]);

  return (
    <>
      <div
        className="movie-card group transition-transform duration-300 rounded-lg overflow-hidden relative shadow-black hover:scale-105 hover:z-10 hover:shadow-[0_0_30px_5px_rgba(255,255,255,0.2)]"
      >
        <img
        src={poster_path ?
          `https://image.tmdb.org/t/p/w500/${poster_path}` : '/no-movie.png'}
        alt={title}
      />

        
        {trailerKey && (
          <button
            onClick={() => setShowTrailer(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <img src="./play-button.svg" alt="Play Trailer" className="w-36 h-36" />
          </button>
        )}

        <div className="mt-2">
          <h3>{title}</h3>
          <div className="content">
            <div className="rating">
              <img src="./star.svg" alt="Star Icon" />
              <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
            </div>
            <span>.</span>
            <p className="lang">{languageMap[original_language] || original_language.toUpperCase()}</p>
            <span>.</span>
            <p className="year">{release_date ? release_date.split('-')[0] : 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Trailer Modal Popup */}
      {showTrailer && trailerKey && (
        <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div
            ref={trailerRef}
            className="w-[70%] h-[600px] bg-black rounded-lg shadow-[0_0_40px_rgba(254,106,95,0.6)] hover:shadow-[0_0_60px_rgba(121,150,169,0.8)] transition duration-300 overflow-hidden"
          >
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=1&controls=1`}
              className="w-full h-full"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={`${title} Trailer`}
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
};

export default MovieCard;
