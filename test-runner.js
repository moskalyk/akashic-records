const init = require('./init.js')

async function runner() {
  const db1Name = 'example1'
  const db2Name = 'akashic2'

  const records1 = await init(db1Name)
  const records2 = await init(db2Name)

  const db1 = records1.db
  const db2 = records2.db

  // Open up a collection of documents and insert a new document
  const doc = await db1.collection(db1Name).insert({
    hello: 'World!'
  })

  // Works
  const oneFound = await db1.collection(db1Name).findOne({
    hello: 'World!'
  })

  console.log(oneFound)

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

    setInterval(async () => {
      const doc1 = await db2.collection(db2Name).insert({
        hello: 'World!'
      })
      console.log(doc1)

    },2000)


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

  const url = `hyper://${records2.core.key.toString('hex')}`
  console.log(url)
}

runner()