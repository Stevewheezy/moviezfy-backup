// Your API Key and Access Token
const API_KEY = 'a828c2cfa3a0f8d72a0e1cc7eb5f0a4c';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhODI4YzJjZmEzYTBmOGQ3MmEwZTFjYzdlYjVmMGE0YyIsIm5iZiI6MTczNjk4MTkzMy45MzUwMDAyLCJzdWIiOiI2Nzg4M2RhZDFkNGM5MWY2YWM5NzYxNzQiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.Ev7Aa5tp9A7sYmw0TdfikL2BJjHiTvK7VyG4zlUp68Y';

// DOM Elements
const searchBar = document.getElementById('search-bar');
const searchBtn = document.getElementById('search-btn');
const movieGrid = document.getElementById('movie-grid');
const selectedGenreElement = document.getElementById('selected-genre');
const movieDetailContainer = document.getElementById('movie-detail-container');
const loadMoreBtn = document.getElementById('load-more-btn'); // Show more button

// API Endpoints
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
let currentPage = 1; // Tracks the current page being fetched
let lastQueryType = 'popular'; // Tracks the last action ('popular', 'search', 'genre')
let lastQueryValue = ''; // Tracks the search query or genre ID

// Fetch Random Movies on Page Load
document.addEventListener('DOMContentLoaded', () => {
  const pathname = window.location.pathname;

  if (pathname.includes('details.html')) {
    // Fetch and display movie details if on the details page
    const movieId = new URLSearchParams(window.location.search).get('id');
    if (movieId) fetchMovieDetails(movieId);
  } else {
    // Fetch popular movies if on the home page
    fetchRandomMovies();
  }
});

// Fetch and Display Popular Movies
async function fetchRandomMovies() {
  try {
    const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&page=${currentPage}`);
    const data = await response.json();

    if (data.results.length === 0 && currentPage === 1) {
      movieGrid.innerHTML = '<p>No movies found. Try a different search.</p>';
      return;
    }

    lastQueryType = 'popular';
    displayMovies(data.results);
  } catch (error) {
    console.error('Error fetching random movies:', error);
    movieGrid.innerHTML = '<p>Failed to load movies. Please try again later.</p>';
  }
}

// Fetch and Display Movies by Search Query
async function searchMovies() {
  const query = searchBar.value.trim();
  if (!query) return;

  try {
    const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&page=${currentPage}`);
    const data = await response.json();

    if (data.results.length === 0 && currentPage === 1) {
      movieGrid.innerHTML = '<p>No movies found. Try a different search.</p>';
      return;
    }

    lastQueryType = 'search';
    lastQueryValue = query;
    displayMovies(data.results);
  } catch (error) {
    console.error('Error searching movies:', error);
    movieGrid.innerHTML = '<p>Failed to load search results. Please try again later.</p>';
  }
}

// Fetch and Display Movies by Genre
async function filterMoviesByGenre(genre) {
  const genreMap = {
    'Action': 28,
    'Comedy': 35,
    'Drama': 18,
    'Thriller': 53,
    'Romance': 10749,
    'Horror': 27
  };

  const genreId = genreMap[genre];
  if (!genreId) return;

  try {
    const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&page=${currentPage}`);
    const data = await response.json();

    if (data.results.length === 0 && currentPage === 1) {
      movieGrid.innerHTML = '<p>No movies found for this genre.</p>';
      return;
    }

    lastQueryType = 'genre';
    lastQueryValue = genreId;
    displayMovies(data.results);
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    movieGrid.innerHTML = '<p>Failed to load movies. Please try again later.</p>';
  }
}

// Add Event Listeners to Genre Buttons
function initializeGenreButtons() {
  const genreButtons = document.querySelectorAll('.genre-btn');
  
  genreButtons.forEach(button => {
    button.addEventListener('click', () => {
      const genre = button.textContent.trim();

      // Highlight the selected button
      genreButtons.forEach(btn => btn.classList.remove('selected')); // Remove "selected" from all buttons
      button.classList.add('selected'); // Add "selected" to the clicked button

      filterMoviesByGenre(genre);
    });
  });
}

// Initialize the genre buttons when the page loads
document.addEventListener('DOMContentLoaded', () => {
  initializeGenreButtons();
});


// Fetch and Display Movie Details
async function fetchMovieDetails(movieId) {
  try {
    const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=videos,credits`);
    const movie = await response.json();

    if (!movie) {
      movieDetailContainer.innerHTML = '<p>Movie not found.</p>';
      return;
    }

    displayMovieDetails(movie);
  } catch (error) {
    console.error('Error fetching movie details:', error);
    movieDetailContainer.innerHTML = '<p>Failed to load movie details. Please try again later.</p>';
  }
}

