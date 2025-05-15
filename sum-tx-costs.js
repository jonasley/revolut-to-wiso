const fs = require('fs')
const csv = require('csv-parser')

const inputFile = 'crypto-txs.csv'

let txCosts = 0

fs.createReadStream(inputFile)
	.pipe(csv({ separator: ',' }))
	.on('data', (tx) => {
		txCosts += parseFloat(tx.Fees.split('€')[1])
	})
	.on('end', () => {
		console.log(`Total transaction costs are ${txCosts.toFixed(2)}`)
	});