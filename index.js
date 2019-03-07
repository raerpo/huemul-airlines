const puppeteer = require('puppeteer')
const express = require('express')
const app = express()

const utils = require('./utils')

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
    } catch (error) {
      res.send('No encuentro esa ciudad')
    }
    const cityExist = typeof foundCities !== 'undefined' && foundCities.length > 0
    if (!cityExist) {
      res.json({ error: 'Aún no tengo vuelos a esa ciudad' })
      return
    }
    // Select the first city found
    const cityCode = foundCities[0].code.toLocaleLowerCase()
    const despegarUrl = `https://www.despegar.cl/vuelos/scl/${cityCode}/`
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    const page = await browser.newPage()
    page.setViewport({ width: 1280, height: 1000 })
    await page.goto(despegarUrl, {waitUntil: 'domcontentloaded'})
    const price = await page.evaluate(() => document.querySelector('#alerts .price-amount').textContent)
    if (!price) {
      res.json({ error: 'No hay vuelos para esta ciudad' })
    }
    res.json({ price, url: despegarUrl })
    await browser.close()
  })()
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`Huemul airlines running on port ${port}`)
})
