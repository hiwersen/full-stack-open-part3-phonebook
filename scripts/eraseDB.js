const mongoose = require('mongoose')
const Person = require('../models/person.js')

if (process.argv.length < 3) {
  console.log('Provide MongoDB connection string as argument')
  process.exit(1)
}

const URI = process.argv[2]

mongoose
  .connect(URI)
  .then(() => {
    console.log('Connected to MongoDB')
    return Person.deleteMany({})
  })
  .then(result => {
    console.log('Documents deleted:', result.deletedCount)
    return Person.countDocuments({})
  })
  .then(result => {
    console.log('Documents left:', result)
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

