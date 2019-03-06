const { describe, before, it } = require('mocha');
const { expect } = require('chai');
const nock = require('nock');
const { findCities } = require('./utils');

describe('findCities', () => {
  before(() => {
    nock('https://www.despegar.cl')
      .get('/suggestions')
      .query({
        locale: 'es-CL',
        profile: 'sbox-flights',
        hint: 'concepcion',
      })
      .reply(200, {
        items: [
          {
            group: 'CITY',
            items: [
              { target: { code: 'CCP' }, display: 'Concepción, Biobío, Chile' },
            ],
          },
        ],
      });
  });

  it('expect find cities', async () => {
    const cities = await findCities('concepcion');
    expect(cities).to.be.a('array');
    expect(cities).to.deep.include({ code: 'CCP', name: 'Concepción, Biobío, Chile' });
  });

  before(() => {
    nock('https://www.despegar.cl')
      .get('/suggestions')
      .query({
        locale: 'es-CL',
        profile: 'sbox-flights',
        hint: 'not found',
      })
      .reply(200, {
        items: [],
      });
  });

  it('expect not found error', async () => {
    try {
      await findCities('not found');
    } catch (err) {
      expect(err).to.be.a('error');
      expect(err.message).to.equal('Not found');
    }
  });

  before(() => {
    nock('https://www.despegar.cl')
      .get('/suggestions')
      .query({
        locale: 'es-CL',
        profile: 'sbox-flights',
        hint: 'not found',
      })
      .reply(301);
  });

  it('expect invalid statusCode error', async () => {
    try {
      await findCities('not found');
    } catch (err) {
      expect(err).to.be.a('error');
      expect(err.message).to.equal('Invalid statusCode: 301');
    }
  });

  before(() => {
    nock('https://www.despegar.cl')
      .get('/suggestions')
      .query({
        locale: 'es-CL',
        profile: 'sbox-flights',
        hint: 'not found',
      })
      .replyWithError('Server error');
  });

  it('expect request error', async () => {
    try {
      await findCities('not found');
    } catch (err) {
      expect(err).to.be.a('error');
      expect(err.message).to.equal('Server error');
    }
  });
});
