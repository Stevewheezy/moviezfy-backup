// API Key and Base URL
const API_KEY = 'a828c2cfa3a0f8d72a0e1cc7eb5f0a4c';
const BASE_URL = 'https://api.themoviedb.org/3';

// Fetch Movie ID from URL
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id');

// Fetch and Display Movie Details
async function fetchMovieDetails() {
  if (!movieId) {
    document.body.innerHTML = '<p class="text-center text-red-600 mt-20">Movie ID not found in the URL.</p>';
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US&append_to_response=credits,videos`);
    const data = await response.json();

    // Populate Movie Details
    document.getElementById('movie-poster').src = data.poster_path
      ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
      : 'https://via.placeholder.com/500x750?text=No+Image';
    document.getElementById('movie-title').textContent = data.title || 'N/A';
    document.getElementById('movie-description').textContent = data.overview || 'Description not available.';
    document.getElementById('movie-year').textContent = data.release_date ? data.release_date.split('-')[0] : 'N/A';
    document.getElementById('movie-rating').textContent = data.vote_average || 'N/A';
    document.getElementById('movie-duration').textContent = data.runtime ? `${data.runtime} mins` : 'N/A';

    // Genres
    const genres = data.genres.map(genre => genre.name).join(', ');
    document.getElementById('movie-genres').textContent = genres || 'N/A';

    // Cast
    const cast = data.credits.cast.slice(0, 5).map(actor => actor.name).join(', ');
    document.getElementById('movie-cast').textContent = cast || 'N/A';

    // Trailer
    const trailer = data.videos.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
    if (trailer) {
      document.getElementById('movie-trailer-link').href = `https://www.youtube.com/watch?v=${trailer.key}`;
    } else {
      document.getElementById('movie-trailer-link').classList.add('hidden');
    }

    // Reviews (if available)
    const reviews = data.credits.cast.length > 0 ? 'See cast for details.' : 'No reviews available.';
    document.getElementById('movie-review').textContent = reviews;

  } catch (error) {
    console.error('Error fetching movie details:', error);
    document.body.innerHTML = '<p class="text-center text-red-600 mt-20">An error occurred while fetching the movie details.</p>';
  }
}

// Initialize
fetchMovieDetails();
