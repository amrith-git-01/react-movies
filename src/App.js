import { useRef, useEffect, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const average = (arr) =>
	arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "eb867e6a";

export default function App() {
	const [query, setQuery] = useState("");
	const [selectedId, setSelectedId] = useState(null);

	const { movies, isLoading, error } = useMovies(query);
	const [watched, setWatched] = useLocalStorageState([], "watched");

	function handleSelectMovie(id) {
		setSelectedId((selectedId) => (id === selectedId ? null : id));
	}

	function handleCloseMovie() {
		setSelectedId(null);
	}

	function handleAddWatched(movie) {
		setWatched((watched) => [...watched, movie]);

		// localStorage.setItem("watched", JSON.stringify([...watched, movie]));
	}

	function handleDeleteWatched(id) {
		setWatched((watched) => watched.filter((movie) => movie.id !== id));
	}

	useEffect(function () {
		document.addEventListener("keydown", function (e) {
			if (e.code === "Escape") handleCloseMovie();
		});
	});

	return (
		<>
			<NavBar>
				<Logo />
				<Search query={query} setQuery={setQuery} />
				<NumResults movies={movies} />
			</NavBar>
			<Main>
				{/* <Box element={<MovieList movies={movies} />} />
				<Box
					element={
						<>
							<Summary watched={watched} />
							<WatchedMovieList watched={watched} />
						</>
					}
				/> */}
				<Box>
					{/* // isLoading ? <Loader /> : <MovieList movies={movies} /> */}
					{isLoading && <Loader />}
					{!isLoading && !error && (
						<MovieList movies={movies} onSelectMovie={handleSelectMovie} />
					)}
					{error && <ErrorMessage message={error} />}
				</Box>
				<Box>
					{selectedId ? (
						<MovieDetails
							selectedId={selectedId}
							onCloseMovie={handleCloseMovie}
							onAddWatched={handleAddWatched}
							watched={watched}
						/>
					) : (
						<>
							<Summary watched={watched} />
							<WatchedMovieList
								watched={watched}
								onDeleteWatched={handleDeleteWatched}
							/>
						</>
					)}
				</Box>
			</Main>
		</>
	);
}

function Loader() {
	return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
	return (
		<p className="error">
			<span>❌</span>
			{message}
		</p>
	);
}

function NavBar({ children }) {
	return <nav className="nav-bar">{children}</nav>;
}

function Logo() {
	return (
		<div className="logo">
			<span role="img">🍿</span>
			<h1>usePopcorn</h1>
		</div>
	);
}

function Search({ query, setQuery }) {
	const inputEl = useRef(null);

	useKey("Enter", function () {
		if (document.activeElement === inputEl.current) return;

		inputEl.current.focus();
		setQuery("");
	});

	return (
		<input
			className="search"
			type="text"
			placeholder="Search movies..."
			value={query}
			onChange={(e) => setQuery(e.target.value)}
			ref={inputEl}
		/>
	);
}

function NumResults({ movies }) {
	return (
		<p className="num-results">
			Found <strong>{movies.length}</strong> results
		</p>
	);
}

function Main({ children }) {
	return <main className="main">{children}</main>;
}

function Box({ children }) {
	const [isOpen, setIsOpen] = useState(true);
	return (
		<div className="box">
			<button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
				{isOpen ? "–" : "+"}
			</button>
			{isOpen && children}
		</div>
	);
}

// function WatchedBox() {
// 	const [isOpen2, setIsOpen2] = useState(true);

// 	return (
// 		<div className="box">
// 			<button
// 				className="btn-toggle"
// 				onClick={() => setIsOpen2((open) => !open)}
// 			>
// 				{isOpen2 ? "–" : "+"}
// 			</button>
// 			{isOpen2 && (
// 				<>
// 					<Summary watched={watched} />
// 					<WatchedMovieList watched={watched} />
// 				</>
// 			)}
// 		</div>
// 	);
// }

function Summary({ watched }) {
	const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
	const avgUserRating = average(watched.map((movie) => movie.userRating));
	const avgRuntime = average(watched.map((movie) => movie.runtime));

	return (
		<div className="summary">
			<h2>Movies you watched</h2>
			<div>
				<p>
					<span>#️⃣</span>
					<span>{watched.length} movies</span>
				</p>
				<p>
					<span>⭐️</span>
					<span>{avgImdbRating}</span>
				</p>
				<p>
					<span>🌟</span>
					<span>{avgUserRating}</span>
				</p>
				<p>
					<span>⏳</span>
					<span>{avgRuntime} min</span>
				</p>
			</div>
		</div>
	);
}

function WatchedMovieList({ watched, onDeleteWatched }) {
	return (
		<ul className="list">
			{watched.map((movie) => (
				<WatchedMovie
					movie={movie}
					key={movie.imdbID}
					onDeleteWatched={onDeleteWatched}
				/>
			))}
		</ul>
	);
}

function WatchedMovie({ movie, onDeleteWatched }) {
	return (
		<li key={movie.imdbID}>
			<img src={movie.poster} alt={`${movie.Title} poster`} />
			<h3>{movie.title}</h3>
			<div>
				<p>
					<span>⭐️</span>
					<span>{movie.imdbRating.toFixed(2)}</span>
				</p>
				<p>
					<span>🌟</span>
					<span>{movie.userRating.toFixed(2)}</span>
				</p>
				<p>
					<span>⏳</span>
					<span>{movie.runtime} min</span>
				</p>
				<button
					className="btn-delete"
					onClick={(movie) => onDeleteWatched(movie.imdbID)}
				>
					X
				</button>
			</div>
		</li>
	);
}

function MovieList({ movies, onSelectMovie }) {
	return (
		<ul className="list list-movies">
			{movies?.map((movie) => (
				<Movie key={movie.imdbID} movie={movie} onSelectMovie={onSelectMovie} />
			))}
		</ul>
	);
}

function Movie({ movie, onSelectMovie }) {
	return (
		<li onClick={() => onSelectMovie(movie.imdbID)} key={movie.imdbID}>
			<img src={movie.Poster} alt={`${movie.Title} poster`} />
			<h3>{movie.Title}</h3>
			<div>
				<p>
					<span>🗓</span>
					<span>{movie.Year}</span>
				</p>
			</div>
		</li>
	);
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
	const [movie, setMovie] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const [userRating, setUserRating] = useState("");

	const countRef = useRef(0);

	useEffect(
		function () {
			if (userRating) countRef.current++;
		},
		[userRating]
	);

	const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
	const watchedUserRating = watched.find(
		(movie) => movie.imdbID === selectedId
	)?.userRating;

	const {
		Title: title,
		Year: year,
		Poster: poster,
		Runtime: runtime,
		imdbRating,
		Plot: plot,
		Released: released,
		Actors: actors,
		Director: director,
		Genre: genre,
	} = movie;

	// /* eslint-disable */
	// if (imdbRating > 8) {
	// 	[isStop, setIsTop] = useState();
	// }

	function handleAdd() {
		const newWatchedMovie = {
			imdbID: selectedId,
			title,
			year,
			poster,
			imdbRating: Number(imdbRating),
			runtime: Number(runtime.split(" ").at(0)),
			userRating,
			countRatingDecision: countRef.current,
		};
		onAddWatched(newWatchedMovie);
		onCloseMovie();
	}

	useKey("escape", onCloseMovie);

	useEffect(
		function () {
			async function getMovieDetails() {
				setIsLoading(true);
				const res = await fetch(
					`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
				);
				const data = await res.json();
				setMovie(data);
				setIsLoading(false);
			}
			getMovieDetails();
		},
		[selectedId]
	);

	useEffect(
		function () {
			if (!title) return;
			document.title = `Movie | ${title}`;

			return function () {
				document.title = "usePopcorn";
			};
		},
		[title]
	);

	return (
		<div className="selected-movie">
			{isLoading ? (
				<Loader />
			) : (
				<>
					<header>
						<button className="btn-back" onClick={onCloseMovie}>
							&larr;
						</button>
						<img src={poster} alt={`${movie} poster`}></img>
						<div className="details-overview">
							<h2>{title}</h2>
							<p>
								{released} &bull; {runtime}
							</p>
							<p>{genre}</p>
							<p>
								<span>⭐️</span>
								{imdbRating} IMDb rating
							</p>
						</div>
					</header>
					<section>
						<div className="rating">
							{isWatched ? (
								<p className="watched-rating">
									<span>🌟 Your Rating: {watchedUserRating}</span>
								</p>
							) : (
								<div>
									<StarRating
										maxRating={10}
										size={24}
										onSetRating={setUserRating}
									/>
									{userRating && (
										<button className="btn-add" onClick={handleAdd}>
											Add to Watched
										</button>
									)}
								</div>
							)}
						</div>
						<p>
							<em>{plot}</em>
						</p>
						<p>Starring {actors}</p>
						<p>Directed by {director}</p>
					</section>
				</>
			)}
		</div>
	);
}
