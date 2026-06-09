import React from 'react'
import Search from './components/Search'
import { useEffect,useState } from 'react';
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import {useDebounce} from 'react-use';
import { updateSearchCount, getTrendingMovies } from './appwrite.js';
import ChatInterface from './components/ChatInterface';




const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY= import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS={
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetch('http://localhost:8000/api/auth/profile/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setUser(data.user);
        })
        .catch((err) => {
          console.error('Failed to validate token:', err);
          localStorage.removeItem('access_token');
          setUser(null);
        });
    }
  }, []);

  
  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');
  
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
  
      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) throw new Error('Failed to fetch movies');
      const data = await response.json();
      const movieResults = data.results || [];
  
      const moviesWithTrailers = await Promise.all(
        movieResults.map(async (movie) => {
          try {
            const trailerRes = await fetch(
              `${API_BASE_URL}/movie/${movie.id}/videos`,
              API_OPTIONS
            );
            const trailerData = await trailerRes.json();
            const trailer = trailerData.results.find(
              (v) => v.type === 'Trailer' && v.site === 'YouTube'
            );
  
            return {
              ...movie,
              trailerKey: trailer?.key || null,
            };
          } catch (err) {
            console.error(`Trailer fetch error for ${movie.title}:`, err);
            return {
              ...movie,
              trailerKey: null,
            };
          }
        })
      );
  
      setMovieList(moviesWithTrailers);
      if (query && moviesWithTrailers.length === 0) {
        setErrorMessage('No Movies with such name found!!');
      }
      

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies:`, error);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  const fetchMoviesByGenre = async (genreId) => {
    if (!genreId) {
      fetchMovies(); // If no genre is selected, fetch all/popular movies
      return;
    }
  
    setIsLoading(true);
    setErrorMessage('');
  
    try {
      const endpoint = `${API_BASE_URL}/discover/movie?with_genres=${genreId}&sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) throw new Error('Failed to fetch movies by genre');
      const data = await response.json();
      const movieResults = data.results || [];
  
      const moviesWithTrailers = await Promise.all(
        movieResults.map(async (movie) => {
          try {
            const trailerRes = await fetch(
              `${API_BASE_URL}/movie/${movie.id}/videos`,
              API_OPTIONS
            );
            const trailerData = await trailerRes.json();
            const trailer = trailerData.results.find(
              (v) => v.type === 'Trailer' && v.site === 'YouTube'
            );
  
            return {
              ...movie,
              trailerKey: trailer?.key || null,
            };
          } catch (err) {
            console.error(`Trailer fetch error for ${movie.title}:`, err);
            return {
              ...movie,
              trailerKey: null,
            };
          }
        })
      );
  
      setMovieList(moviesWithTrailers);
      if (moviesWithTrailers.length === 0) {
        setErrorMessage('No movies found for the selected genre');
      }
    } catch (error) {
      console.error(`Error fetching movies by genre:`, error);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMoviesByYear = async (year) => {
    if (!year) {
      fetchMovies(); // If no year is selected, fetch all/popular movies
      return;
    }
  
    setIsLoading(true);
    setErrorMessage('');
  
    try {
      const endpoint = `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&primary_release_year=${year}`;
      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) throw new Error('Failed to fetch movies by year');
      const data = await response.json();
      const movieResults = data.results || [];
  
      const moviesWithTrailers = await Promise.all(
        movieResults.map(async (movie) => {
          try {
            const trailerRes = await fetch(
              `${API_BASE_URL}/movie/${movie.id}/videos`,
              API_OPTIONS
            );
            const trailerData = await trailerRes.json();
            const trailer = trailerData.results.find(
              (v) => v.type === 'Trailer' && v.site === 'YouTube'
            );
  
            return {
              ...movie,
              trailerKey: trailer?.key || null,
            };
          } catch (err) {
            console.error(`Trailer fetch error for ${movie.title}:`, err);
            return {
              ...movie,
              trailerKey: null,
            };
          }
        })
      );
  
      setMovieList(moviesWithTrailers);
      if (moviesWithTrailers.length === 0) {
        setErrorMessage(`No movies found for year ${year}`);
      }
    } catch (error) {
      console.error(`Error fetching movies by year:`, error);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  
  const loadTrendingMovies = async () => {
    try{
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);
    }catch(error) {
      console.error(`Error fetching movies:",${error}`);
    }
  }



  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  },[debouncedSearchTerm]);

  useEffect(() => {loadTrendingMovies()},[]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    window.location.href = 'http://localhost:8000'; // Back to Django SPA
  };

  return (
    <main>
      <ChatInterface />
      
      <div className='pattern fixed' />
      <div className='wrapper'>
        <header>
          
          {/* <img src ="./hero.png" alt="Hero Banner" /> */}
          <div className="text-white text-center mt-20 space-y-2 text-4xl md:text-6xl font-bold">
      <h1 className="animate-fade-up delay-400">
        Ever had an <span className="text-gradient animate-pop delay-700">Obsession?</span> Now's
      </h1>
      <h1 className="animate-fade-up delay-600">the time!</h1>
    </div>

        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
        </header>

        {trendingMovies.length > 0 && (
          <section className='trending '>
            <h2>
              Trending Movies
            </h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index+1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>

          </section>
          )}
          

        <section className='all-movies'>
          <h2 className='soul' >
          What obsession whispers to your <span className='text-gradient'>Soul</span>?


          </h2>

  <div className="mb-6 flex-row justify-end">
    <div className="mb-6 flex justify-end">
  
  <select
    className="p-2 rounded bg-black text-white border border-blue-300"
    onChange={(e) => fetchMoviesByYear(e.target.value)}
  >
    <option value="">Sort by Year</option>
    <option value="2025">2025</option>
    <option value="2024">2024</option>
    <option value="2023">2023</option>
    
    {/* Add more years */}
  </select>
  <select
    className="p-2 rounded bg-black text-white border border-blue-300"
    onChange={(e) => fetchMoviesByGenre(e.target.value)}
  >
    <option value="">All Genres</option>
    <option value="28">Action</option>
    <option value="35">Comedy</option>
    <option value="18">Drama</option>
    <option value="27">Horror</option>
    <option value="10749">Romance</option>
    <option value="878">Science Fiction</option>
    <option value="53">Thriller</option>
    {/* Add more genres as needed */}
  </select>
</div>
  
</div>

          {isLoading ? (
            <Spinner/>

          ) : errorMessage ? (
            <p className='text-red-500'>{errorMessage}</p>
          ):(
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie}/>
              ))}
            </ul>
          )}
        </section>


      </div>
    </main>
  )
}

export default App