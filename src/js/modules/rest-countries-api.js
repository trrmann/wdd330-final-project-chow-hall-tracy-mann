import {
  fetchRequest,
  getCountryMatchRank,
  getCountryRecords
} from '../utils.js'
import {
  Cache,
} from './storage.js'
import {
  APIRequestQueue,
  apiRequestQueue
} from './api-request-queue.js'
import {
  convertMockCurrency,
  createMockCountryForName,
  getMockCurrencySymbols,
  searchMockCountries
} from './rest-countries-mock-data.js'

/*
const response = await fetch(
  'https://api.restcountries.com/countries/v5?q=canada',
  { headers: { 'Authorization': 'Bearer ##freeKey##' } }
);
const data = await response.json();

/countries/v5?limit=25&offset=25
/countries/v5?pretty
/countries/v5?response_fields=names.common,codes.alpha_2,flag.emoji
/countries/v5?response_fields=names&response_fields_omit=names.translations
/countries/v5?region=Europe
/countries/v5?region=Europe&memberships.eu=1
/countries/v5/names.common/United+States
/countries/v5/names.common/United%20Kingdom
/countries/v5/codes.alpha_2/CA
flag.emoji
flag.unicode
flag.html_entity
flag.url_png
flag.url_svg
region
subregion
continents
area.miles
coordinates.lat
coordinates.lng
timezones
population
economy.gini_coefficient
languages
currencies
calling_codes
classification.sovereign
classification.un_member
classification.un_observer
government_type
leaders
links.google_maps

// Demo key: no account required.
const response = await fetch(
  'https://api.restcountries.com/currencies/v1/convert?from=USD&to=EUR&amount=100',
  { headers: { 'Authorization': 'Bearer ##liveDemoKey##' } }
);
const data = await response.json();

/currencies/v1/symbols
const response = await fetch(
  'https://api.restcountries.com/currencies/v1/symbols',
  { headers: { 'Authorization': 'Bearer ##freeKey##' } }
);
const data = await response.json();

*/
export class RestCountries {
  static get baseURL() {
    return APIRequestQueue.providers['rest-countries'].baseURL;
  }
  static countriesAPIPath = "countries/v5";
  static countriesQueryFunction = "?q=";
  static countriesQueryLimitOption = "limit=";
  static countriesQueryOffsetOption = "offset=";
  static countriesQueryPrettyOption = "pretty";
  static countriesQueryResponseFieldsOption = "response_fields=";
  static countriesQueryResponseFieldsOmitOption = "response_fields_omit=";
  static countriesQueryResponseFields = {
    emojiFlag: "flag.emoji",
    unicodeFlag: "flag.unicode",
    htmlFlag: "flag.html_entity",
    pngFlag: "flag.url_png",
    svgFlag: "flag.url_svg",
    region: "region",
    subregion: "subregion",
    continents: "continents",
    areaMiles: "area.miles",
    coordinatesLat: "coordinates.lat",
    coordinatesLng: "coordinates.lng",
    timezones: "timezones",
    population: "population",
    economyGINIC: "economy.gini_coefficient",
    languages: "languages",
    currencies: "currencies",
    callingCodes: "calling_codes",
    classificationSovereign: "classification.sovereign",
    classificationUNMember: "classification.un_member",
    classificationUNObserver: "classification.un_observer",
    governmentType: "government_type",
    leaders: "leaders",
    linksGoogleMaps: "links.google_maps"
  };
  static countriesQueryRegionOption = "region=";
  static countriesCommonNameLookupFunction = "/names.common/";
  static countriesAlpha2CodeLookupFunction = "/codes.alpha_2/";
  static currenciesAPIPath = "currencies/v1/";
  static currenciesConvertFunction = "convert?";
  static currenciesConvertFromQuery = "from=";
  static currenciesConvertToQuery = "&to=";
  static currenciesConvertAmountQuery = "&amount=";
  static currenciesSymbolsFunction = "symbols";
  #localCache;
  #useMockData;
  //#apiLiveDemoPublicAPIKey;
  #apiLiveFreeAPIKey;
  #header(apiKey) {
    const configOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    };
    configOptions.headers['Authorization'] = `Bearer ${apiKey}`;
    return configOptions;
  }
  async #fetch(request, apiKey) {
    const response = await fetchRequest(request, this.#header(apiKey));
    return response
  }
  #deleteCache(key) {
    this.#localCache.deleteCache(key);
  }
  constructor(isSessionCache = true) {
    //this.#apiLiveDemoPublicAPIKey = import.meta.env.VITE_REST_COUNTRIES_LIVE_DEMO_KEY;
    this.#apiLiveFreeAPIKey = import.meta.env.VITE_REST_COUNTRIES_FREE_KEY;
    this.#useMockData = import.meta.env.VITE_REST_COUNTRIES_USE_MOCK_DATA === 'true';
    this.#localCache = new Cache({
      isSessionCache: isSessionCache,
      namespace: 'rest-countries'
    });
  }
  get isUsingMockData() {
    return this.#useMockData;
  }
  async #cachedRequest(cacheKey, request, cache = true, apiKey = this.#apiLiveFreeAPIKey) {
    const scopedCacheKey = `${this.#useMockData ? 'mock' : 'live'}:${cacheKey}`;
    if (typeof request === 'function') {
      let response;
      if (this.#localCache.hasCache(scopedCacheKey)) {
        response = this.#localCache.getCache(scopedCacheKey);
      } else {
        response = await request();
        this.#localCache.setCache(scopedCacheKey, response);
      }
      if (!cache) {
        this.#deleteCache(scopedCacheKey);
      }
      return response;
    }
    const response = await apiRequestQueue.run({
      api: 'rest-countries',
      cache: this.#localCache,
      cacheKey: scopedCacheKey,
      request: () => this.#fetch(request, apiKey)
    });
    if (!cache) {
      this.#deleteCache(scopedCacheKey);
    }
    return response;
  }
  clearCache() {
    this.#localCache.clearCache();
  }
  async search25CountriesWithNoOffsetByStringQuery(string, cache = true) {
    const searchTerm = String(string).trim();
    if (this.#useMockData) {
      const cacheKey = `Country-${searchTerm.toLocaleLowerCase()}`;
      return this.#cachedRequest(
        cacheKey,
        () => searchMockCountries(searchTerm, 25),
        cache
      );
    }
    const cacheKey = `Country-${searchTerm.toLocaleLowerCase()}`;
    const request = `${RestCountries.baseURL}${RestCountries.countriesAPIPath}${RestCountries.countriesQueryFunction}${encodeURIComponent(searchTerm)}&${RestCountries.countriesQueryLimitOption}25`;
    return this.#cachedRequest(cacheKey, request, cache);
  }
  async lookupCountryByName(name, cache = true) {
    const countryName = String(name).trim();
    if (!countryName) {
      return undefined;
    }
    const records = await this.search25CountriesWithNoOffsetByStringQuery(countryName, cache);
    const countries = getCountryRecords(records);
    const rankedMatches = countries
      .map(country => ({
        country,
        rank: getCountryMatchRank(country, countryName)
      }))
      .filter(match => match.rank > 0)
      .sort((first, second) => second.rank - first.rank);
    if (rankedMatches.length) {
      const bestMatches = rankedMatches.filter(match => match.rank === rankedMatches[0].rank);
      return bestMatches.length === 1 ? bestMatches[0].country : undefined;
    }
    if (countries.length === 1) {
      return countries[0];
    }
    return this.#useMockData ? createMockCountryForName(countryName) : undefined;
  }
  async convertCurrency(from, to, amount, cache = true) {
    if (this.#useMockData) {
      const cacheKey = `Convert-${from}-${to}-${amount}`;
      return this.#cachedRequest(
        cacheKey,
        () => convertMockCurrency(from, to, amount),
        cache
      );
    }
    const cacheKey = `Convert-${from}-${to}-${amount}`;
    const request = `${RestCountries.baseURL}${RestCountries.currenciesAPIPath}${RestCountries.currenciesConvertFunction}${RestCountries.currenciesConvertFromQuery}${from}${RestCountries.currenciesConvertToQuery}${to}${RestCountries.currenciesConvertAmountQuery}${amount}`;
    return this.#cachedRequest(cacheKey, request, cache);
  }
  async currencySymbols(cache = true) {
    if (this.#useMockData) {
      return this.#cachedRequest(
        'Symbols',
        getMockCurrencySymbols,
        cache
      );
    }
    const cacheKey = `Symbols`;
    const request = `${RestCountries.baseURL}${RestCountries.currenciesAPIPath}${RestCountries.currenciesSymbolsFunction}`;
    return this.#cachedRequest(cacheKey, request, cache);
  }
}
