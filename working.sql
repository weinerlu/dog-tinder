SELECT DISTINCT genre FROM Genres;

SELECT title, rating, vote_count
FROM Movies
JOIN Genres ON movie_id = id
WHERE genre = 'Crime'
ORDER BY rating DESC, vote_count DESC
LIMIT 10;


WITH all_gen as (SELECT genre
FROM Genres
where movie_id =(SELECT id from Movies where title='Tales of Terror'))
SELECT title, id, rating, vote_count, Genres.genre, all_gen.genre FROM Movies
LEFT JOIN Genres ON id=movie_id
LEFT JOIN all_gen ON Genres.genre = all_gen.genre
WHERE id = 13122;

WITH all_gen as (SELECT genre
FROM Genres
where movie_id =(SELECT id from Movies where title='Tales of Terror'))
SELECT title, id, rating, vote_count FROM Movies
LEFT JOIN Genres ON id=movie_id
LEFT JOIN all_gen ON Genres.genre = all_gen.genre
WHERE title <> 'Tales of Terror'
GROUP BY title, id, rating, vote_count
HAVING COUNT(all_gen.genre) >= ALL (SELECT COUNT(genre) FROM all_gen)
ORDER BY rating DESC, vote_count DESC
LIMIT 5;

With best as (SELECT genre, max(vote_count) as voters
FROM Movies
JOIN Genres
ON movie_id = id
WHERE release_year >= 1970 AND release_year < 1970 + 10
GROUP BY genre)
SELECT best.genre, title, vote_count, release_year
FROM Movies
JOIN Genres
ON movie_id = id
RIGHT JOIN best
ON best.genre = Genres.genre AND voters = vote_count
WHERE release_year >= 1970 AND release_year < 1970 + 10
GROUP BY genre
ORDER BY genre;
