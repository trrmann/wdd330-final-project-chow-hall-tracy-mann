import {
  fetchRequest
} from '../utils.js'
import {
  Cache
} from './storage.js'
import {
  Storage
} from './storage.js'
/*

https://api.dictionaryapi.dev/api/v2/entries/en/<word>

original api went down (v2 dev), adjusting to new api (v1 prod).

https://freedictionaryapi.com/api/v1#GET/entries/{language}/{word}

*/
export class DictionaryAPI {
  static requestLimit = {
    requests: 1000,
    interval: 'hour'
  };
  static requestUsageStorageKey = 'Dictionary-API-Request-Usage';
  static intervalMilliseconds = {
    second: 1000,
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000
  };
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
  #storage;
  #requestQueue;
  #queueProcessing;
  #inFlightRequests;
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
  #getIntervalStart(now, interval) {
    const date = new Date(now);
    if (interval === 'month') {
      return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
    }
    if (interval === 'day') {
      return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    }
    const intervalMilliseconds = DictionaryAPI.intervalMilliseconds[interval];
    return Math.floor(now / intervalMilliseconds) * intervalMilliseconds;
  }
  #getIntervalEnd(start, interval) {
    if (interval === 'month') {
      const date = new Date(start);
      return Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
    }
    return start + DictionaryAPI.intervalMilliseconds[interval];
  }
  #getUsage(interval, start) {
    const usage = this.#storage.objectRead(DictionaryAPI.requestUsageStorageKey, false);
    return {
      requests: usage.interval === interval && usage.periodStart === start &&
          Number.isSafeInteger(usage.requests) && usage.requests >= 0 ?
        usage.requests :
        0,
      lastRequestAt: Number.isSafeInteger(usage.lastRequestAt) ? usage.lastRequestAt : null
    };
  }
  #recordUsage(interval, start, requests, lastRequestAt) {
    this.#storage.objectWrite(DictionaryAPI.requestUsageStorageKey, {
      interval,
      periodStart: start,
      requests,
      lastRequestAt
    }, false);
  }
  async #waitForQuota() {
    const {
      requests,
      interval
    } = DictionaryAPI.requestLimit;
    const supportedIntervals = [
      ...Object.keys(DictionaryAPI.intervalMilliseconds),
      'month'
    ];
    if (!Number.isSafeInteger(requests) || requests < 1 || !supportedIntervals.includes(interval)) {
      throw new TypeError('DictionaryAPI.requestLimit must specify a positive request count and a supported interval');
    }
    while (true) {
      const now = Date.now();
      const periodStart = this.#getIntervalStart(now, interval);
      const usage = this.#getUsage(interval, periodStart);
      if (usage.requests >= requests) {
        await new Promise(resolve => setTimeout(resolve, Math.max(1, this.#getIntervalEnd(periodStart, interval) - now)));
        continue;
      }
      const intervalDuration = this.#getIntervalEnd(periodStart, interval) - periodStart;
      const spacingMilliseconds = Math.ceil(intervalDuration / requests);
      const nextAllowedAt = usage.lastRequestAt === null ? now : usage.lastRequestAt + spacingMilliseconds;
      if (now < nextAllowedAt) {
        await new Promise(resolve => setTimeout(resolve, nextAllowedAt - now));
        continue;
      }
      this.#recordUsage(interval, periodStart, usage.requests + 1, now);
      return;
    }
  }
  #enqueueRequest(request) {
    return new Promise((resolve, reject) => {
      this.#requestQueue.push({
        request,
        resolve,
        reject
      });
      this.#processRequestQueue();
    });
  }
  async #processRequestQueue() {
    if (this.#queueProcessing) {
      return;
    }
    this.#queueProcessing = true;
    while (this.#requestQueue.length) {
      const queuedRequest = this.#requestQueue.shift();
      try {
        await this.#waitForQuota();
        queuedRequest.resolve(await queuedRequest.request());
      } catch (error) {
        queuedRequest.reject(error);
      }
    }
    this.#queueProcessing = false;
  }
  constructor(isSessionCache = true) {
    this.#version = 'v1';
    this.#localCache = new Cache({
      isSessionCache: isSessionCache
    });
    this.#storage = new Storage();
    this.#requestQueue = [];
    this.#queueProcessing = false;
    this.#inFlightRequests = new Map();
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
    } else if (this.#inFlightRequests.has(cacheKey)) {
      result = await this.#inFlightRequests.get(cacheKey);
    } else {
      const request = `${DictionaryAPI.baseURL[this.#version]}${DictionaryAPI.apiPath[this.#version]}${DictionaryAPI.languages[this.#version]['english']}${DictionaryAPI.languageOption[this.#version]}${DictionaryAPI.lookupFunction[this.#version]}${encodeURIComponent(word)}`;
      const pendingRequest = this.#enqueueRequest(async () => {
        if (this.#hasCache(cacheKey)) {
          return this.#getCache(cacheKey);
        }
        try {
          const entry = await this.#fetch(request);
          this.#setCache(cacheKey, entry);
          return entry;
        } catch (error) {
          if (error instanceof Error && /\b404\b/.test(error.message)) {
            this.#setCache(cacheKey, null);
            return null;
          }
          throw error;
        }
      });
      this.#inFlightRequests.set(cacheKey, pendingRequest);
      try {
        result = await pendingRequest;
      } finally {
        this.#inFlightRequests.delete(cacheKey);
      }
    }
    if (cache) {
      return result;
    } else {
      this.#deleteCache(cacheKey);
      return result;
    }
  }
}
