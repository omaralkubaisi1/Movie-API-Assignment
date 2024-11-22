CREATE TABLE Genre (
    GenreID SERIAL PRIMARY KEY,
    Name VARCHAR(50) UNIQUE NOT NULL
);
-- Movie-taulu
CREATE TABLE Movie (
    MovieID SERIAL PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Year INT NOT NULL,
    GenreID INT,
    FOREIGN KEY (GenreID) REFERENCES Genre(GenreID)
);
-- User-taulu
CREATE TABLE MovieUser (
    UserID SERIAL PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Username VARCHAR(50) UNIQUE NOT NULL,
    Password VARCHAR(100) NOT NULL,
    YearOfBirth INT NOT NULL
);
-- Review-taulu
CREATE TABLE Review (
    ReviewID SERIAL PRIMARY KEY,
    Stars INT CHECK (Stars >= 1 AND Stars <= 5),
    ReviewText TEXT,
    ReviewDate DATE DEFAULT CURRENT_DATE,
    UserID INT,
    MovieID INT,
    FOREIGN KEY (UserID) REFERENCES MovieUser(UserID),
    FOREIGN KEY (MovieID) REFERENCES Movie(MovieID)
);
-- Favorite-taulu
CREATE TABLE Favorite (
    FavoriteID SERIAL PRIMARY KEY,
    UserID INT,
    MovieID INT,
    FOREIGN KEY (UserID) REFERENCES MovieUser(UserID),
    FOREIGN KEY (MovieID) REFERENCES Movie(MovieID),
    UNIQUE(UserID, MovieID) 
);

-- Lisää genrejä
INSERT INTO Genre (Name) VALUES 
('Drama'), ('Comedy'), ('Scifi'), ('Fantasy'), ('Action'), ('Thriller');
-- Lisää elokuvia
INSERT INTO Movie (Name, Year, GenreID) VALUES
('Inception', 2010, (SELECT GenreID FROM Genre WHERE Name = 'Action')),
('The Terminator', 1984, (SELECT GenreID FROM Genre WHERE Name = 'Action')),
('Tropic Thunder', 2008, (SELECT GenreID FROM Genre WHERE Name = 'Comedy')),
('Borat', 2006, (SELECT GenreID FROM Genre WHERE Name = 'Comedy')),
('Interstellar', 2014, (SELECT GenreID FROM Genre WHERE Name = 'Drama')),
('Joker', 2019, (SELECT GenreID FROM Genre WHERE Name = 'Drama'));
-- Lisää käyttäjiä
INSERT INTO MovieUser (Username, Name, Password, YearOfBirth) VALUES
('reimarii', 'Reima Riihimäki', 'qwerty123', 1986),
('lizzy', 'Lisa Simpson', 'abcdef', 1991),
('boss', 'Ben Bossy', 'salasana', 1981);
-- Lisää arvosteluita
INSERT INTO Review (Stars, ReviewText, UserID, MovieID) VALUES
(5, 'Amazing movie!', (SELECT UserID FROM MovieUser WHERE Username = 'reimarii'), (SELECT MovieID FROM Movie WHERE Name = 'Inception')),
(4, 'Pretty good.', (SELECT UserID FROM MovieUser WHERE Username = 'lizzy'), (SELECT MovieID FROM Movie WHERE Name = 'The Terminator')),
(3, 'Not bad.', (SELECT UserID FROM MovieUser WHERE Username = 'boss'), (SELECT MovieID FROM Movie WHERE Name = 'Joker'));
-- Lisää suosikkeja
INSERT INTO Favorite (UserID, MovieID) VALUES
((SELECT UserID FROM MovieUser WHERE Username = 'reimarii'), (SELECT MovieID FROM Movie WHERE Name = 'Inception')),
((SELECT UserID FROM MovieUser WHERE Username = 'lizzy'), (SELECT MovieID FROM Movie WHERE Name = 'Interstellar')),
((SELECT UserID FROM MovieUser WHERE Username = 'boss'), (SELECT MovieID FROM Movie WHERE Name = 'The Terminator'));

-- Tarkistetaan, että kaikki taulut näyttävät sisältönsä
SELECT * FROM Genre;
SELECT * FROM Movie;
SELECT * FROM MovieUser;
SELECT * FROM Review;
SELECT * FROM Favorite;

-- Testataan tauluja monimutkaisemmilla kyselyillä
SELECT Movie.Name AS Movie_Name, Movie.Year, Genre.Name AS Genre_Name
FROM Movie
JOIN Genre ON Movie.GenreID = Genre.GenreID;

SELECT MovieUser.Name AS User_Name, Review.Stars, Review.ReviewText
FROM Review
JOIN MovieUser ON Review.UserID = MovieUser.UserID
WHERE Review.MovieID = 2;  -- Esim. elokuva ID 2: "The Terminator"

SELECT Movie.Name AS Favorite_Movie
FROM Favorite
JOIN Movie ON Favorite.MovieID = Movie.MovieID
WHERE Favorite.UserID = 3;  -- Esim. käyttäjä ID 3: "Ben Bossy"