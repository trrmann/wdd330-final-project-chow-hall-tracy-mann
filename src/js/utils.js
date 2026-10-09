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

export async function loadPartial(selector, url) {
  const mountPoint = document.querySelector(selector);
  const response = await fetch(url);

  if (!mountPoint || !response.ok) {
    throw new Error(`Unable to load site partial: ${url}`);
  }

  mountPoint.outerHTML = await response.text();
}
