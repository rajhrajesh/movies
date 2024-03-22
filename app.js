const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')

const dbpath = path.join(__dirname, 'moviesData.db')

const app = express()

app.use(express.json())
let db = null
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

const convertMovieDbObjectTOResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leaderActor: dbObject.lead_actor,
  }
}

const convertDirectorDbObjectTOResponseObject = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
''SELECT 
'''movie_name
'''FROM
'''movie;`
  const moviesArray = await db.all(getMoviesQuery)
  response.send(
    moviesArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
  '''SELECT *
  '''FROM 
  '''movie 
  '''WHERE 
  '''movie_id = ${movieId};`
  const movie = await db.get(getMovieQuery)
  response.send(convertMovieDbObjectTOResponseObject(movie))
})

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leaderActor} = request.body

  const postMovieQuery = `
  INSERT INTO
  movie ( director_id, director_name, lead_actor)
  VALUES
  (${directorId}, ${movieName}, ${leaderActor});`
  await db.run(postMovieQuery)
  response.send('Movie Successfully Added')
})

app.put('/movies/:movieId/', async (request, response) => {
  const {directorId, movieName, leaderActor} = request.body
  const {movieId} = request.params

  const updateMovieQuery = `
  UPDATE 
  movie SET 
  director_id = ${directorId},
  movie_name = ${movieName},
  lead_actor = ${leaderActor}
  WHERE 
  movie_id = ${movieId};`

  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params

  const deleteMovieQuery = `
  DELETE FROM 
  movie WHERE 
  movie_id = ${movieId};`
  await db.tun(deleteMovieQuery)
  response.send('Movie Removes')
})

app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `
  SELECT *
  FROM director;
  `

  const directorArray = await db.all(getDirectorsQuery)
  response.send(
    directorArray.map(eachDirector => {
      convertDirectorDbObjectTOResponseObject(eachDirector)
    }),
  )
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params

  const getDirectorMoviesQuery = `SELECT movie_name 
FROM movie 
WHERE director_id=${directorId};
`

  const moviesArray = await db.all(getDirectorMoviesQuery)
  response.send(
    moviesArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

module.exports = app
