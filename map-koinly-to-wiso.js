const fs = require('fs');
const csv = require('csv-parser');
const dayjs = require('dayjs');
	const customParseFormat = require('dayjs/plugin/customParseFormat');
	dayjs.extend(customParseFormat);

const inputFile = 'koinly-cap-gain-export.csv';
const outputFile = 'wiso-import-file.csv';

const taxYear = '2024';

const outputLines = [];
outputLines.push(`Identifier:Capital_Gains,Method:FIFO,Tax_Year:${taxYear},Base_Currency:EUR`);
outputLines.push('Amount,Currency,Date Sold,Date Acquired,Short/Long,Buy/Input at,Sell/Output at,Proceeds,Cost Basis,Gain/Loss');

const cleanDate = (str) => {
  const raw = str.replace(/[^ -~]+/g, '').trim(); // strip weird whitespace/control chars
  const parsed = dayjs(raw, 'DD/MM/YYYY HH:mm', true); // strict parsing
  return parsed.isValid() ? parsed.format('DD.MM.YYYY') : 'Invalid Date';
};

const mapHoldingPeriod = (text) => {
  if (text.includes('Kurzfristig')) return 'Short';
  if (text.includes('Langfristig')) return 'Long';
  return '';
};

fs.createReadStream(inputFile)
  .pipe(csv({ separator: ',' }))
  .on('data', (row) => {
    const formattedLine = [
			parseFloat(row['Betrag']).toFixed(8),
			row['Vermögenswert'],
			cleanDate(row['Verkaufsdatum']),
			cleanDate(row['Erwerbsdatum']),
			mapHoldingPeriod(row['Haltedauer']),
			row['Name der Brieftasche'],
			row['Name der Brieftasche'],
			parseFloat(row['Erlös (EUR)']).toFixed(2),
			parseFloat(row['Kosten (EUR)']).toFixed(2),
			parseFloat(row['Gewinn / Verlust']).toFixed(2)
		];

    outputLines.push(formattedLine.join(','));
  })
  .on('end', () => {
    fs.writeFileSync(outputFile, outputLines.join('\n'), 'utf8');
    console.log(`File written to ${outputFile}`);
  });