const puppeteer = require('puppeteer')
const express = require('express')
const axios = require('axios')
const app = express()

const utils = require('./utils')

app.use(function(req, res, next) {
  res.setTimeout(20000, function() {
    res.json({ error: ':fire: Algo salio mal... Intenta de nuevo' })
  })
  next()
})

app.get('/', (req, res) => {
  res.send('Huemul Airlines...')
})

// Despegar
app.get('/city/:destination/:origin?', (req, res) => {
  const { origin = 'santiago', destination } = req.params

  if (!destination) return res.json(null)

  if (destination === origin) {
    res.json({ error: `No hay vuelos de ${origin} a ${destination} :retard:` })
  }

  ;(async () => {
    try {
      const destinationCities = await utils.findCities(destination)
      const originCities = origin === 'santiago'
        ? [{ code: 'scl' }]
        : await utils.findCities(origin)

      const originExist = typeof originCities !== 'undefined' && originCities.length > 0
      const destinationExist = typeof destinationCities !== 'undefined' && destinationCities.length > 0

      if (!originExist) {
        res.json({ error: `Aún no tengo vuelos desde ${origin}` })
      } else if (!destinationExist) {
        res.json({ error: `Aún no tengo vuelos hasta ${destination}` })
      } else {
        // Select the first city found
        const originCityCode = originCities[0].code.toLocaleLowerCase()
        const destinationCityCode = destinationCities[0].code.toLocaleLowerCase()
        const despegarUrl = `https://www.despegar.cl/vuelos/${originCityCode}/${destinationCityCode}/`
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
        const page = await browser.newPage()
        page.setViewport({ width: 1280, height: 1000 })
        await page.goto(despegarUrl, { waitUntil: 'domcontentloaded' })
        try {
          const priceCLP = await page.evaluate(() => document.querySelector('#alerts .price-amount').textContent)
          if (!priceCLP) {
            res.json({ error: 'No encuentro vuelos para esta ciudad' })
          }
          const { data: dolarToday } = await axios.get('https://mindicador.cl/api/dolar')
          const priceUSD = (parseInt(priceCLP.replace('.', ''), 10) / dolarToday.serie[0].valor).toFixed().toString()
          res.json({ priceCLP: priceCLP.replace('$ ', ''), priceUSD, url: despegarUrl })
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

const port = process.env.PORT || 9090

app.listen(port, () => {
  console.log(`Huemul airlines running on port ${port}`)
})
