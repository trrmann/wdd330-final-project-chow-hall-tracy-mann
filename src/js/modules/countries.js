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
  removeMockCountries() {
    Object.values(this.#collection).forEach(country => {
      if (country.toJSON().isMockData === true) {
        this.removeCountryByID(country.ID);
      }
    });
  };
  clearAll() {
    this.#collection = {};
    this.#index = {};
  };
};

export class Country {
  static propertyNames = [
    'names',
    'codes',
    'capitals',
    'tlds',
    'flag',
    'region',
    'subregion',
    'area',
    'borders',
    'calling_codes',
    'currencies',
    'languages',
    'leaders',
    'memberships',
    'population',
    'timezones',
    'continents',
    'uuid',
    'cars',
    'classification',
    'coordinates',
    'date',
    'demonyms',
    'economy',
    'government_type',
    'landlocked',
    'links',
    'number_format',
    'parent',
    'postal_code',
    'independent',
    'status',
    'un_member',
    'idd',
    'maps',
    'gini',
    'fifa',
    'flags',
    'coat_of_arms',
    'start_of_week',
    'capital_info'
  ];
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
  #properties;
  #additionalData;
  #areas;
  #toJSON() {
    return {
      ...this.#properties,
      ...this.#additionalData,
      areas: this.#areas
    };
  };
  #fromJSON(json) {
    const countryData = json && json.data ? json.data : json;
    this.#setCountryData(countryData);
    this.#areas = Array.isArray(json?.areas) ? [...new Set(json.areas.filter(area => typeof area === 'string' && area.trim()).map(area => area.trim()))] : [];
  };
  #setCountryData(data) {
    const source = data && typeof data === 'object' && !Array.isArray(data) ? data : {};
    this.#properties = Country.propertyNames.reduce((properties, key) => {
      properties[key] = source[key] ?? null;
      return properties;
    }, {});
    this.#additionalData = Object.keys(source).reduce((additional, key) => {
      if (key !== 'areas' && !Country.propertyNames.includes(key)) {
        additional[key] = source[key];
      }
      return additional;
    }, {});
  };
  constructor({
    data = {},
    areas = []
  } = {}) {
    this.#setCountryData(data);
    this.#areas = [...new Set(areas.filter(area => typeof area === 'string' && area.trim()).map(area => area.trim()))];
  };
  toJSON() {
    return this.#toJSON();
  };
  get ID() {
    return this.#properties.codes?.alpha_3 || this.#additionalData.cca3 || null;
  };
  get Name() {
    return this.#properties.names?.common || this.#additionalData.name?.common || null;
  };
  get Alpha2Code() {
    return this.#properties.codes?.alpha_2 || this.#additionalData.cca2 || null;
  };
  get Names() {
    return this.#properties.names ?? this.#additionalData.name ?? null;
  };
  get Codes() {
    return this.#properties.codes ?? null;
  };
  get Capitals() {
    return this.#properties.capitals ?? this.#additionalData.capital ?? null;
  };
  get TLDs() {
    return this.#properties.tlds ?? this.#additionalData.tld ?? null;
  };
  get Flag() {
    return this.#properties.flag ?? null;
  };
  get Region() {
    return this.#properties.region ?? null;
  };
  get Subregion() {
    return this.#properties.subregion ?? null;
  };
  get Area() {
    return this.#properties.area ?? null;
  };
  get Borders() {
    return this.#properties.borders ?? null;
  };
  get CallingCodes() {
    return this.#properties.calling_codes ?? this.#additionalData.idd ?? null;
  };
  get Currencies() {
    return this.#properties.currencies ?? null;
  };
  get Languages() {
    return this.#properties.languages ?? null;
  };
  get Leaders() {
    return this.#properties.leaders ?? null;
  };
  get Memberships() {
    return this.#properties.memberships ?? null;
  };
  get Population() {
    return this.#properties.population ?? null;
  };
  get Timezones() {
    return this.#properties.timezones ?? this.#additionalData.timezones ?? null;
  };
  get Continents() {
    return this.#properties.continents ?? this.#additionalData.continents ?? null;
  };
  get UUID() {
    return this.#properties.uuid ?? null;
  };
  get Cars() {
    return this.#properties.cars ?? null;
  };
  get Classification() {
    return this.#properties.classification ?? null;
  };
  get Coordinates() {
    return this.#properties.coordinates ?? null;
  };
  get Date() {
    return this.#properties.date ?? null;
  };
  get Demonyms() {
    return this.#properties.demonyms ?? null;
  };
  get Economy() {
    return this.#properties.economy ?? null;
  };
  get GovernmentType() {
    return this.#properties.government_type ?? null;
  };
  get Landlocked() {
    return this.#properties.landlocked ?? null;
  };
  get Links() {
    return this.#properties.links ?? null;
  };
  get NumberFormat() {
    return this.#properties.number_format ?? null;
  };
  get Parent() {
    return this.#properties.parent ?? null;
  };
  get PostalCode() {
    return this.#properties.postal_code ?? null;
  };
  get Independent() {
    return this.#properties.independent ?? null;
  };
  get Status() {
    return this.#properties.status ?? null;
  };
  get UNMember() {
    return this.#properties.un_member ?? null;
  };
  get Idd() {
    return this.#properties.idd ?? null;
  };
  get Maps() {
    return this.#properties.maps ?? null;
  };
  get Gini() {
    return this.#properties.gini ?? null;
  };
  get FIFA() {
    return this.#properties.fifa ?? null;
  };
  get Flags() {
    return this.#properties.flags ?? null;
  };
  get CoatOfArms() {
    return this.#properties.coat_of_arms ?? null;
  };
  get StartOfWeek() {
    return this.#properties.start_of_week ?? null;
  };
  get CapitalInfo() {
    return this.#properties.capital_info ?? null;
  };
  get AdditionalData() {
    return {
      ...this.#additionalData
    };
  };
  get Areas() {
    return [...this.#areas];
  };
  addArea(area) {
    if (typeof area === 'string' && area.trim() && !this.#areas.includes(area.trim())) {
      this.#areas.push(area.trim());
    }
    return this;
  };
};
