import express from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Simuloidaan tietokantoja taulukoilla
let genres = [];
let movies = [];

// Yleisapu funktiot
const findGenre = (name) => genres.find(g => g.name.toLowerCase() === name.toLowerCase());

// Keskitetty virheenkäsittelijä
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Pääsivu
app.get('/', (req, res) => {
    res.send('<h1>Welcome to the Movie Service!</h1>');
});

// Lisää genre
app.post('/genres', (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Genre name is required' });
    }

    if (findGenre(name)) {
        return res.status(400).json({ error: `Genre '${name}' already exists` });
    }

    const newGenre = { id: genres.length + 1, name };
    genres.push(newGenre);

    res.status(201).json({ message: 'Genre added successfully', genre: newGenre });
});

// Hae kaikki genret
app.get('/genres', (req, res) => res.json(genres));

// Lisää elokuva
app.post('/movies', (req, res) => {
    const { name, year, genre } = req.body;

    if (!name || !year || !genre) {
        return res.status(400).json({ error: 'Name, year, and genre are required' });
    }

    const genreExists = findGenre(genre);
    if (!genreExists) {
        return res.status(400).json({ error: `Genre '${genre}' does not exist` });
    }

    const newMovie = {
        id: movies.length + 1,
        name,
        year,
        genre: genreExists.name
    };
    movies.push(newMovie);

    res.status(201).json({ message: 'Movie added successfully', movie: newMovie });
});

// Hae kaikki elokuvat
app.get('/movies', (req, res) => res.json(movies));

// Hae elokuva ID:n perusteella
app.get('/movies/:id', (req, res) => {
    const movieId = parseInt(req.params.id);
    const movie = movies.find(m => m.id === movieId);

    if (!movie) {
        return res.status(404).json({ error: 'Movie not found' });
    }

    res.json(movie);
});

// Serverin käynnistys
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
