var express = require('express');
var router = express.Router();
var path = require('path');
//var config = require('../db-config.js');

/* ----- Connects to your mySQL database ----- */

// var mysql = require('mysql');
// config.connectionLimit = 10;
// var connection = mysql.createPool(config);
// console.log('Connected to the MySQL server.');

/* ----- Connect to SQLPLUS ----- */
const oracledb = require('oracledb');

oracledb.getConnection(
    {
      user: "admin",
      password: "Penny415",
      connectString: "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=cis550.cxib87hgdpcg.us-east-1.rds.amazonaws.com)(PORT=1521))(CONNECT_DATA=(SID=penny)))"
    },
  );

/* ------------------------------------------- */
/* ----- Routers to handle FILE requests ----- */
/* ------------------------------------------- */

router.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'dashboard.html'));
});

/* ----- Q2 (Recommendations) ----- */
router.get('/recommendations', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'recommendations.html'));
});

/* ----- Q3 (Best Of Decades) ----- */
router.get('/bestof', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'bestof.html'));
});

/* ----- Bonus (Posters) ----- */
router.get('/posters', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'posters.html'));
});

router.get('/reference', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'reference.html'));
});

/* Template for a FILE request router:

Specifies that when the app recieves a GET request at <PATH>,
it should respond by sending file <MY_FILE>

router.get('<PATH>', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', '<MY_FILE>'));
});

*/


/* ------------------------------------------------ */
/* ----- Routers to handle data requests ----- */
/* ------------------------------------------------ */

/* ----- Q1 (Dashboard) ----- */
//Genre bank
router.get('/genres', function (req, res) {
  var query = 'SELECT DISTINCT breed FROM Stanford_Breeds';
  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});

//Top movie list
router.get('/genres/:genre', function (req, res) {
  var clickedGenre = req.params.genre;

  var query = `SELECT breed FROM Stanford_Breeds
  WHERE breed LIKE '${clickedGenre}';`;

  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});


/* ----- Q2 (Recommendations) ----- */
router.get('/recommendations/:movie', function (req, res) {
  var inputMovie = req.params.movie;

  var query = `WITH GenreList AS (
    SELECT g.genre
    FROM Genres g
    WHERE g.movie_id = (SELECT m.id fROM Movies m WHERE m.title = '${inputMovie}')
    )
  SELECT m.title, m.id, m.rating, m.vote_count
  From Movies m
  LEFT OUTER JOIN Genres g ON m.id = g.movie_id
  LEFT OUTER JOIN GenreList gl ON g.genre = gl.genre
  WHERE m.title <> '${inputMovie}'
  GROUP BY m.title, m.id, m.rating, m.vote_count
  HAVING COUNT(gl.genre) >= ALL (SELECT COUNT(*) FROM GenreList)
  ORDER BY m.rating DESC, m.vote_count DESC
  LIMIT 5;`;

  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});


/* ----- Q3 (Best Of Decades) ----- */

router.get('/decades', function(req, res) {
  var query = `
    SELECT DISTINCT (FLOOR(year/10)*10) AS decade
    FROM (
      SELECT DISTINCT release_year as year
      FROM Movies
      ORDER BY release_year
    ) y;
  `;
  connection.query(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});

router.get('/decades/:decade', function (req, res) {
  var inputDecade = req.params.decade;

  var query = `SELECT g.genre, m.title, m.vote_count, m.release_year
    FROM Movies m
    JOIN Genres g ON m.id = g.movie_id
    WHERE release_year BETWEEN ${inputDecade} AND ${inputDecade}+9
    AND m.vote_count >= ALL (
      SELECT MAX(vote_count)
      FROM Movies m2
      JOIN Genres g2 on m2.id = g2.movie_id
      WHERE m2.release_year BETWEEN ${inputDecade} AND ${inputDecade}+9
      AND g2.genre = g.genre
      GROUP BY g2.genre)
    GROUP BY g.genre
    ORDER BY g.genre, m.vote_count DESC;`;

  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});


/* ----- Bonus (Posters) ----- */



/* General Template for GET requests:

router.get('/routeName/:customParameter', function(req, res) {
  // Parses the customParameter from the path, and assigns it to variable myData
  var myData = req.params.customParameter;
  var query = '';
  console.log(query);
  connection.query(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      // Returns the result of the query (rows) in JSON as the response
      res.json(rows);
    }
  });
});
*/


module.exports = router;
