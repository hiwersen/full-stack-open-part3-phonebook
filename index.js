require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

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

  console.log(request.body)

  if (!request.headers['content-type']) {
    return response
      .status(400)
      .json({ error: 'malformed header' })
  }

  Person
    .find({})
    .then(persons => {
      if (persons) {

        if (!name) {
          response
            .status(400)
            .json({ error: 'name missing' })
      
        } else if (persons.some(p => p.name === name)) {
          response
            .status(400)
            .json({ error: 'name must be unique' })
      
        } else if (!number) {
          response
            .status(400)
            .json({ error: 'number missing' })
      
        } else {
          new Person({ name, number })
            .save()
            .then(person => {
              console.log(person)
              response.status(201).json(person)
            })
            .catch(error =>
              response.status(500).json({ error: error.message }))
        }

      } else {
        response.status(404).end()
      }
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
  const person = { name, number }
  
  Person
    .findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson)
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
  console.log(error.name, error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
})

const PORT = process.env.PORT || 3001

const server = app.listen(PORT, () => {
    console.log('Server running on port:', PORT)
})