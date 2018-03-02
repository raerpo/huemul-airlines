## Huemul-airlines
Huemul-airlines is a REST API to get the cheapest flight from Santiago, Chile to a bunch of register cities. The prices are in Chilean pesos.

### Development
If you want to include more cities you can follow the format establish in `cities.js`. To run it locally you can do it with:

```
npm install
npm run start
```

### Live API
You can access the API in this URL:
*https://huemul-airlines.herokuapp.com/city/:city*

Where `:city` is the name of one of the register cities. For example:
[`https://huemul-airlines.herokuapp.com/city/bogota`](https://huemul-airlines.herokuapp.com/city/bogota)

### Disclaimer
This API is for personal use and not commercial purpose. All the information are coming from [despegar.com](http://www.despegar.cl) which, by the way, i'm a big fan.
