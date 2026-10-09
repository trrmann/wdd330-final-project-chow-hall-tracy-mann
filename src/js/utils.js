const viteEnvironment = import.meta.env || {};

function getProviderRateLimits(environmentVariable, defaultLimits, supportedIntervals) {
  const configuredLimits = viteEnvironment[environmentVariable];
  if (typeof configuredLimits !== 'string' || !configuredLimits.trim()) {
    return defaultLimits.map(limit => ({
      ...limit
    }));
  }

  let limits;
  try {
    limits = JSON.parse(configuredLimits);
  } catch (error) {
    throw new Error(`${environmentVariable} must contain a JSON array of rate-limit rules`, {
      cause: error
    });
  }

  if (!Array.isArray(limits) || !limits.length || limits.some(limit =>
      !limit ||
      typeof limit !== 'object' ||
      !Number.isSafeInteger(limit.requests) ||
      limit.requests < 1 ||
      !supportedIntervals.includes(limit.interval)
    )) {
    throw new TypeError(`${environmentVariable} must contain a JSON array of valid rate-limit rules`);
  }

  return limits.map(({
    requests,
    interval
  }) => ({
    requests,
    interval
  }));
}

function getProviderBaseURL(environmentVariable, defaultBaseURL) {
  const configuredBaseURL = viteEnvironment[environmentVariable];
  const baseURL = typeof configuredBaseURL === 'string' && configuredBaseURL.trim() ?
    configuredBaseURL.trim() :
    defaultBaseURL;
  let parsedURL;

  try {
    parsedURL = new URL(baseURL);
  } catch (error) {
    throw new Error(`${environmentVariable} must be an absolute HTTP or HTTPS URL`, {
      cause: error
    });
  }

  if (!['http:', 'https:'].includes(parsedURL.protocol)) {
    throw new TypeError(`${environmentVariable} must be an absolute HTTP or HTTPS URL`);
  }

  return `${baseURL.replace(/\/+$/, '')}/`;
}

export function createApiConfiguration(configurationDefaults, supportedIntervals) {
  return {
    intervalMilliseconds: {
      ...configurationDefaults.intervalMilliseconds
    },
    priorities: {
      ...configurationDefaults.priorities
    },
    providers: Object.fromEntries(
      Object.entries(configurationDefaults.providers).map(([provider, defaults]) => [
        provider,
        {
          priority: defaults.priority,
          requestLimit: getProviderRateLimits(
            defaults.rateLimitEnvironmentVariable,
            defaults.defaultRateLimits,
            supportedIntervals
          ),
          baseURL: getProviderBaseURL(
            defaults.baseURLEnvironmentVariable,
            defaults.defaultBaseURL
          ),
          usageStorageKey: defaults.usageStorageKey
        }
      ])
    )
  };
}

