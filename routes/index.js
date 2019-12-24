var express = require('express');
var router = express.Router();
var path = require('path');
var config = require('../db-config.js');

//express sessions
var cookieParser = require('cookie-parser');
var session = require('express-session');
router.use(cookieParser());
router.use(session({secret: 'max'}));


/* ----- Connects to your mySQL database ----- */
var mysql = require('mysql');

config.connectionLimit = 10;
var connection = mysql.createPool(config);


/* ----- Routers to handle file requests ----- */

router.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'dashboard.html'));
});

router.get('/tinder', function(req, res) {
  //increase page views
  if(req.session.page_views){
      req.session.page_views++;
   } else {
      req.session.page_views = 1;
  }
  res.sendFile(path.join(__dirname, '../', 'views', 'tinder.html'));
});

router.get('/final', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'final.html'));
});

router.get('/guesser', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'guesser.html'));
});

/* ----- Routers to handle data requests ----- */
// Home page
router.get('/dogs', function(req, res) {
  var query = `SELECT s.photo
    FROM stanford s
    ORDER BY RAND()
    LIMIT 12;`;
  
  //reset dog lists for a new swiping session
  req.session.goodDogs = null;
  req.session.badDogs = null;

  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});


// Swiping page
router.get('/tinder/:tinder', function(req, res) {
  var query = '';

  ran = Math.random() * 10;
  if(req.session.goodDogs){
    len = req.session.goodDogs.length;
  } else {
    len = 0
  }

  // incorporate previous swipes into generated image
  if(req.session.goodDogs && ran <= len) {
    query = `SELECT * FROM
    (SELECT DISTINCT akc.id, (akc.weight_low + akc.weight_high)/2 AS weight_average
      FROM akc JOIN stanford_breeds sb
      ON akc.id = sb.id
      JOIN stanford s
      ON sb.breed = s.breed
      WHERE sb.id IN (${req.session.goodDogs.join()})
    ) t1
    JOIN (
    SELECT s.photo, sb.id, sb.breed, (akc.weight_low + akc.weight_high)/2 AS weight_average
      FROM stanford s
      JOIN stanford_breeds sb ON s.breed = sb.breed
      JOIN akc ON akc.id = sb.id
    ) t2
    WHERE t1.weight_average BETWEEN t2.weight_average-5 AND t2.weight_average+5
    ORDER BY RAND()
    LIMIT 1;`;
  }
  
  //completely randomly generated image
  else {
    query =
      `SELECT s.photo, sb.id, ab.breed_name AS breed
    FROM stanford s
    JOIN stanford_breeds sb ON s.breed = sb.breed
    JOIN akc ON akc.id = sb.id
    JOIN aspca_breeds ab ON ab.id = akc.id
    ORDER BY RAND()
    LIMIT 1;`;
  }

  //execute the query
  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});

//Storing good dog
router.get('/tinder/good/:dog', function (req, res) {
  var inputBreed = req.params.dog;

  //store in good list
  if(req.session.goodDogs){
      req.session.goodDogs.push(inputBreed);
   } else {
      req.session.goodDogs = [];
      req.session.goodDogs.push(inputBreed);
  }

  //check if we are done swiping
  if(req.session.goodDogs.length > 9 || req.session.goodDogs.length + req.session.badDogs.length > 9){
    //edge case for if there are zero bad swipes
    if(req.session.goodDogs.length > 9){
      req.session.badDogs = [0];
    }

    res.json(true);
  }

  req.session.goodDogs.add(inputBreed);
});

//Storing bad dog
router.get('/tinder/bad/:dog', function (req, res) {
  var inputBreed = req.params.dog;

  //store in bad list
  if(req.session.badDogs){
      req.session.badDogs.push(inputBreed);
   } else {
      req.session.badDogs = [];
      req.session.badDogs.push(inputBreed);
  }

  //check if we are done swiping
  if(req.session.badDogs.length > 9 || req.session.goodDogs.length + req.session.badDogs.length > 9) {
    if(req.session.goodDogs){
      res.json(true);
    }
  }

  req.session.badDogs.add(inputBreed);
});

