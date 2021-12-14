const Hyperbee = require('hyperbee')
// This module handles networking and storage of hypercores for you
const SDK = require('hyper-sdk')
const {DB} = require('hyperbeedeebee')

const dbName = 'akashic'


async function init(name) {
    const {Hypercore} = await SDK()

  // Initialize a hypercore for loading data
  const core = new Hypercore(name)
  // Initialize the Hyperbee you want to use for storing data and indexes
  const bee = new Hyperbee(core)

  // Create a new DB
  const db = new DB(bee)

  return db;
}

async function runner() {
  const db1Name = 'example'
  const db2Name = 'akashic'
  const db1 = await init(db1Name)
  const db2 = await init(db2Name)

  // Open up a collection of documents and insert a new document
  const doc = await db1.collection(db1Name).insert({
    hello: 'World!'
  })

  // Works
  const oneFound = await db1.collection(db1Name).findOne({
    hello: 'World!'
  })

  console.log(oneFound)

  //const collection = db.collection(dbName)

  try {
    // Does not work
    const manyNotFound = await db1.collection('example').find({
      hello: {
        $eq: 'World!'
      }
    })
    console.log(manyNotFound)
  }catch(e){
    console.log('FAILED')
  }

  try {

    // Open up a collection of documents and insert a new document
    const doc1 = await db2.collection(db2Name).insert({
      hello: 'World!'
    })

    // Does not work
    const manyFound = await db2.collection(db2Name).find({
      hello: {
        $eq: 'World!'
      }
    })
    console.log(manyFound)
    console.log('SUCCESS')
  }catch(e){
    console.log('FAILED')
  }
}

runner()