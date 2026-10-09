import {
  fetchRequest
} from '../utils.js'
import {
  Cache,
} from './storage.js'
import {
  APIRequestQueue,
  apiRequestQueue
} from './api-request-queue.js'

function normalizeCountryName(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getCountryRecords(response) {
  if (Array.isArray(response)) {
    return response;
  }
  if (!response || typeof response !== 'object') {
    return [];
  }
  for (const key of ['data', 'objects', 'results', 'countries', 'result']) {
    if (response[key] !== undefined) {
      const records = getCountryRecords(response[key]);
      if (records.length) {
        return records;
      }
    }
  }
  return response.names || response.name || response.codes || response.cca3 ? [response] : [];
}

function getStrings(value) {
  if (typeof value === 'string') {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.flatMap(getStrings);
  }
  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(getStrings);
  }
  return [];
}

function getCountryMatchRank(country, searchName) {
  const target = normalizeCountryName(searchName);
  const primaryNames = [
    country?.names?.common,
    country?.names?.official,
    country?.name?.common,
    country?.name?.official
  ];
  if (primaryNames.some(name => typeof name === 'string' && normalizeCountryName(name) === target)) {
    return 2;
  }
  const searchableNames = [
    country?.names,
    country?.name,
    country?.demonyms,
    country?.demonym,
    country?.altSpellings,
    country?.alt_spellings,
    country?.nativeName,
    country?.translations
  ];
  return searchableNames.some(names =>
    getStrings(names).some(name => normalizeCountryName(name) === target)
  ) ? 1 : 0;
}

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
  static baseURL = APIRequestQueue.providers['rest-countries'].baseURL;
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
    this.#localCache = new Cache({
      isSessionCache: isSessionCache
    });
  }
  async #cachedRequest(cacheKey, request, cache = true, apiKey = this.#apiLiveFreeAPIKey) {
    const response = await apiRequestQueue.run({
      api: 'rest-countries',
      cache: this.#localCache,
      cacheKey,
      request: () => this.#fetch(request, apiKey)
    });
    if (!cache) {
      this.#deleteCache(cacheKey);
    }
    return response;
  }
  clearCache() {
    this.#localCache.clearCache();
  }
  async search25CountriesWithNoOffsetByStringQuery(string, cache = true) {
    const searchTerm = String(string).trim();
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
    return countries.length === 1 ? countries[0] : undefined;
  }
  async convertCurrency(from, to, amount, cache = true) {
    const cacheKey = `Convert-${from}-${to}-${amount}`;
    const request = `${RestCountries.baseURL}${RestCountries.currenciesAPIPath}${RestCountries.currenciesConvertFunction}${RestCountries.currenciesConvertFromQuery}${from}${RestCountries.currenciesConvertToQuery}${to}${RestCountries.currenciesConvertAmountQuery}${amount}`;
    return this.#cachedRequest(cacheKey, request, cache);
  }
  async currencySymbols(cache = true) {
    const cacheKey = `Symbols`;
    const request = `${RestCountries.baseURL}${RestCountries.currenciesAPIPath}${RestCountries.currenciesSymbolsFunction}`;
    return this.#cachedRequest(cacheKey, request, cache);
  }
}
