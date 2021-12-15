const Hyperbee = require('hyperbee')

// This module handles networking and storage of hypercores for you
const SDK = require('hyper-sdk')
const {DB} = require('hyperbeedeebee')

async function init(name) {
  const {Hypercore} = await SDK()

  // Initialize a hypercore for loading data
  const core = new Hypercore(name)
  // Initialize the Hyperbee you want to use for storing data and indexes
  const bee = new Hyperbee(core)

  // Create a new DB
  const db = new DB(bee)

  return {db: db, core: core };
}

module.exports = init;