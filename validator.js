require('dotenv').config()

const Hyperbee = require('hyperbee')
const SDK = require('hyper-sdk')

async function validator(batch){
	const {Hypercore} = await SDK()
	const key = process.env.HYPER

	// Initialize a hypercore for loading data
	const feed = new Hypercore(key)

	console.log(feed)

	// doesn't download live, not sure why
	feed
		.createReadStream({live: true, batch: 1})
		.on('data', (cid) => {
			console.log(cid)
		})
		.on('end', () => {
			console.log("if you're seeing this, something is wrong")
		})
}

validator(1)