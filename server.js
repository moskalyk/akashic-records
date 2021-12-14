const app = require('express')()

const Hyperbee = require('hyperbee')
// This module handles networking and storage of hypercores for you
const SDK = require('hyper-sdk')
const {DB} = require('hyperbeedeebee')
const bodyParser = require('body-parser')
let db;

async function bootstrap(){
	const {Hypercore} = await SDK()

	// Initialize a hypercore for loading data
	const core = new Hypercore('example')
	// Initialize the Hyperbee you want to use for storing data and indexes
	const bee = new Hyperbee(core)

	// Create a new DB
	db = new DB(bee)
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
bootstrap()

app.post('/pull', async (req,res) => {
	console.log(req.body)
	const cid = req.body.cid

	const doc = await db.collection('example').insert({
	  cid: cid
	})

	const docs = await db.collection('example').find({cid: cid})
	res.send(docs)
})

app.get('/akashic/:id', async (req,res) => {
	const query = req.params.id
	console.log(query)
	const docs = await db.collection('example').find({cid: query})
	res.send(docs)
})

app.get('/akashic/full', (req,res) => {
	res.send([])
})

app.listen(1440, () => {
	console.log('listening')
})