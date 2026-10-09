import {
  fetchRequest
} from '../utils.js'
import {
  Cache
} from './storage.js'

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
  static baseURL = "https://api.restcountries.com/";
  static countriesAPIPath = "countries/v5";
  static countriesQueryFunction = "?q";
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
  #hasCache(key) {
    return this.#localCache.hasCache(key);
  }
  #getCache(key) {
    return this.#localCache.getCache(key);
  }
  #setCache(key, value) {
    this.#localCache.setCache(key, value);
  }
  #deleteCache(key) {
    this.#localCache.deleteCache(key);
  }
  constructor(isSessionCache = true) {
    //this.#apiLiveDemoPublicAPIKey = import.meta.env.VITE_REST_COUNTRIES_LIVE_DEMO_KEY;
    this.#apiLiveFreeAPIKey = import.meta.env.VITE_REST_COUNTRIES_FREE_KEY;
    this.#localCache = new Cache({
      isSessionCache: isSessionCache
    });
  }
  clearCache() {
    this.#localCache.clearCache();
  }
  async search25CountriesWithNoOffsetByStringQuery(string, cache = true) {
    const cacheKey = `Country-${string}`;
    if (!this.#hasCache(cacheKey)) {
      const request = `${RestCountries.baseURL}${RestCountries.countriesAPIPath}${RestCountries.countriesQueryFunction}${string}`;
      this.#setCache(cacheKey, await this.#fetch(request, this.#apiLiveFreeAPIKey));
    }
    if (cache) {
      return this.#getCache(cacheKey);
    } else {
      const response = this.#getCache(cacheKey);
      this.#deleteCache(cacheKey);
      return response;
    }
  }
  async convertCurrency(from, to, amount, cache = true) {
    const cacheKey = `Convert-${from}-${to}-${amount}`;
    if (!this.#hasCache(cacheKey)) {
      const request = `${RestCountries.baseURL}${RestCountries.currenciesAPIPath}${RestCountries.currenciesConvertFunction}${RestCountries.currenciesConvertFromQuery}${from}${RestCountries.currenciesConvertToQuery}${to}${RestCountries.currenciesConvertAmountQuery}${amount}`;
      this.#setCache(cacheKey, await this.#fetch(request, this.#apiLiveFreeAPIKey /*this.#apiLiveDemoPublicAPIKey*/ ));
    }
    if (cache) {
      return this.#getCache(cacheKey);
    } else {
      const response = this.#getCache(cacheKey);
      this.#deleteCache(cacheKey);
      return response;
    }
  }
  async currencySymbols(cache = true) {
    const cacheKey = `Symbols`;
    if (!this.#hasCache(cacheKey)) {
      const request = `${RestCountries.baseURL}${RestCountries.currenciesAPIPath}${RestCountries.currenciesSymbolsFunction}`;
      this.#setCache(cacheKey, await this.#fetch(request, this.#apiLiveFreeAPIKey));
    }
    if (cache) {
      return this.#getCache(cacheKey);
    } else {
      const response = this.#getCache(cacheKey);
      this.#deleteCache(cacheKey);
      return response;
    }
  }
}
