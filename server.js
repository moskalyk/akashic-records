const app = require('express')()

const Hyperbee = require('hyperbee')
// This module handles networking and storage of hypercores for you
const SDK = require('hyper-sdk')
const {DB} = require('hyperbeedeebee')
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')

const DB_NAME = 'AKASHIC-1'
let init = require('./init.js')


const mockData = [{
  set: [
    {
      token: 'WETH:DAI',
      card: 'https://www.trustedtarot.com/img/cards/the-magician.png',
      isDecision: false
    },
    {
      token: 'WETH:UNI',
      card: 'https://www.trustedtarot.com/img/cards/the-high-priestess.png',
      isDecision: true
    },
    {
      token: 'WETH:FTX',
      card: 'https://www.trustedtarot.com/img/cards/the-empress.png',
      isDecision: false
    }
  ],
  decision: { 
  	parent: 'root', 
  	trade: '0x',
  	value: .8
  }
},{
  set: [
    {
      token: 'WETH:DAI',
      card: 'https://www.trustedtarot.com/img/cards/the-magician.png',
      isDecision: true
    },
    {
      token: 'WETH:UNI',
      card: 'https://www.trustedtarot.com/img/cards/the-high-priestess.png',
      isDecision: false
    },
    {
      token: 'WETH:FTX',
      card: 'https://www.trustedtarot.com/img/cards/the-empress.png',
      isDecision: false
    }
  ],
  decision: { 
  	parent: 'root', 
  	trade: '0x',
  	value: .3
  }
},{
  set: [
    {
      token: 'WETH:DAI',
      card: 'https://www.trustedtarot.com/img/cards/the-magician.png',
      isDecision: false
    },
    {
      token: 'WETH:UNI',
      card: 'https://www.trustedtarot.com/img/cards/the-high-priestess.png',
      isDecision: false
    },
    {
      token: 'WETH:FTX',
      card: 'https://www.trustedtarot.com/img/cards/the-empress.png',
      isDecision: true
    }
  ],
  decision: { 
  	parent: 'root', 
  	trade: '0x',
  	value: .1
  }
},{
  set: [
    {
      token: 'WETH:DAI',
      card: 'https://www.trustedtarot.com/img/cards/the-magician.png',
      isDecision: false
    },
    {
      token: 'WETH:UNI',
      card: 'https://www.trustedtarot.com/img/cards/the-high-priestess.png',
      isDecision: false
    },
    {
      token: 'WETH:FTX',
      card: 'https://www.trustedtarot.com/img/cards/the-empress.png',
      isDecision: true
    }
  ],
  decision: { 
  	parent: 'root', 
  	trade: '0x',
  	value: .1
  }
}]

const aggregate = (data) => {
	// 40: mem store
	const akashic = {}

	mockData.map((gateway) => {
		gateway.set.map((gate) => {
			if(gate.isDecision){
				if(!(gate.card in akashic)){
					akashic[gate.card] = gateway.decision.value
				}else {
					akashic[gate.card] += gateway.decision.value
				}
			}
		})
	})

	return akashic
}

const bootstrap = async () => {

	let records = await init(DB_NAME)

	app.use(cors())
	app.use(bodyParser.json())
	app.use(bodyParser.urlencoded({extended:false}))

	console.log(records)

	app.post('/pull', async (req,res) => {
		console.log(req.body)
		const cid = req.body.cid
		const eth = req.body.eth

		const doc = await records.db.collection(DB_NAME).insert({
		  cid: cid,
		  eth: eth
		})

		res.send(doc)
	})

	app.get('/akashic/:id', async (req,res) => {
		const query = req.params.id
		console.log(query)
		const docs = await records.db.collection(DB_NAME).find({eth: query})
		res.send(docs)
	})

	app.get('/oracles', async (req,res) => {


		const oracles = await records.db.collection(DB_NAME).listIndexes()
		const docs = await records.db.collection(DB_NAME).find({
		  cid: {
		    $exists: true
		  }
		})
		const dir = {}

		docs.map((doc) => {
			dir[doc.eth] = true
		})

		res.send({count: Object.keys(dir).length})
	})


	app.get('/akashic', async (req,res) => {

		const gateways = []

		const docs = await records.db.collection(DB_NAME).find({
		  cid: {
		    $exists: true
		  }
		})

		// unpack and repack into chart format
		Promise.all(docs.map(async (doc) => {
			console.log(doc.cid)
			setTimeout(async () => {
				const response = await axios(`https://gateway.pinata.cloud/ipfs/${doc.cid}`)
				console.log(response.data)
				gateways.push(response.data)
			}, 100)
		})).then(() => {
			console.log('DONE')
			// iterate through and count the value
			const akashic = aggregate(gateways)

			res.send(akashic)
		}).catch(() => {
			console.log('ERRORED') // local test revert
			const akashic = aggregate(gateways)

			res.send(akashic)
		})

	})

	app.listen(1440, () => {
		console.log('listening')
		const url = `hyper://${records.core.key.toString('hex')}`
  		console.log(url)
	})
}

bootstrap()