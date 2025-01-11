const express = require('express')
const morgan = require('morgan')

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

app.use(morgan('tiny'))

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
  const html = `
  <p>Phonebook has info for ${persons.length} people</p>
  <p>${Date()}</p>`

  response.send(html)
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
    const id = Math.ceil(Math.random() * (2**53 - 1))
    const person = { id, name, number }
    persons = persons.concat(person)
    response.json(person)
  }  
})

const PORT = 3001

const server = app.listen(PORT, () => {
    console.log('Server running on port:', server.address().port);
    
})
