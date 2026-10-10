import {
  siteData
} from './modules/site-data.js'

export async function appendRecipeOriginFlag(nameElement, recipe, returnTo = window.location.href) {
  const originName = recipe?.Country || recipe?.Area;
  if (!nameElement || !originName) {
    return;
  }

  const country = await siteData.resolveCountryByName(originName);
  if (!country) {
    return;
  }

  const returnURL = new URL(returnTo, window.location.origin);
  if (returnURL.origin !== window.location.origin) {
    throw new Error('Recipe origin links must return to a page on this site');
  }
  const countryURL = new URL('/Country/', window.location.origin);
  countryURL.searchParams.set('country', country.ID);
  countryURL.searchParams.set('returnTo', `${returnURL.pathname}${returnURL.search}${returnURL.hash}`);

  const group = document.createElement(nameElement.tagName === 'H1' ? 'div' : 'span');
  group.className = nameElement.tagName === 'H1' ?
    'recipe-origin-group recipe-detail-title-group' :
    'recipe-origin-group';
  nameElement.before(group);
  group.append(nameElement);

  const flagLink = document.createElement('a');
  flagLink.className = 'recipe-origin-flag-link';
  flagLink.href = `${countryURL.pathname}${countryURL.search}`;
  flagLink.setAttribute('aria-label', `View ${country.Name || originName} country information`);
  flagLink.title = `View ${country.Name || originName} country information`;

  if (country.FlagURL) {
    const image = document.createElement('img');
    image.className = 'recipe-origin-flag';
    image.src = country.FlagURL;
    image.alt = `${country.Name || originName} flag`;
    image.addEventListener('error', () => {
      if (country.FlagEmoji) {
        const fallback = document.createElement('span');
        fallback.className = 'recipe-origin-flag-emoji';
        fallback.setAttribute('role', 'img');
        fallback.setAttribute('aria-label', `${country.Name || originName} flag`);
        fallback.textContent = country.FlagEmoji;
        image.replaceWith(fallback);
      } else {
        flagLink.remove();
      }
    }, {
      once: true
    });
    flagLink.append(image);
  } else if (country.FlagEmoji) {
    const emoji = document.createElement('span');
    emoji.className = 'recipe-origin-flag-emoji';
    emoji.setAttribute('role', 'img');
    emoji.setAttribute('aria-label', `${country.Name || originName} flag`);
    emoji.textContent = country.FlagEmoji;
    flagLink.append(emoji);
  } else {
    return;
  }

  group.append(flagLink);
}
