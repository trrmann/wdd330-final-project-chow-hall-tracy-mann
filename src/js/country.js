import '../css/core.css'
import '../css/mobile.css'
import '../css/tablet.css'
import '../css/laptop.css'
import '../css/desktop.css'
import {
  loadSiteShell
} from './site-shell.js'
import {
  siteData
} from './modules/site-data.js'

await loadSiteShell('country');
const app = document.getElementById('app');
const template = document.getElementById('country-page-template');
const page = template.content.cloneNode(true);
const params = new URLSearchParams(window.location.search);
const country = siteData.countries.getCountryByID(params.get('country'));

if (!country) {
  page.querySelector('.country-detail-title').textContent = 'Country unavailable';
  page.querySelector('.country-detail-message').textContent =
    'Country information could not be found.';
} else {
  const title = page.querySelector('.country-detail-title');
  title.textContent = country.Name || 'Country';
  const flag = country.FlagURL;
  const image = page.querySelector('.country-detail-flag');
  let flagEmoji;
  if (country.FlagEmoji) {
    flagEmoji = document.createElement('span');
    flagEmoji.className = 'country-detail-flag-emoji';
    flagEmoji.setAttribute('role', 'img');
    flagEmoji.setAttribute('aria-label', `${country.Name || 'Country'} flag`);
    flagEmoji.hidden = Boolean(flag);
    flagEmoji.textContent = country.FlagEmoji;
    title.append(flagEmoji);
  }
  if (typeof flag === 'string' && flag) {
    image.src = flag;
    image.alt = `${country.Name || 'Country'} flag`;
    image.hidden = false;
    image.addEventListener('load', () => {
      if (flagEmoji) {
        flagEmoji.hidden = true;
      }
    }, {
      once: true
    });
    image.addEventListener('error', () => {
      image.hidden = true;
      if (flagEmoji) {
        flagEmoji.hidden = false;
      }
    }, {
      once: true
    });
  }

  const facts = page.querySelector('.country-detail-facts');
  addFact(facts, 'Official name', country.Names?.official);
  addFact(facts, 'Region', country.Region);
  addFact(facts, 'Subregion', country.Subregion);
  addFact(facts, 'Capital', listValues(country.Capitals));
  addFact(facts, 'Continent', listValues(country.Continents));
  addFact(facts, 'Population', Number.isFinite(country.Population) ?
    country.Population.toLocaleString() :
    country.Population);
  addFact(facts, 'Currencies', formatNamedEntries(country.Currencies));
  addFact(facts, 'Languages', formatNamedEntries(country.Languages));
  addFact(facts, 'Recipe areas', listValues(country.Areas));
}

page.querySelector('.country-detail-acknowledge').addEventListener('click', returnToCaller);
app.replaceChildren(page);

function addFact(list, label, value) {
  if (value === null || value === undefined || value === '') {
    return;
  }
  const term = document.createElement('dt');
  term.textContent = label;
  const detail = document.createElement('dd');
  detail.textContent = String(value);
  list.append(term, detail);
}

function listValues(value) {
  if (Array.isArray(value)) {
    return value.map(item => typeof item === 'string' ? item : item?.name)
      .filter(Boolean)
      .join(', ');
  }
  return typeof value === 'string' ? value : '';
}

function formatNamedEntries(value) {
  if (!value || typeof value !== 'object') {
    return '';
  }
  return Object.values(value).map(item => {
    if (typeof item === 'string') {
      return item;
    }
    return [item?.name, item?.symbol ? `(${item.symbol})` : ''].filter(Boolean).join(' ');
  }).filter(Boolean).join(', ');
}

function returnToCaller() {
  const returnTo = params.get('returnTo');
  let returnURL;
  if (returnTo) {
    const requestedURL = new URL(returnTo, window.location.origin);
    if (requestedURL.origin === window.location.origin) {
      returnURL = requestedURL.href;
    }
  }
  if (!returnURL && document.referrer) {
    const referrer = new URL(document.referrer);
    if (referrer.origin === window.location.origin) {
      returnURL = referrer.href;
    }
  }
  window.location.assign(returnURL || new URL('/', window.location.origin).href);
}
