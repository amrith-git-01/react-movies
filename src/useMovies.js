import { useState, useEffect } from "react";

const KEY = "eb867e6a";

export function useMovies(query) {
	const [isLoading, setIsLoading] = useState(false);
	const [movies, setMovies] = useState([]);
	const [error, setError] = useState("");
	useEffect(
		function () {
			// callback?.();
			const controller = new AbortController();
			async function fetchMovies() {
				try {
					setIsLoading(true);
					setError("");
					const res = await fetch(
						`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
						{ signal: controller.signal }
					);

					if (!res.ok) {
						throw new Error("Something went wrong with fetching movies");
					}

					const data = await res.json();
					if (data.Response === "False") throw new Error("Movie not found");
					setMovies(data.Search);
				} catch (err) {
					console.error(err.message);
					if (err.name !== "AbortError") {
						setError(err.message);
					}
				} finally {
					setIsLoading(false);
				}
			}
			if (query.length < 3) {
				setMovies([]);
				setError("");
				return;
			}
			fetchMovies();
			return function () {
				controller.abort();
			};
		},
		[query]
	);

	return { movies, isLoading, error };
}