export function hasQueryParams(url) {
  const parsedURL = new URL(url, window.location.origin);
  return (parsedURL.searchParams.size > 0);
}
export function logCurrentState(message) {
  console.log(message);
}
export async function fetchRequest(request, header = null) {
  let response;
  try {
    if (header === null) {
      response = await fetch(request);
    } else {
      response = await fetch(request, header);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Request failed for ${request}: ${message}`, {
      cause: error
    });
  }
  if (!response.ok) {
    let responseBody = '';
    if (typeof response.text === 'function') {
      responseBody = await response.text();
    }
    const message = `Request failed for ${request}: ${response.status} ${response.statusText} ${responseBody}`.trim();
    const error = new Error(message);
    error.status = response.status;
    error.retryAfter = response.headers?.get('Retry-After') || null;
    throw error;
  }
  return await response.json();
}

export function normalizeCountryName(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function getCountryRecords(response) {
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

export function getStrings(value) {
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

export function getCountryMatchRank(country, searchName) {
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

export function normalizeWord(value) {
  return typeof value === 'string' ? value.trim().normalize('NFC').toLocaleLowerCase() : '';
}

export function objectOrEmpty(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

export function modelArray(value, Model) {
  return Array.isArray(value) ?
    value.map(item => item instanceof Model ? item : Model.fromJSON(item)) : [];
}

export function stringArray(value) {
  return Array.isArray(value) ? value.filter(item => typeof item === 'string') : [];
}

/*
const url = new URL(relativePath, window.location.origin);

// 2. Use built-in URLSearchParams methods to append or update parameters
url.searchParams.set('week', '2');
url.searchParams.set('status', 'planned');

// 3. Extract your final modified relative path
// Combining pathname (the path) and search (the parameters)
const modifiedRelativePath = url.pathname + url.search;

console.log(modifiedRelativePath); 
*/
export function hasQueryParam(url, paramName) {
  const parsedURL = new URL(url, window.location.origin);
  return (parsedURL.searchParams.has(paramName));
}
export function updateQueryParam(url, paramName, paramValue) {
  const parsedURL = new URL(url, window.location.origin);
  parsedURL.searchParams.set(paramName, paramValue);
  return parsedURL.pathname + parsedURL.search;
}
export function addQueryParam(url, paramName, paramValue) {
  const parsedURL = new URL(url, window.location.origin);
  parsedURL.searchParams.append(paramName, paramValue);
  return parsedURL.pathname + parsedURL.search;
}
export function persistQueryParameter(url, paramName, paramValue) {
  if (hasQueryParams(url)) {
    if (hasQueryParam(url, paramName)) {
      return updateQueryParam(url, paramName, paramValue);
    } else {
      return addQueryParam(url, paramName, paramValue);
    }
  } else {
    return `${url}?${paramName}=${paramValue}`;
  }
}

export function getQueryParam(paramName, fallback = null) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(paramName) || fallback;
}

export function getWeekForParameter(weekParameter, siteData) {
  const namedOffset = Object.values(siteData.weekNamedOffsets)
    .find(item => item.param === weekParameter);
  const offset = namedOffset ? namedOffset.offset : Number.parseInt(weekParameter, 10);
  return siteData.getWeekByOffset(Number.isNaN(offset) ? 0 : offset);
}

export function getWeekDays(week) {
  return Object.values(week.days.toJSON().collection);
}

export function toMondayDate(date = new Date()) {
  const monday = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const distanceFromMonday = (monday.getUTCDay() + 6) % 7;
  monday.setUTCDate(monday.getUTCDate() - distanceFromMonday);
  return monday.toISOString().slice(0, 10);
}

export function addWeeks(date, offset) {
  const [year, month, day] = date.split('-').map(Number);
  const monday = new Date(Date.UTC(year, month - 1, day));
  monday.setUTCDate(monday.getUTCDate() + offset * 7);
  return monday.toISOString().slice(0, 10);
}

export function parseDate(date) {
  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) {
    throw new TypeError('weekStartDate must be a valid date in YYYY-MM-DD format');
  }
  return parsed;
}

export function getWeekOffset(weekStartDate, referenceDate = toMondayDate()) {
  return Math.round((Date.parse(`${weekStartDate}T00:00:00.000Z`) -
    Date.parse(`${referenceDate}T00:00:00.000Z`)) / 604800000);
}

export function getWeekName(weekStartDate, weekAliasOffsets) {
  const offset = getWeekOffset(weekStartDate);
  const namedOffset = Object.entries(weekAliasOffsets).find(([, value]) => value === offset);
  if (namedOffset) {
    return namedOffset[0];
  }
  return offset < 0 ? `week ${offset}` : `week +${offset}`;
}

export function createDefaultMeals(MealClass, MealsClass, mealTypes) {
  const meals = new MealsClass();
  mealTypes.forEach(([id, name]) => {
    meals.addMeal(new MealClass({
      id,
      name
    }));
  });
  return meals;
}

export function ensureWeekDays(days, DayClass, weekDays) {
  weekDays.forEach(([id, name]) => {
    if (!days.getDayByID(id) && !days.getDayByName(name)) {
      days.addDay(new DayClass({
        id,
        name
      }));
    }
  });
  return days;
}

export async function loadPartial(selector, url) {
  const mountPoint = document.querySelector(selector);
  const response = await fetch(url);

  if (!mountPoint || !response.ok) {
    throw new Error(`Unable to load site partial: ${url}`);
  }

  mountPoint.outerHTML = await response.text();
}
