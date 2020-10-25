const puppeteer = require('puppeteer')
const express = require('express')
const app = express()

const utils = require('./utils')

app.use(function(req, res, next) {
  res.setTimeout(10000, function() {
    res.json({ error: ':fire: Algo salio mal... Intenta de nuevo' })
  })
  next()
})

app.get('/', (req, res) => {
  res.send('Huemul Airlines...')
})

// Despegar
app.get('/city/:city', (req, res) => {
  const cityParam = req.params.city
  if (!cityParam) return res.json(null)
  if (cityParam === 'Santiago' || cityParam === 'santiago') {
    res.json({ error: 'No hay vuelos de Santiago a Santiago :retard:' })
    return
  }
  if (cityParam === 'Rancagua' || cityParam === 'rancagua') {
    res.json({ error: 'Rancagua no existe :retard:' })
    return
  }

  ;(async () => {
    let foundCities = []
    try {
      foundCities = await utils.findCities(cityParam)
      const cityExist = typeof foundCities !== 'undefined' && foundCities.length > 0
      if (!cityExist) {
        res.json({ error: 'Aún no tengo vuelos a esa ciudad' })
      } else {
        // Select the first city found
        const cityCode = foundCities[0].code.toLocaleLowerCase()
        const despegarUrl = `https://www.despegar.cl/vuelos/scl/${cityCode}/`
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
        const page = await browser.newPage()
        page.setViewport({ width: 1280, height: 1000 })
        await page.goto(despegarUrl, { waitUntil: 'domcontentloaded' })
        try {
          const price = await page.evaluate(() => document.querySelector('#alerts .price-amount').textContent)
          if (!price) {
            res.json({ error: 'No encuentro vuelos para esta ciudad' })
          }
          res.json({ price: price.replace('$ ', ''), url: despegarUrl })
          await browser.close()
        } catch (error) {
          res.json({ error: 'No encuentro vuelos para esta ciudad' })
        }
      }
    } catch (error) {
      res.json({ error: 'No encuentro esa ciudad' })
    }
  })()
})

// TurismoCity
app.get('/city-beta/:city', (req, res) => {
  const cityParam = req.params.city
  if (!cityParam) return res.json(null)
  if (cityParam === 'Santiago' || cityParam === 'santiago') {
    res.json({ error: 'No hay vuelos de Santiago a Santiago :retard:' })
    return
  }
  if (cityParam === 'Rancagua' || cityParam === 'rancagua') {
    res.json({ error: 'Rancagua no existe :retard:' })
    return
  }

  ;(async () => {
    let foundCities = []
    try {
      foundCities = await utils.findCities(cityParam)
      const cityExist = typeof foundCities !== 'undefined' && foundCities.length > 0
      if (!cityExist) {
        res.json({ error: 'Aún no tengo vuelos a esa ciudad' })
      } else {
        // Select the first city found
        const cityCode = foundCities[0].code.toLocaleLowerCase()
        const turismoCLUrl = `https://www.turismocity.cl/vuelos-baratos-desde-SCL-a-hacia-${cityCode}-a`
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
        const page = await browser.newPage()
        page.setViewport({ width: 1280, height: 1000 })
        await page.goto(turismoCLUrl, { waitUntil: 'domcontentloaded' })
        try {
          const price = await page.evaluate(() => document.querySelector('.tc-price-table .price-td > span').textContent)
          if (!price) {
            res.json({ error: 'No encuentro vuelos para esta ciudad' })
          }
          res.json({ price: price.replace('$ ', ''), url: turismoCLUrl })
          await browser.close()
        } catch (error) {
          res.json({ error: 'No encuentro vuelos para esta ciudad' })
        }
      }
    } catch (error) {
      res.json({ error: 'No encuentro esa ciudad' })
    }
  })()
})

// TEMPORAL: plebiscito
app.get('/plebiscito', async (req, res) => {
  const URL = 'https://teletrece-plebiscito.web.app/nueva-constitucion/index.html';
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setViewport({ width: 1280, height: 1000 });
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitFor(2000);
  try {
    const aprueboPercentage = await page.evaluate(() => document.querySelector('#teletrece-plebiscito-apruebo-percent').textContent);
    const aprueboVotes = await page.evaluate(() => document.querySelector('#teletrece-plebiscito-apruebo-votes').textContent);
    const rechazoPercentage = await page.evaluate(() => document.querySelector('#teletrece-plebiscito-rechazo-percent').textContent);
    const rechazoVotes = await page.evaluate(() => document.querySelector('#teletrece-plebiscito-rechazo-votes').textContent);

    res.json({ 
      apruebo: { percentage: aprueboPercentage, votes: aprueboVotes}, 
      rechazo: { percentage:rechazoPercentage, votes:rechazoVotes}
    });
    await browser.close()
  } catch (error) {
    console.log(error)
    res.json({ error: 'No encuentro vuelos para esta ciudad' })
  }
})

const port = process.env.PORT || 9090

app.listen(port, () => {
  console.log(`Huemul airlines running on port ${port}`)
})
