import {
  Storage
} from './storage.js'

export class APIRequestQueue {
  static configuration = {
    priorities: {},
    providers: {}
  }

  static configure(configuration) {
    APIRequestQueue.configuration = configuration;
  }

  static get priorities() {
    return APIRequestQueue.configuration.priorities;
  }

  static get providers() {
    return APIRequestQueue.configuration.providers;
  }

  static get intervalMilliseconds() {
    return APIRequestQueue.configuration.intervalMilliseconds;
  }

  #storage;
  #queue;
  #queueProcessing;
  #queueTimer;
  #inFlightRequests;
  #blockedUntil;
  #nextSequence;

  constructor() {
    this.#storage = new Storage();
    this.#queue = [];
    this.#queueProcessing = false;
    this.#queueTimer = null;
    this.#inFlightRequests = new Map();
    this.#blockedUntil = new Map();
    this.#nextSequence = 0;
  }

  #getIntervalStart(now, interval) {
    const date = new Date(now);
    if (interval === 'year') {
      return Date.UTC(date.getUTCFullYear(), 0, 1);
    }
    if (interval === 'month') {
      return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
    }
    if (interval === 'day') {
      return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    }
    if (interval === 'week') {
      const dayStart = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      const daysSinceMonday = (date.getUTCDay() + 6) % 7;
      return dayStart - daysSinceMonday * APIRequestQueue.intervalMilliseconds.day;
    }
    return Math.floor(now / APIRequestQueue.intervalMilliseconds[interval]) *
      APIRequestQueue.intervalMilliseconds[interval];
  }

  #getIntervalEnd(start, interval) {
    if (interval === 'year') {
      const date = new Date(start);
      date.setUTCFullYear(date.getUTCFullYear() + 1);
      return date.getTime();
    }
    if (interval === 'month') {
      const date = new Date(start);
      return Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
    }
    if (interval === 'week') {
      return start + APIRequestQueue.intervalMilliseconds.week;
    }
    return start + APIRequestQueue.intervalMilliseconds[interval];
  }

  #getRateLimits(request) {
    const rateLimits = Array.isArray(request.requestLimit) ?
      request.requestLimit : [request.requestLimit];
    const supportedIntervals = [
      ...Object.keys(APIRequestQueue.intervalMilliseconds),
      'month',
      'year'
    ];
    if (!this.#isValidRateLimits(rateLimits, supportedIntervals)) {
      throw new TypeError(`${request.api} requestLimit must be a rule or array of rules with positive request counts and supported intervals`);
    }
    return rateLimits;
  }

  #isValidRateLimits(rateLimits, supportedIntervals = [
    ...Object.keys(APIRequestQueue.intervalMilliseconds),
    'month',
    'year'
  ]) {
    return rateLimits.length > 0 && rateLimits.every(rule =>
      rule !== null &&
      typeof rule === 'object' &&
      Number.isSafeInteger(rule.requests) &&
      rule.requests >= 1 &&
      supportedIntervals.includes(rule.interval)
    );
  }

  #getRequestPeriods(request, now) {
    const rateLimits = this.#getRateLimits(request);
    const usage = this.#storage.objectRead(request.usageStorageKey, false) || {};
    return rateLimits.map(({
      requests,
      interval
    }) => {
      const periodStart = this.#getIntervalStart(now, interval);
      const periodEnd = this.#getIntervalEnd(periodStart, interval);
      const limitKey = `${interval}:${requests}`;
      const storedPeriod = usage.limits?.[limitKey];
      const isSamePeriod = storedPeriod?.periodStart === periodStart;
      const isLegacyPeriod = !usage.limits &&
        usage.interval === interval &&
        usage.periodStart === periodStart;
      return {
        key: limitKey,
        requests,
        interval,
        periodStart,
        periodEnd,
        usedRequests: (isSamePeriod || isLegacyPeriod) &&
          Number.isSafeInteger(isSamePeriod ? storedPeriod.requests : usage.requests) &&
          (isSamePeriod ? storedPeriod.requests : usage.requests) >= 0 ?
          (isSamePeriod ? storedPeriod.requests : usage.requests) : 0,
        lastRequestAt: (isSamePeriod || isLegacyPeriod) &&
          Number.isSafeInteger(isSamePeriod ? storedPeriod.lastRequestAt : usage.lastRequestAt) ?
          (isSamePeriod ? storedPeriod.lastRequestAt : usage.lastRequestAt) : null
      };
    });
  }

  #getStoredUsage(request) {
    return this.#storage.objectRead(request.usageStorageKey, false) || {};
  }

  #getReportingUsage(usage) {
    const storedRequestsByMonth = usage.requestsByMonth &&
      typeof usage.requestsByMonth === 'object' ?
      usage.requestsByMonth : {};
    const requestsByMonth = Object.fromEntries(
      Object.entries(storedRequestsByMonth).filter(([, count]) =>
        Number.isSafeInteger(count) && count >= 0)
    );
    const totalRequests = Number.isSafeInteger(usage.totalRequests) &&
      usage.totalRequests >= 0 ?
      usage.totalRequests :
      Object.values(requestsByMonth).reduce((total, count) => total + count, 0);
    return {
      totalRequests,
      requestsByMonth
    };
  }

  #getWaitMilliseconds(request, now) {
    const usage = this.#getStoredUsage(request);
    const blockedUntil = Math.max(Number.isSafeInteger(usage.blockedUntil) ? usage.blockedUntil : 0,
      this.#blockedUntil.get(request.api) || 0);
    if (now < blockedUntil) {
      return blockedUntil - now;
    }
    const periods = this.#getRequestPeriods(request, now);
    const previousRequestTimes = periods
      .map(period => period.lastRequestAt)
      .filter(Number.isSafeInteger);
    const lastRequestAt = Number.isSafeInteger(usage.lastRequestAt) ?
      usage.lastRequestAt :
      (previousRequestTimes.length ? Math.max(...previousRequestTimes) : null);
    return Math.max(...periods.map(period => {
      if (period.usedRequests >= period.requests) {
        return Math.max(1, period.periodEnd - now);
      }
      if (period.interval !== 'second') {
        return 0;
      }
      const spacingMilliseconds = Math.ceil(
        (period.periodEnd - period.periodStart) / period.requests
      );
      const nextAllowedAt = lastRequestAt === null ?
        now :
        lastRequestAt + spacingMilliseconds;
      return Math.max(0, nextAllowedAt - now);
    }));
  }

  #recordRequest(request, now) {
    const usage = this.#getStoredUsage(request);
    const reportingUsage = this.#getReportingUsage(usage);
    const month = new Date(now).toISOString().slice(0, 7);
    const limits = Object.fromEntries(this.#getRequestPeriods(request, now).map(period => [
      period.key,
      {
        periodStart: period.periodStart,
        requests: period.usedRequests + 1,
        lastRequestAt: now
      }
    ]));
    this.#storage.objectWrite(request.usageStorageKey, {
      ...usage,
      lastRequestAt: now,
      totalRequests: reportingUsage.totalRequests + 1,
      requestsByMonth: {
        ...reportingUsage.requestsByMonth,
        [month]: (reportingUsage.requestsByMonth[month] || 0) + 1
      },
      limits
    }, false);
  }

  #getRetryAfterTimestamp(error, request, now) {
    const retryAfter = error?.retryAfter;
    if (typeof retryAfter === 'string' && retryAfter.trim()) {
      const seconds = Number(retryAfter);
      if (Number.isFinite(seconds) && seconds >= 0) {
        return now + Math.ceil(seconds * 1000);
      }
      const retryDate = Date.parse(retryAfter);
      if (Number.isFinite(retryDate)) {
        return retryDate;
      }
    }

    const message = error instanceof Error ? error.message : String(error);
    const retryDelay = message.match(/\b(?:retry|try again)(?:\s+after|\s+in)?\s+(\d+(?:\.\d+)?)\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?)\b/i);
    if (retryDelay) {
      const amount = Number(retryDelay[1]);
      const unit = retryDelay[2].toLocaleLowerCase();
      const multiplier = unit.startsWith('h') ? 60 * 60 * 1000 :
        unit.startsWith('m') ? 60 * 1000 :
        1000;
      return now + Math.ceil(amount * multiplier);
    }

    return Math.min(...this.#getRequestPeriods(request, now).map(period => period.periodEnd));
  }

  #isRateLimitError(error) {
    const message = error instanceof Error ? error.message : String(error);
    return error?.status === 429 ||
      (/\brate[\s_-]*limit\b/i.test(message) &&
        /\b(exceed(?:ed|s)?|limit|too many|throttl(?:ed|ing))\b/i.test(message)) ||
      /\btoo many requests\b/i.test(message);
  }

  #getRateLimitResponseError(response) {
    const rateLimitMessages = [];
    let retryAfter = null;
    let hasRateLimitStatus = false;
    const visited = new Set();
    const inspect = (value, depth = 0) => {
      if (!value || typeof value !== 'object' || depth > 8 || visited.has(value)) {
        return;
      }
      visited.add(value);
      for (const [key, nestedValue] of Object.entries(value)) {
        const normalizedKey = key.toLocaleLowerCase().replace(/[^a-z]/g, '');
        if ((normalizedKey === 'status' || normalizedKey === 'code') &&
          Number(nestedValue) === 429) {
          hasRateLimitStatus = true;
        }
        if (['retryafter', 'retryafterseconds', 'retry_after', 'retry_after_seconds']
          .includes(key.toLocaleLowerCase()) &&
          (typeof nestedValue === 'string' || typeof nestedValue === 'number')) {
          retryAfter = String(nestedValue);
        }
        if (typeof nestedValue === 'string') {
          const isMessageField = /^(message|error|description|detail|title)$/i.test(key);
          if (isMessageField && this.#isRateLimitError(new Error(nestedValue))) {
            rateLimitMessages.push(nestedValue);
          }
          continue;
        }
        inspect(nestedValue, depth + 1);
      }
    };

    inspect(response);
    if (!hasRateLimitStatus && rateLimitMessages.length === 0 &&
      typeof response === 'string' &&
      this.#isRateLimitError(new Error(response))) {
      rateLimitMessages.push(response);
    }
    if (!hasRateLimitStatus && rateLimitMessages.length === 0) {
      return null;
    }

    const message = rateLimitMessages[0] ||
      (typeof response === 'string' ? response : JSON.stringify(response));
    const error = new Error(`API rate limit exceeded: ${message}`);
    error.status = 429;
    error.retryAfter = retryAfter;
    return error;
  }

  #isStorageQuotaError(error) {
    return error?.name === 'QuotaExceededError' ||
      error?.code === 22 ||
      error?.code === 1014;
  }

  #recordRateLimit(request, error, now) {
    const usage = this.#getStoredUsage(request);
    const blockedUntil = Math.max(
      now + 1,
      this.#getRetryAfterTimestamp(error, request, now)
    );
    this.#blockedUntil.set(request.api, blockedUntil);
    this.#storage.objectWrite(request.usageStorageKey, {
      ...usage,
      blockedUntil
    }, false);
    return blockedUntil;
  }

  #getInFlightRequests(api) {
    if (!this.#inFlightRequests.has(api)) {
      this.#inFlightRequests.set(api, new Map());
    }
    return this.#inFlightRequests.get(api);
  }

  #scheduleQueue() {
    if (this.#queueProcessing || this.#queueTimer !== null || !this.#queue.length) {
      return;
    }

    this.#queue = this.#queue.filter(queuedRequest => {
      if (!queuedRequest.cache?.hasCache(queuedRequest.cacheKey)) {
        return true;
      }
      queuedRequest.resolve(queuedRequest.cache.getCache(queuedRequest.cacheKey));
      this.#getInFlightRequests(queuedRequest.api).delete(queuedRequest.cacheKey);
      return false;
    });
    if (!this.#queue.length) {
      return;
    }

    const now = Date.now();
    const nextRequest = this.#queue.find(queuedRequest =>
      this.#getWaitMilliseconds(queuedRequest, now) === 0
    );
    if (!nextRequest) {
      const waitMilliseconds = Math.min(...this.#queue.map(queuedRequest =>
        this.#getWaitMilliseconds(queuedRequest, now)
      ));
      this.#queueTimer = setTimeout(() => {
        this.#queueTimer = null;
        this.#scheduleQueue();
      }, waitMilliseconds);
      return;
    }

    this.#queue.splice(this.#queue.indexOf(nextRequest), 1);
    const requestTime = Date.now();
    this.#recordRequest(nextRequest, requestTime);
    this.#queueProcessing = true;
    Promise.resolve()
      .then(nextRequest.request)
      .then(response => {
        const rateLimitError = this.#getRateLimitResponseError(response);
        if (rateLimitError) {
          const blockedUntil = this.#recordRateLimit(
            nextRequest,
            rateLimitError,
            Date.now()
          );
          console.warn(
            `${nextRequest.api} API rate limit exceeded; pausing its queue until ${new Date(blockedUntil).toISOString()}.`
          );
          nextRequest.reject(rateLimitError);
          return;
        }
        if (nextRequest.cache) {
          try {
            nextRequest.cache.setCache(nextRequest.cacheKey, response);
          } catch (error) {
            if (!this.#isStorageQuotaError(error)) {
              nextRequest.reject(error);
              return;
            }
            console.warn(
              `${nextRequest.api} API response was returned but not cached because browser storage is full.`
            );
          }
        }
        nextRequest.resolve(response);
      }, error => {
        if (this.#isRateLimitError(error)) {
          const blockedUntil = this.#recordRateLimit(nextRequest, error, Date.now());
          console.warn(
            `${nextRequest.api} API rate limit exceeded; pausing its queue until ${new Date(blockedUntil).toISOString()}.`
          );
        }
        nextRequest.reject(error);
      })
      .finally(() => {
        this.#queueProcessing = false;
        this.#scheduleQueue();
      });
  }

  run({
    api,
    cache = null,
    cacheKey = null,
    request
  }) {
    const provider = APIRequestQueue.providers[api];
    if (!provider || !Object.hasOwn(APIRequestQueue.priorities, provider.priority)) {
      return Promise.reject(new TypeError(`Unsupported API request: ${api}`));
    }
    const {
      priority,
      requestLimit,
      usageStorageKey
    } = provider;
    const rateLimits = Array.isArray(requestLimit) ? requestLimit : [requestLimit];
    if (typeof api !== 'string' || !api ||
      typeof usageStorageKey !== 'string' || !usageStorageKey ||
      !this.#isValidRateLimits(rateLimits)) {
      return Promise.reject(new TypeError('API queue requests require an API name, usage storage key, and valid rate-limit rule(s)'));
    }
    if (typeof request !== 'function') {
      return Promise.reject(new TypeError('API queue request must be a function'));
    }
    if (cache?.hasCache(cacheKey)) {
      return Promise.resolve(cache.getCache(cacheKey));
    }

    const inFlightRequests = this.#getInFlightRequests(api);
    if (cacheKey !== null && inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey);
    }

    const queuedRequest = {
      api,
      priority: APIRequestQueue.priorities[priority],
      requestLimit,
      usageStorageKey,
      cache,
      cacheKey,
      request,
      sequence: this.#nextSequence++
    };
    const pendingRequest = new Promise((resolve, reject) => {
      queuedRequest.resolve = resolve;
      queuedRequest.reject = reject;
      this.#queue.push(queuedRequest);
      this.#queue.sort((first, second) =>
        first.priority - second.priority || first.sequence - second.sequence
      );
    });
    if (cacheKey !== null) {
      inFlightRequests.set(cacheKey, pendingRequest);
      pendingRequest.finally(() => {
        if (inFlightRequests.get(cacheKey) === pendingRequest) {
          inFlightRequests.delete(cacheKey);
        }
      }).catch(() => {});
    }
    if (this.#queueTimer !== null) {
      clearTimeout(this.#queueTimer);
      this.#queueTimer = null;
    }
    this.#scheduleQueue();
    return pendingRequest;
  }

  getRequestUsage(api) {
    const provider = APIRequestQueue.providers[api];
    if (!provider) {
      throw new TypeError(`Unsupported API request: ${api}`);
    }
    const usage = this.#getReportingUsage(
      this.#storage.objectRead(provider.usageStorageKey, false) || {}
    );
    const month = new Date().toISOString().slice(0, 7);
    return {
      totalRequests: usage.totalRequests,
      currentMonth: month,
      currentMonthRequests: usage.requestsByMonth[month] || 0,
      requestsByMonth: usage.requestsByMonth
    };
  }
}

export const apiRequestQueue = new APIRequestQueue()
