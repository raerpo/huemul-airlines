const puppeteer = require('puppeteer');
const express = require('express');
const app = express();

// I want to keep the city list small. If you want to include more cities you can do it here:
const cityCodes = {
  // Chile
  osorno: 'ZOS',
  concepcion: 'CCP',
  iquique: 'IQQ',
  antofagasta: 'ANF',
  arica: 'ARI',
  coquimbo: 'COW',
  castro: 'WCA',
  temuco: 'ZCO',
  'isla de pascua': 'IPC',
  valdivia: 'ZAL',
  'la serena': 'lsc',
  serena: 'lsc',
  calama: 'cjc',
  'punta arenas': 'PUQ',
  'puerto aysen': 'WPA',
  balmaceda: 'BBA',
  'puerto montt': 'PMC',
  // Colombia
  bogota: 'BOG',
  medellin: 'EOH',
  'cartagena de indias': 'ctg',
  'san andres': 'ADZ',
  // Argentina
  'buenos aires': 'BUE',
  mendoza: 'MDZ',
  // Peru
  lima: 'lim',
  // Brasil
  'rio de janeiro': 'rio',
  'sao paulo': 'sao',
  // Uruguay
  montevideo: 'mvd',

  // Norte america
  'new york': 'NYC',
  miami: 'mia',
  'san francisco': 'sfo',
  'las vegas': 'las',
  mexico: 'mex',
  montreal: 'ymq',

  // Europa
  madrid: 'mad',
  roma: 'rom',
  paris: 'par',
  berlin: 'ber',
  moscu: 'mow',
  barcelona: 'bcn',
  // Asia
  tokyo: 'tyo',
  beijing: 'bjs'
}

app.get('/', (req, res) => {
  res.send('Huemul Airlines...');
});

app.get('/city/:city', (req, res) => {
  const cityParam = req.params.city;
  if(!cityParam) return res.json(null);
  if (cityParam === 'Santiago' || cityParam === 'santiago') {
    res.json({error: 'No hay vuelos de Santiago a Santiago :retard:'})
    return;
  }
  const city = cityParam
      .toLowerCase()
      .replace('á', 'a')
      .replace('é', 'e')
      .replace('í', 'i')
      .replace('ó', 'o')
      .replace('ú', 'u')
      .replace('ñ', 'n')
      .replace('ã', 'a')
    const cityExist = typeof cityCodes[city] !== 'undefined'
    if (!cityExist) {
      res.json({error: 'Aún no tengo vuelos a esa ciudad :airplane-arriving:'})
      return;
    }
    const cityCode = cityCodes[city]
    const despegarUrl = `https://www.despegar.cl/vuelos/scl/${cityCode}/`;
    ;(async () => {
      const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']})
      const page = await browser.newPage()
      page.setViewport({ width: 1280, height: 1000 })
      await page.goto(despegarUrl)
      const price = await page.evaluate(() => document.querySelector('#alerts .price-amount').textContent)
      if (!price) {
        res.json({error: 'No hay vuelos para esta ciudad'})
      }
      res.json({price, url: despegarUrl })
      await browser.close()
    })()
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Huemul airlines running on port ${port}`);
});