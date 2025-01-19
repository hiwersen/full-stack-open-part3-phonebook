const mongoose = require('mongoose')
const Person = require('../models/person.js')

if (process.argv.length < 3) {
  console.log('Provide MongoDB connection string as argument')
  process.exit(1)
}

const URI = process.argv[2]

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

mongoose
  .connect(URI)
  .then(() => {
    console.log('Connected to database')
    return Person
      .insertMany(persons.map(({ name, number }) => 
          ({ name, number })))
  })
  .then(result => {
    console.log('Database populated')
    if (result) {
      result.forEach(document => console.log(document))
    }
    return mongoose.connection.close()
  })
  .then(() => {
    console.log('Connection closed')
  })
  .catch(error => {
    console.log('Error:', error.message)

    mongoose.connection.close()
      .then(() => console.log('Connection closed'))
      .catch(error => console.log('Error closing connection:', error.message))
  })