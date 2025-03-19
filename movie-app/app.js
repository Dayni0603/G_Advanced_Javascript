document.addEventListener("DOMContentLoaded", async () => {
  const movies = await fetchMovies();
  if (movies) {
    displayMovies(movies);
  }
});

async function fetchMovies() {
  try {
    const reponse = await fetch("https://www.freetestapi.com/api/v1/movies");
    const movies = await reponse.json();
    return movies;
  } catch (error) {
    console.error("Error", error);
  }
}

function displayMovies(movies) {
  const moviesList = document.getElementById("movieList");
  moviesList.innerHTML = movies
    .map((movie) => `<li>${movie.title}</li>`)
    .join("");

  const totalMovies = movies.reduce((count, movies) => count + 1, 0);

  document.getElementById(
    "movieCount"
  ).textContent = `Total Movies: ${totalMovies}`;
}

document.getElementById("name").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const movieName = event.target.value.trim();
    if (movieName) {
      console.log(movieName);
      searchMoviesByName(movieName);
    }
  }
});

document.getElementById("genre").addEventListener("change", async () => {
  const movieGanre = event.target.value;
  const movies = await searchMoviesByGenre(movieGanre);
  if (movies) {
    displayMovies(movies);
  }
});

async function searchMoviesByGenre(genre) {
  const movies = await fetchMovies();

  if (movies.length > 0) {
    const filteredMovies = ProcessMovies(movies, createGanreFilter(genre));
    displayMovies(filteredMovies);
  }
}

async function searchMoviesByName(name) {
  const movies = await fetchMovies();

  if (movies.length > 0) {
    const filteredMovies = ProcessMovies(movies, createNameFilter(name));
    displayMovies(filteredMovies);
  }
}

function ProcessMovies(movies, opration) {
  return opration(movies);
}

function createNameFilter(name) {
  return function (movies) {
    return movies.filter((movie) =>
      movie.title.toLowerCase().includes(name.toLowerCase())
    );
  };
}

function createGanreFilter(movieGenre) {
  return function (movies) {
    return movies.filter((movie) =>
      movie.genre.some((genre) =>
        genre.toLowerCase().includes(movieGenre.toLowerCase())
      )
    );
  };
}
