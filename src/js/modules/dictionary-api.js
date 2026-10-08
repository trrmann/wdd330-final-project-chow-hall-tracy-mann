import {
  fetchRequest
} from '../utils.js'
import {
  Cache
} from './storage.js'
/*

https://api.dictionaryapi.dev/api/v2/entries/en/<word>

original api went down (v2 dev), adjusting to new api (v1 prod).

https://freedictionaryapi.com/api/v1#GET/entries/{language}/{word}

*/
export class DictionaryAPI {
  static baseURL = {
    v1: "https://freedictionaryapi.com/",
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
  async #fetch(request) {
    const response = await fetchRequest(request);
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
    this.#version = 'v1';
    this.#localCache = new Cache({isSessionCache:isSessionCache});
  }
  clearCache() {
    this.#localCache.clearCache();
  }
  async lookupEntryByString(string, cache = true) {
    const cacheKey = `${string}`;
    if (!this.#hasCache(cacheKey)) {
      const request = `${DictionaryAPI.baseURL[this.#version]}${DictionaryAPI.apiPath[this.#version]}${DictionaryAPI.languages[this.#version]['english']}${DictionaryAPI.languageOption[this.#version]}${DictionaryAPI.lookupFunction[this.#version]}${string}`;
      this.#setCache(cacheKey, await this.#fetch(request));
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
