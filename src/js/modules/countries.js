function normalizeCountryKey(value) {
  return typeof value === 'string' ? value.trim().toLocaleLowerCase() : '';
}

export class Countries {
  static fromJSON(json) {
    const instance = new Countries();
    instance.#fromJSON(json);
    return instance;
  };
  #collection;
  #index;
  #rebuildIndex() {
    this.#index = Object.values(this.#collection).reduce((index, country) => {
      [
        country.Name,
        country.Alpha2Code,
        ...country.Areas
      ].forEach(value => {
        const key = normalizeCountryKey(value);
        if (key) {
          index[key] = country.ID;
        }
      });
      return index;
    }, {});
  };
  #toJSON() {
    return {
      collection: this.#collection,
      index: this.#index
    };
  };
  #fromJSON(json) {
    if (json && json.collection) {
      this.#collection = Object.keys(json.collection).reduce((collection, key) => {
        collection[key] = Country.fromJSON(json.collection[key]);
        return collection;
      }, {});
      this.#rebuildIndex();
    }
  };
  constructor() {
    this.#collection = {};
    this.#index = {};
  };
  toJSON() {
    return this.#toJSON();
  };
  getCountryByID(id) {
    return this.#collection[id];
  };
  getCountryByName(name) {
    return this.#collection[this.#index[normalizeCountryKey(name)]];
  };
  getCountryByArea(area) {
    return this.getCountryByName(area);
  };
  addCountry(country) {
    if (!(country instanceof Country)) {
      throw new TypeError('country must be a Country instance');
    }
    if (!country.ID) {
      throw new TypeError('country must have an alpha-3 code');
    }
    if (Object.prototype.hasOwnProperty.call(this.#collection, country.ID)) {
      throw new Error(`A country with ID "${country.ID}" already exists`);
    }
    this.#collection[country.ID] = country;
    this.#rebuildIndex();
    return country;
  };
  updateCountry(country) {
    if (!(country instanceof Country)) {
      throw new TypeError('country must be a Country instance');
    }
    if (!country.ID || !Object.prototype.hasOwnProperty.call(this.#collection, country.ID)) {
      throw new Error(`No country exists with ID "${country.ID}"`);
    }
    this.#collection[country.ID] = country;
    this.#rebuildIndex();
    return country;
  };
  addOrUpdateCountry(country) {
    return Object.prototype.hasOwnProperty.call(this.#collection, country.ID) ?
      this.updateCountry(country) :
      this.addCountry(country);
  };
  removeCountryByID(id) {
    const country = this.#collection[id];
    if (country) {
      delete this.#collection[id];
      this.#rebuildIndex();
    }
    return country;
  };
  clearAll() {
    this.#collection = {};
    this.#index = {};
  };
};

export class Country {
  static fromJSON(json) {
    const instance = new Country();
    instance.#fromJSON(json);
    return instance;
  };
  static fromRestCountriesJSON(data, areas = []) {
    return new Country({
      data,
      areas
    });
  };
  #data;
  #areas;
  #getValue(...paths) {
    for (const path of paths) {
      const value = path.split('.').reduce((current, key) => current?.[key], this.#data);
      if (value !== undefined && value !== null) {
        return value;
      }
    }
    return null;
  };
  #toJSON() {
    return {
      data: this.#data,
      areas: this.#areas
    };
  };
  #fromJSON(json) {
    if (json && json.data) {
      this.#data = json.data;
      this.#areas = Array.isArray(json.areas) ? [...json.areas] : [];
    }
  };
  constructor({
    data = {},
    areas = []
  } = {}) {
    this.#data = data;
    this.#areas = [...new Set(areas.filter(area => typeof area === 'string' && area.trim()))];
  };
  toJSON() {
    return this.#toJSON();
  };
  get ID() {
    return this.#getValue('codes.alpha_3', 'cca3');
  };
  get Name() {
    return this.#getValue('names.common', 'name.common');
  };
  get Alpha2Code() {
    return this.#getValue('codes.alpha_2', 'cca2');
  };
  get Areas() {
    return [...this.#areas];
  };
  get Data() {
    return this.#data;
  };
  addArea(area) {
    if (typeof area === 'string' && area.trim() && !this.#areas.includes(area.trim())) {
      this.#areas.push(area.trim());
    }
    return this;
  };
};
