const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('Give password as argument');
    process.exit(1)
}

const password = process.argv[2]
const dbName = 'phonebook'

const url = `mongodb+srv://hiwersen:${password}@cluster0.qpv2m.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose
    .connect(url)
    .catch(error => console.log(error))


const personSchema = mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
    Person
    .find({ })
    .then(people => {
        console.log(`${dbName}:`)
        people.forEach(({ name, number }) => 
            console.log(`${name} ${number}`))
        mongoose.connection.close()
    })
    .catch(error => console.log(error))
}

if (process.argv.length === 5) {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4]
    })

    person
    .save()
    .then(({ name, number }) => {
        console.log(`added ${name} number ${number} to phonebook`)
        mongoose.connection.close()
    })
    .catch(error => console.log(error))
}

if (process.argv.length > 5) {
    mongoose.connection.close()
}


