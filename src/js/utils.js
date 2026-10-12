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

export async function loadPartial(selector, url) {
  const mountPoint = document.querySelector(selector);
  const response = await fetch(url);

  if (!mountPoint || !response.ok) {
    throw new Error(`Unable to load site partial: ${url}`);
  }

  mountPoint.outerHTML = await response.text();
}
