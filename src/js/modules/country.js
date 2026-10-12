import {
  siteData
} from './site-data.js'

export class CountryPage {
  #params;
  #country;
  #page;

  constructor() {
    this.#params = new URLSearchParams(window.location.search);
    this.#country = siteData.countries.getCountryByID(this.#params.get('country'));
  };

  render() {
    const app = document.getElementById('app');
    const template = document.getElementById('country-page-template');
    this.#page = template.content.cloneNode(true);
    if (this.#country) {
      this.#renderCountry();
    } else {
      this.#page.querySelector('.country-detail-title').textContent = 'Country unavailable';
      this.#page.querySelector('.country-detail-message').textContent =
        'Country information could not be found.';
    }
    this.#page.querySelector('.country-detail-acknowledge')
      .addEventListener('click', () => this.#returnToCaller());
    app.replaceChildren(this.#page);
  };

  #renderCountry() {
    const country = this.#country;
    const page = this.#page;
    const title = page.querySelector('.country-detail-title');
    title.textContent = country.Name || 'Country';
    this.#renderFlag(title);

    const facts = page.querySelector('.country-detail-facts');
    CountryPage.#addFact(facts, 'Official name', country.Names?.official);
    CountryPage.#addFact(facts, 'Region', country.Region);
    CountryPage.#addFact(facts, 'Subregion', country.Subregion);
    CountryPage.#addFact(facts, 'Capital', CountryPage.#listValues(country.Capitals));
    CountryPage.#addFact(facts, 'Continent', CountryPage.#listValues(country.Continents));
    CountryPage.#addFact(facts, 'Population', Number.isFinite(country.Population) ?
      country.Population.toLocaleString() :
      country.Population);
    CountryPage.#addFact(facts, 'Currencies', CountryPage.#formatNamedEntries(country.Currencies));
    CountryPage.#addFact(facts, 'Languages', CountryPage.#formatNamedEntries(country.Languages));
    CountryPage.#addFact(facts, 'Recipe areas', CountryPage.#listValues(country.Areas));
  };

  #renderFlag(title) {
    const country = this.#country;
    const flag = country.FlagURL;
    const image = this.#page.querySelector('.country-detail-flag');
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
  };

  static #addFact(list, label, value) {
    if (value === null || value === undefined || value === '') {
      return;
    }
    const term = document.createElement('dt');
    term.textContent = label;
    const detail = document.createElement('dd');
    detail.textContent = String(value);
    list.append(term, detail);
  };

  static #listValues(value) {
    if (Array.isArray(value)) {
      return value.map(item => typeof item === 'string' ? item : item?.name)
        .filter(Boolean)
        .join(', ');
    }
    return typeof value === 'string' ? value : '';
  };

  static #formatNamedEntries(value) {
    if (!value || typeof value !== 'object') {
      return '';
    }
    return Object.values(value).map(item => {
      if (typeof item === 'string') {
        return item;
      }
      return [item?.name, item?.symbol ? `(${item.symbol})` : ''].filter(Boolean).join(' ');
    }).filter(Boolean).join(', ');
  };

  #returnToCaller() {
    const returnTo = this.#params.get('returnTo');
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
  };
}
