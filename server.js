const app = require('express')()

const Hyperbee = require('hyperbee')
// This module handles networking and storage of hypercores for you
const SDK = require('hyper-sdk')
const {DB} = require('hyperbeedeebee')
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')

const DB_NAME = 'AKASHIC-2'
let init = require('./init.js')

const deck = {
  'The Magician':'https://www.trustedtarot.com/img/cards/the-magician.png',
  'The High Priestess':'https://www.trustedtarot.com/img/cards/the-high-priestess.png',
  'The Empress':'https://www.trustedtarot.com/img/cards/the-empress.png',
  'The Emperor':'https://www.trustedtarot.com/img/cards/the-emperor.png',
  'The Hierophant':'https://www.trustedtarot.com/img/cards/the-heirophant.png',
  'The Lovers':'https://www.trustedtarot.com/img/cards/the-lovers.png',
  'The Chariot':'https://www.trustedtarot.com/img/cards/the-chariot.png',
  'Fortitude':'https://www.trustedtarot.com/img/cards/strength.png',
  'The Hermit':'https://www.trustedtarot.com/img/cards/the-hermit.png',
  'Wheel Of Fortune':'https://www.trustedtarot.com/img/cards/wheel-of-fortune.png',
  'Justice':'https://www.trustedtarot.com/img/cards/justice.png',
  'The Hanged Man':'https://www.trustedtarot.com/img/cards/the-hanged-man.png',
  'The Fool':'https://www.trustedtarot.com/img/cards/the-fool.png',
}

const mockData = [{
  set: [
    {
      token: 'WETH:DAI',
      card: 'The Magician',
      isDecision: false,
  	  value: .8
    },
    {
      token: 'WETH:UNI',
      card: 'The High Priestess',
      isDecision: true,
  	  value: .8
    },
    {
      token: 'WETH:FTX',
      card: 'The Empress',
      isDecision: false,
  	  value: .3
    }
  ],
  decision: { 
  	parent: 'Qme6XZ5tHCTzFfTg53w1HkLmCWDEg9P2KZXhzTinHaFNro', 
  	trade: '0x'
  }
},{
  set: [
    {
      token: 'WETH:DAI',
      card: 'The Chariot',
      isDecision: true,
  	  value: .5
    },
    {
      token: 'WETH:UNI',
      card: 'Wheel Of Fortune',
      isDecision: false,
  	  value: .5
    },
    {
      token: 'WETH:FTX',
      card: 'The Empress',
      isDecision: false,
  	  value: .5
    }
  ],
  decision: { 
  	parent: 'Qme6XZ5tHCTzFfTg53w1HkLmCWDEg9P2KZXhzTinHaFNro', 
  	trade: '0x'
  }
},{
  set: [
    {
      token: 'WETH:DAI',
      card: 'The Emperor',
      isDecision: false,
      value: 0.1
    },
    {
      token: 'WETH:UNI',
      card: 'Justice',
      isDecision: false,
      value: 0.8
    },
    {
      token: 'WETH:FTX',
      card: 'The High Priestess',
      isDecision: true,
      value: 0.1
    }
  ],
  decision: { 
  	parent: 'Qme6XZ5tHCTzFfTg53w1HkLmCWDEg9P2KZXhzTinHaFNro', 
  	trade: '0x'
  }
},{
  set: [
    {
      token: 'WETH:DAI',
      card: 'Justice',
      isDecision: false,
      value: 0.1
    },
    {
      token: 'WETH:UNI',
      card: 'The Magician',
      isDecision: false,
      value: 0.3
    },
    {
      token: 'WETH:FTX',
      card: 'The Hanged Man',
      isDecision: true,
      value: 1.3
    }
  ],
  decision: { 
  	parent: 'Qme6XZ5tHCTzFfTg53w1HkLmCWDEg9P2KZXhzTinHaFNro', 
  	trade: '0x'
  }
}]

const aggregate = (data) => {
	const formattedData = []
	// 40: mem store
	const akashic = {
		staked: {},
		naStaked: {}
	}

	data.map((gateway) => {
		console.log(gateway)
		gateway.set.map((gate) => {
			if(gate.isDecision){
				if(!(gate.card in akashic.staked)){
					console.log(gate)
					akashic.staked[gate.card] = gate.value
				}else {
					akashic.staked[gate.card] += gate.value
				}
			}else{
				if(!(gate.card in akashic.naStaked)){
					akashic.naStaked[gate.card] = gate.value
				}else {
					akashic.naStaked[gate.card] += gate.value
				}
			}
		})
	})

	console.log(akashic)

	let deck = Object.keys(akashic.staked).length + Object.keys(akashic.naStaked).length

	Object.keys(akashic.staked).map((key) => {
		if(akashic.naStaked[key] == null)
			formattedData.push([key, akashic.staked[key], 0])
		else
			formattedData.push([key, akashic.staked[key], akashic.naStaked[key]])
	})

	Object.keys(akashic.naStaked).map((key) => {
		formattedData.push([key, 0, akashic.naStaked[key]])
	})

	return formattedData
}

const bootstrap = async () => {

	let records = await init(DB_NAME)

	app.use(cors())
	app.use(bodyParser.json())
	app.use(bodyParser.urlencoded({extended:false}))

	app.use(function (req, res, next) {
	  /*var err = new Error('Not Found');
	   err.status = 404;
	   next(err);*/

	  // Website you wish to allow to connect
	  res.setHeader('Access-Control-Allow-Origin', '*');

	  // Request methods you wish to allow
	  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

	  // Request headers you wish to allow
	  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization');

	//  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

	  // Pass to next layer of middleware
	  next();
	});

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

		const gateways = []
		const query = req.params.id
		console.log(query)
		const docs = await records.db.collection(DB_NAME).find({eth: query})

		// unpack and repack into chart format
		Promise.all(docs.map(async (doc) => {
			console.log(doc.cid)
			// setTimeout(async () => {
				const response = await axios(`https://gateway.pinata.cloud/ipfs/${doc.cid}`)
				console.log(response.data)
				gateways.push(response.data)
			// }, 10)
		})).then(() => {
			console.log('DONE')
			// iterate through and count the value
			res.send({records: gateways})
		})
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

		const akashic = [['Card', 'Value Staked', 'Value Left']]
		const gateways = []

		const docs = await records.db.collection(DB_NAME).find({
		  cid: {
		    $exists: true
		  }
		})

		// unpack and repack into chart format
		Promise.all(docs.map(async (doc) => {
			console.log(doc.cid)
			// setTimeout(async () => {
				const response = await axios(`https://gateway.pinata.cloud/ipfs/${doc.cid}`)
				console.log(response.data)
				gateways.push(response.data)
			// }, 10)
		})).then(() => {
			console.log('DONE')
			// iterate through and count the value
			const akashicCards = aggregate(gateways)
			console.log('akashicCards')
			console.log(akashicCards)
			res.send({records: akashic.concat(akashicCards)})
		}).catch(() => {
			console.log('ERRORED') // local test revert
			const akashicCards = aggregate(mockData)

			res.send({records: gateways.concat(akashicCards)})
		})

	})

	app.listen(1440, () => {
		console.log('listening')
		const url = `hyper://${records.core.key.toString('hex')}`
  		console.log(url)
	})
}

bootstrap()