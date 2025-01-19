require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')
const Person = require('./models/person')

const app = express()
const PORT = process.env.PORT || 3001
const URI = process.env.MONGODB_URI

app.use(express.json())
app.use(cors({ origin: 'http://localhost:5173' })) // !Not required when you have a proxy set in the frontend vite.config.js
app.use(express.static('dist'))


// :method :url :status :res[content-length] - :response-time ms
app.use(morgan('tiny', {
  skip: function (req, res) { return req.method === 'POST' }
}))

morgan.token('data', function (req, res) { return JSON.stringify(req.body) })

// :method :url :status :res[content-length] - :response-time ms :data
const customLogger = morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens['data'](req, res)
  ].join(' ')
}, {
  skip: function (req, res) { return req.method !== 'POST' }
})

app.use(customLogger)

app.get('/info', (request, response, next) => {
  Person
    .find({})
    .then(persons => {
      if (persons) {
        const html = `
          <p>Phonebook has info for ${persons.length} people</p>
          <p>${Date()}</p>`
        response.send(html)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.get('/api/persons', (request, response, next) => {
    Person
      .find({})
      .then(persons => {
        if (persons) {
          response.json(persons)
        } else {
          response.status(404).end()
        }
      })
      .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person
    .findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const { body: { name, number } } = request
  new Person({ name, number })
    .save()
    .then(result => {
      response.status(201).json(result)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person
    .findByIdAndDelete(request.params.id)
    .then(() => response.status(204).end())
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { body: { name, number } } = request
  
  Person
    .findByIdAndUpdate(
      request.params.id, 
      { name, number }, 
      { 
        new: true,
        runValidators: true,
        context: 'query'
      })
    .then(result => {
      if (result) {
        response.json(result)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.use((request, response, next) => {
  response.status(404).send({ error: 'unknown endpoint' })
  next()
})

app.use((error, request, response, next) => {
  console.log('Error code:', error.code)
  console.log('Error name:', error.name)
  console.log('Error message', error.message)
  console.log(error)

  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'malformatted id' })
  }

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  if (error.code === 11000) {
    return response.status(400).json({ error: error.message })
  }

  next(error)
})

mongoose
  .connect(URI)
  .then(() => {
    console.log('Connected to MongoDB:', mongoose.connection.name)

    const server = app.listen(PORT, () => {
      console.log('Server running on port:', PORT)
  })

  })
  .catch(error => {
    console.log('Error connecting to MongoDB:', error.message)
  })