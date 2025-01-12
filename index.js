const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

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
app.use(cors({ origin: 'http://localhost:5173' })) // !You may need to change this

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
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(p => p.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
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
      .json({ message: 'malformed header' })
  }

  if (!name) {
    response
      .status(400)
      .json({ message: 'name missing' })

  } else if (persons.some(p => p.name === name)) {
    response
      .status(400)
      .json({ message: 'name must be unique' })

  } else if (!number) {
    response
      .status(400)
      .json({ message: 'number missing' })

  } else {
    const id = String(Math.ceil(Math.random() * (2**53 - 1)))
    const person = { id, name, number }
    persons = persons.concat(person)
    response.json(person)
  }  
})

const PORT = process.env.PORT || 3001

const server = app.listen(PORT, () => {
    console.log('Server running on port:', server.address().port);
    
})