// Display Movies in Grid Format
function displayMovies(movies) {
  if (currentPage === 1) movieGrid.innerHTML = ''; // Clear grid for the first page

  movies.forEach(movie => {
    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card', 'bg-gray-700', 'p-4', 'rounded-md', 'shadow-lg', 'cursor-pointer');

    const posterPath = movie.poster_path
      ? `${IMAGE_BASE_URL}${movie.poster_path}`
      : 'https://via.placeholder.com/500x750?text=No+Image';

    movieCard.innerHTML = `
      <a href="movie-details.html?id=${movie.id}">
        <img src="${posterPath}" alt="${movie.title}" class="w-full h-auto rounded-md mb-4">
        <h3 class="text-xl font-semibold text-white">${movie.title}</h3>
      </a>
    `;

    movieGrid.appendChild(movieCard);
  });
}

// Display Movie Details
function displayMovieDetails(movie) {
  const { title, overview, release_date, runtime, genres, poster_path, vote_average, videos, credits } = movie;

  const posterPath = poster_path
    ? `${IMAGE_BASE_URL}${poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Image';
  const genreList = genres.map(genre => genre.name).join(', ');
  const castList = credits.cast.slice(0, 5).map(cast => cast.name).join(', ');

  const trailer = videos.results.find(video => video.type === 'Trailer');
  const trailerLink = trailer
    ? `<a href="https://www.youtube.com/watch?v=${trailer.key}" target="_blank" class="text-blue-500 underline">Watch Trailer</a>`
    : 'Trailer not available';

  movieDetailContainer.innerHTML = `
    <div class="flex flex-col md:flex-row gap-6">
      <img src="${posterPath}" alt="${title}" class="w-64 rounded-md">
      <div>
        <h2 class="text-3xl font-bold text-white mb-4">${title}</h2>
        <p class="text-gray-400 mb-2"><strong>Runtime:</strong> ${runtime || 'Unknown'} mins</p>
        <p class="text-gray-400 mb-2"><strong>Genres:</strong> ${genreList || 'Unknown'}</p>
        <p class="text-gray-400 mb-4"><strong>Rating:</strong> ${vote_average || 'N/A'}</p>
        <p class="text-gray-200 mb-6">${overview || 'No description available.'}</p>
        <p class="text-gray-400 mb-4"><strong>Cast:</strong> ${castList || 'Unknown'}</p>
        <div>${trailerLink}</div>
      </div>
    </div>
  `;
}

// "Show More" Button Event Listener
loadMoreBtn.addEventListener('click', async () => {
  currentPage += 1;

  try {
    if (lastQueryType === 'popular') {
      await fetchRandomMovies();
    } else if (lastQueryType === 'search') {
      await searchMovies();
    } else if (lastQueryType === 'genre') {
      await filterMoviesByGenre(Object.keys(genreMap).find(key => genreMap[key] === lastQueryValue));
    }
  } catch (error) {
    console.error('Error loading more movies:', error);
    loadMoreBtn.textContent = 'Failed to Load More';
    loadMoreBtn.disabled = true;
  }
});

// Search Button Event Listener
searchBtn.addEventListener('click', () => {
  currentPage = 1; // Reset to the first page
  searchMovies();
});
