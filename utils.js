const https = require('https');
const querystring = require('querystring');

/**
 * @typedef {Object} City
 * @property {string} code - Indica el codigo de la ciudad.
 * @property {string} name - Indica el nombre de la ciudad.
 */
/**
 * Metodo para buscar el codigo de una ciudad.
 *
 * Se usa el request usado en la funcion del <select> de ciudades de despegar.
 *
 * @param {string} cityName - Nombre de la ciudad a buscar.
 * @returns {Promise<Array<City>>} - Codigo de la ciudad encontrada.
 */
exports.findCities = cityName => new Promise((resolve, reject) => {
  const query = querystring.stringify({
    locale: 'es-CL',
    profile: 'sbox-flights',
    hint: cityName,
  });
  const options = {
    hostname: 'www.despegar.cl',
    path: `/suggestions?${query}`,
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:66.0) Gecko/20100101 Firefox/66.0',
      Accept: '*/*',
      'Accept-Language': 'es-CL,es;q=0.8,en-US;q=0.5,en;q=0.3',
      Referer: 'https://www.despegar.cl/vuelos/',
      Connection: 'keep-alive',
      Pragma: 'no-cache',
      'Cache-Control': 'no-cache',
    },
  };
  const req = https.request(options, (res) => {
    if (res.statusCode !== 200) {
      return reject(new Error(`Invalid statusCode: ${res.statusCode}`));
    }
    const rawData = [];
    res.on('data', chunk => rawData.push(chunk));
    res.on('end', () => {
      try {
        const data = JSON.parse(Buffer.concat(rawData).toString());
        const cities = data.items.find(({ group }) => group === 'CITY').items;
        resolve(cities.map(city => ({ code: city.target.code, name: city.display })));
      } catch (err) {
        reject(new Error('Not found'));
      }
    });
  });
  req.on('error', err => reject(err));
  req.end();
});