//list of colors for the dropdown
router.get('/guesser/:guesser', function (req, res) {
  var query = `SELECT DISTINCT color_1 as color FROM shelter_dogs ORDER BY color`

  //execute the query
  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});


//guess your breed based on input
router.get('/guesser/:color/:weight/:height', function (req, res) {
  var query = `SELECT DISTINCT ab.breed_name AS breed
    FROM stanford s
    JOIN stanford_breeds sb ON s.breed = sb.breed
    JOIN akc ON akc.id = sb.id
    JOIN aspca_breeds ab ON ab.id = akc.id
    JOIN breed_freq bf ON bf.breed_id = akc.id
 WHERE akc.height_low < ${req.params.height} + 10 AND akc.height_high > ${req.params.height} - 10
 AND akc.weight_low < ${req.params.weight} + 10 AND akc.weight_high > ${req.params.weight} - 10
 AND bf.color = '${req.params.color}';`
 console.log(query);
  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});

//to get the final dog 
router.get('/final/:final', function(req, res) {
  var query = `SELECT pet_id, name, sd.breed, breed_id, color, sd.sex, sd.age FROM 
(SELECT * 
FROM (SELECT * 
FROM (SELECT breed_id 
FROM breed_freq
WHERE(weight_avg - (SELECT AVG(weight_avg) FROM (SELECT weight_avg 
FROM breed_freq WHERE breed_id IN (${req.session.goodDogs.join()}))avg_of_weights_liked) <= 10 
AND weight_avg - (SELECT AVG(weight_avg) FROM (SELECT weight_avg FROM breed_freq
WHERE breed_id IN (${req.session.goodDogs.join()}))avg_of_weights_liked) >= -10))weighted_breeds_good
WHERE breed_id NOT IN (SELECT breed_id FROM breed_freq
WHERE(weight_avg - (SELECT AVG(weight_avg) 
FROM (SELECT weight_avg FROM breed_freq
WHERE breed_id IN (${req.session.badDogs.join()}))avg_of_weights_disliked) <= 5 
AND weight_avg - (SELECT AVG(weight_avg) FROM 
(SELECT weight_avg FROM breed_freq
WHERE breed_id IN (${req.session.badDogs.join()}))avg_of_weights_disliked) >= -5)))weighted_dogs
NATURAL JOIN sd_final
WHERE color_1 NOT IN (SELECT color FROM(
SELECT bad_colors.color, (bad_colors.count  - IFNULL(good_colors.count,0)) AS final_count FROM
(SELECT COUNT(*) AS count, color FROM breed_freq
WHERE breed_id IN (${req.session.badDogs.join()}) GROUP BY color)bad_colors LEFT JOIN
(SELECT COUNT(*) AS count, color FROM breed_freq
WHERE breed_id IN (${req.session.goodDogs.join()}) GROUP BY color)good_colors
ON bad_colors.color = good_colors.color)color_1_check
WHERE final_count > 0)
AND color_2 NOT IN (SELECT color FROM(
SELECT bad_colors.color, (bad_colors.count  - IFNULL(good_colors.count,0)) AS final_count FROM
(SELECT COUNT(*) AS count, color FROM breed_freq
WHERE breed_id IN (${req.session.badDogs.join()}) GROUP BY color)bad_colors LEFT JOIN
(SELECT COUNT(*) AS count, color FROM breed_freq
WHERE breed_id IN (${req.session.goodDogs.join()}) GROUP BY color)good_colors
ON bad_colors.color = good_colors.color)color_2_check
WHERE final_count > 0)
ORDER BY RAND()
LIMIT 1)final 
JOIN shelter_dogs sd ON final.pet_id = sd.id;`
  
  //execute the query
  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});

//get the photos based on the final dog
router.get('/final/final/:breed_id', function(req, res) {
  var query = `SELECT s.photo
  FROM stanford s
  JOIN stanford_breeds sb ON s.breed = sb.breed
  WHERE sb.id = ${req.params.breed_id}
  ORDER BY RAND()
  LIMIT 24;`;
  
  //execute the query
  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});

module.exports = router;
