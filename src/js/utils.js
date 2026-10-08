export function hasQueryParams(url) {
  const parsedURL = new URL(url, window.location.origin);
  return (parsedURL.searchParams.size > 0);
}
export function logCurrentState(message) {
  console.log(message);
}
export async function fetchRequest(request, header = null) {
  try {
    let response = null;
    if (header === null) {
      response = await fetch(request);

    } else {
      response = await fetch(request, header);
    }
    if (!response.ok) throw new Error('Network response failure');
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(`Failed request:  ${request}`);
    console.error("Fetch Error:", error);
    return {};
  }
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
