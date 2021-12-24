const { tarots, classes } = require('./tarots.js')
const Reed = require('./index.js')

const runner = () => {
	// 
	const reed = new Reed()
	console.log(reed.simulate(10))
}

(() => {
	runner()
})()