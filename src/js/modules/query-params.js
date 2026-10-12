/** Helpers for reading and building URL query parameters. */
export class QueryParams {
  static hasAny(url) {
    const parsedURL = new URL(url, window.location.origin);
    return parsedURL.searchParams.size > 0;
  };
  static has(url, paramName) {
    const parsedURL = new URL(url, window.location.origin);
    return parsedURL.searchParams.has(paramName);
  };
  static update(url, paramName, paramValue) {
    const parsedURL = new URL(url, window.location.origin);
    parsedURL.searchParams.set(paramName, paramValue);
    return parsedURL.pathname + parsedURL.search;
  };
  static add(url, paramName, paramValue) {
    const parsedURL = new URL(url, window.location.origin);
    parsedURL.searchParams.append(paramName, paramValue);
    return parsedURL.pathname + parsedURL.search;
  };
  static persist(url, paramName, paramValue) {
    if (!QueryParams.hasAny(url)) {
      return `${url}?${paramName}=${paramValue}`;
    }
    return QueryParams.has(url, paramName) ?
      QueryParams.update(url, paramName, paramValue) :
      QueryParams.add(url, paramName, paramValue);
  };
  static get(paramName, fallback = null) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(paramName) || fallback;
  };
};
