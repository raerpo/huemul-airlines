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

app.get('/city/:city', (req, res) => {
  const cityParam = req.params.city
  if (!cityParam) return res.json(null)
  if (cityParam === 'Santiago' || cityParam === 'santiago') {
    res.json({ error: 'No hay vuelos de Santiago a Santiago :retard:' })
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
          res.json({ price, url: despegarUrl })
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
