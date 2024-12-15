import express from 'express';
import { client } from './client.js';
import bcrypt from 'bcrypt';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('<h1>Welcome to the Movie API!</h1>');
});

// 1. Adding new genres
app.post('/genres', async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Genre name is required' });
    }
    try {
        const result = await client.query('INSERT INTO Genre (Name) VALUES ($1) RETURNING *', [name]);
        res.status(201).json({ message: 'Genre added successfully', genre: result.rows[0] });
    } catch (error) {
        res.status(400).json({ error: error.detail || 'Error adding genre' });
    }
});

app.get('/genres', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM Genre');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// 2. Adding new movies
app.post('/movies', async (req, res) => {
    const { name, year, genre } = req.body;
    if (!name || !year || !genre) {
        return res.status(400).json({ error: 'Name, year, and genre are required' });
    }
    try {
        const genreResult = await client.query('SELECT GenreID FROM Genre WHERE Name = $1', [genre]);
        if (genreResult.rowCount === 0) {
            return res.status(400).json({ error: `Genre '${genre}' does not exist` });
        }
        const genreId = genreResult.rows[0].genreid;
        const result = await client.query(
            'INSERT INTO Movie (Name, Year, GenreID) VALUES ($1, $2, $3) RETURNING *',
            [name, year, genreId]
        );
        res.status(201).json({ message: 'Movie added successfully', movie: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// 3. Getting all movies with pagination
app.get('/movies', async (req, res) => {
    const { page = 1 } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;
    try {
        const result = await client.query(
            `SELECT m.MovieID, m.Name, m.Year, g.Name as Genre
             FROM Movie m
             JOIN Genre g ON m.GenreID = g.GenreID
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// 4. Getting movie by id
app.get('/movies/:id', async (req, res) => {
    const movieId = parseInt(req.params.id);
    try {
        const result = await client.query(
            `SELECT m.MovieID, m.Name, m.Year, g.Name as Genre
             FROM Movie m
             JOIN Genre g ON m.GenreID = g.GenreID
             WHERE m.MovieID = $1`,
            [movieId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// 5. Removing movie by id
app.delete('/movies/:id', async (req, res) => {
    const movieId = parseInt(req.params.id);
    try {
        const result = await client.query('DELETE FROM Movie WHERE MovieID = $1 RETURNING *', [movieId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        res.json({ message: 'Movie deleted successfully', movie: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// 6. Searching movies by keyword
app.get('/movies/search', async (req, res) => {
    const { keyword } = req.query;
    if (!keyword) {
        return res.status(400).json({ error: 'Keyword is required' });
    }
    try {
        const result = await client.query(
            `SELECT m.MovieID, m.Name, m.Year, g.Name as Genre
             FROM Movie m
             JOIN Genre g ON m.GenreID = g.GenreID
             WHERE m.Name ILIKE $1`,
            [`%${keyword}%`]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// 7. Adding user registration with hashed passwords
app.post('/users', async (req, res) => {
    const { name, username, password, yearOfBirth } = req.body;
    if (!name || !username || !password || !yearOfBirth) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await client.query(
            'INSERT INTO MovieUser (Name, Username, Password, YearOfBirth) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, username, hashedPassword, yearOfBirth]
        );
        res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// 8. Adding movie reviews
app.post('/reviews', async (req, res) => {
    const { username, stars, reviewText, movieId } = req.body;
    if (!username || !stars || !reviewText || !movieId) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    try {
        const result = await client.query(
            'INSERT INTO Review (Username, Stars, ReviewText, MovieID) VALUES ($1, $2, $3, $4) RETURNING *',
            [username, stars, reviewText, movieId]
        );
        res.status(201).json({ message: 'Review added successfully', review: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// 9. Adding favorite movies
app.post('/favorites', async (req, res) => {
    const { username, movieId } = req.body;
    if (!username || !movieId) {
        return res.status(400).json({ error: 'Username and movie ID are required' });
    }
    try {
        const result = await client.query(
            'INSERT INTO Favorite (Username, MovieID) VALUES ($1, $2) RETURNING *',
            [username, movieId]
        );
        res.status(201).json({ message: 'Favorite added successfully', favorite: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// 10. Getting favorite movies by username
app.get('/favorites/:username', async (req, res) => {
    const username = req.params.username;
    try {
        const result = await client.query(
            `SELECT m.* FROM Favorite f
             JOIN Movie m ON f.MovieID = m.MovieID
             WHERE f.Username = $1`,
            [username]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});