## Huemul-airlines
Huemul-airlines is a REST API to get the cheapest flight from city to city, in a bunch of register cities. The prices are in Chilean pesos and american dollar.

### Development
If you want to include more cities you can follow the format establish in `cities.js`. To run it locally you can do it with:

```
npm install
npm run start
```

### Live API
You can access the API in this URL:
*https://huemul-airlines.herokuapp.com/city/:destination/:origin?*

Where `:destination` is required and `:origin?` is optional (default are santiago), both are the name of one of the register cities.

Examples:
Without origin
[`https://huemul-airlines.herokuapp.com/city/bogota`](https://huemul-airlines.herokuapp.com/city/bogota)

With origin
[`https://huemul-airlines.herokuapp.com/city/bogota/caracas`](https://huemul-airlines.herokuapp.com/city/bogota/caracas)

### Disclaimer
This API is for personal use and not commercial purpose. All the information are coming from [despegar.com](http://www.despegar.cl) which, by the way, i'm a big fan.
