require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }

]

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

app.get('/info', (request, response) => {
  const html = `
  <p>Phonebook has info for ${persons.length} people</p>
  <p>${Date()}</p>`

  response.send(html)
})

app.get('/api/persons', (request, response) => {
    Person
      .find({})
      .then(persons => {
        response.json(persons)
      })
      .catch(error => 
        response.status(404).end())
})

app.get('/api/persons/:id', (request, response) => {
  Person
    .findById(request.params.id)
    .then(person => {
      console.log(person)
      response.json(person)
    })
    .catch(error => 
      response.status(404).end())
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(p => p.id !== id)
  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const { body: { name, number } } = request

  if (!request.headers['content-type']) {
    return response
      .status(400)
      .json({ error: 'malformed request' })
  }

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
    // const id = String(Math.ceil(Math.random() * (2**53 - 1)))
    new Person({ name, number })
      .save()
      .then(person => {
        console.log(person)
        response.status(201).json(person)
      })
      .catch(error =>
        response.status(500).json({ error: error.message }))
  }  
})

const PORT = process.env.PORT || 3001

const server = app.listen(PORT, () => {
    console.log('Server running on port:', PORT);
    
})