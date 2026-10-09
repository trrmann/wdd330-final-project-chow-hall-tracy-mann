import {
  fetchRequest
} from '../utils.js'
import {
  APIRequestQueue,
  apiRequestQueue
} from './api-request-queue.js'
/*

https://api.dictionaryapi.dev/api/v2/entries/en/<word>

original api went down (v2 dev), adjusting to new api (v1 prod).

https://freedictionaryapi.com/api/v1#GET/entries/{language}/{word}

*/
class DictionaryMemoryCache {
  #entries;

  constructor() {
    this.#entries = new Map();
  }

  hasCache(key) {
    return this.#entries.has(key);
  }

  getCache(key) {
    return this.#entries.get(key);
  }

  setCache(key, value) {
    this.#entries.set(key, value);
  }

  deleteCache(key) {
    this.#entries.delete(key);
  }

  clearCache() {
    this.#entries.clear();
  }
}

export class DictionaryAPI {
  static baseURL = {
    v1: APIRequestQueue.providers.dictionary.baseURL,
    v2: "https://api.dictionaryapi.dev/"
  };
  static apiPath = {
    v1: "api/v1/entries/",
    v2: "api/v2/entries/"
  }
  static languages = {
    v1: {
      english: "en"
    },
    v2: {
      english: "en"
    }
  }
  static languageOption = {
    v1: "",
    v2: ""
  }
  static lookupFunction = {
    v1: "/",
    v2: "/"
  }
  #version;
  #localCache;
  #hasCache(key) {
    return this.#localCache.hasCache(key);
  }
  #getCache(key) {
    return this.#localCache.getCache(key);
  }
  #deleteCache(key) {
    this.#localCache.deleteCache(key);
  }
  constructor() {
    this.#version = 'v1';
    this.#localCache = new DictionaryMemoryCache();
  }
  clearCache() {
    this.#localCache.clearCache();
  }
  async lookupEntryByString(string, cache = true) {
    const word = String(string).trim().normalize('NFC').toLocaleLowerCase();
    if (!word) {
      return null;
    }
    const cacheKey = word;
    let result;
    if (this.#hasCache(cacheKey)) {
      result = this.#getCache(cacheKey);
    } else {
      const request = `${DictionaryAPI.baseURL[this.#version]}${DictionaryAPI.apiPath[this.#version]}${DictionaryAPI.languages[this.#version]['english']}${DictionaryAPI.languageOption[this.#version]}${DictionaryAPI.lookupFunction[this.#version]}${encodeURIComponent(word)}`;
      result = await apiRequestQueue.run({
        api: 'dictionary',
        cache: this.#localCache,
        cacheKey,
        request: async () => {
          try {
            return await fetchRequest(request);
          } catch (error) {
            if (error instanceof Error && /\b404\b/.test(error.message)) {
              return null;
            }
            throw error;
          }
        }
      });
    }
    if (cache) {
      return result;
    } else {
      this.#deleteCache(cacheKey);
      return result;
    }
  }
}
