const countryFixtures = [
  ['Argentina', 'ARG', 'AR', 'Buenos Aires', 'Americas', 'South America', 'ARS', 'Argentine peso', '$', '🇦🇷', 'Spanish'],
  ['Australia', 'AUS', 'AU', 'Canberra', 'Oceania', 'Australia and New Zealand', 'AUD', 'Australian dollar', '$', '🇦🇺', 'English'],
  ['Austria', 'AUT', 'AT', 'Vienna', 'Europe', 'Central Europe', 'EUR', 'Euro', '€', '🇦🇹', 'German'],
  ['Belgium', 'BEL', 'BE', 'Brussels', 'Europe', 'Western Europe', 'EUR', 'Euro', '€', '🇧🇪', 'Dutch'],
  ['Brazil', 'BRA', 'BR', 'Brasília', 'Americas', 'South America', 'BRL', 'Brazilian real', 'R$', '🇧🇷', 'Portuguese'],
  ['Canada', 'CAN', 'CA', 'Ottawa', 'Americas', 'North America', 'CAD', 'Canadian dollar', '$', '🇨🇦', 'English'],
  ['China', 'CHN', 'CN', 'Beijing', 'Asia', 'Eastern Asia', 'CNY', 'Chinese yuan', '¥', '🇨🇳', 'Chinese'],
  ['Croatia', 'HRV', 'HR', 'Zagreb', 'Europe', 'Southeast Europe', 'EUR', 'Euro', '€', '🇭🇷', 'Croatian'],
  ['Egypt', 'EGY', 'EG', 'Cairo', 'Africa', 'Northern Africa', 'EGP', 'Egyptian pound', '£', '🇪🇬', 'Arabic'],
  ['France', 'FRA', 'FR', 'Paris', 'Europe', 'Western Europe', 'EUR', 'Euro', '€', '🇫🇷', 'French'],
  ['Germany', 'DEU', 'DE', 'Berlin', 'Europe', 'Central Europe', 'EUR', 'Euro', '€', '🇩🇪', 'German'],
  ['Greece', 'GRC', 'GR', 'Athens', 'Europe', 'Southeast Europe', 'EUR', 'Euro', '€', '🇬🇷', 'Greek'],
  ['India', 'IND', 'IN', 'New Delhi', 'Asia', 'Southern Asia', 'INR', 'Indian rupee', '₹', '🇮🇳', 'Hindi'],
  ['Indonesia', 'IDN', 'ID', 'Jakarta', 'Asia', 'Southeast Asia', 'IDR', 'Indonesian rupiah', 'Rp', '🇮🇩', 'Indonesian'],
  ['Ireland', 'IRL', 'IE', 'Dublin', 'Europe', 'Northern Europe', 'EUR', 'Euro', '€', '🇮🇪', 'Irish'],
  ['Italy', 'ITA', 'IT', 'Rome', 'Europe', 'Southern Europe', 'EUR', 'Euro', '€', '🇮🇹', 'Italian'],
  ['Jamaica', 'JAM', 'JM', 'Kingston', 'Americas', 'Caribbean', 'JMD', 'Jamaican dollar', '$', '🇯🇲', 'English'],
  ['Japan', 'JPN', 'JP', 'Tokyo', 'Asia', 'Eastern Asia', 'JPY', 'Japanese yen', '¥', '🇯🇵', 'Japanese'],
  ['Kenya', 'KEN', 'KE', 'Nairobi', 'Africa', 'Eastern Africa', 'KES', 'Kenyan shilling', 'Sh', '🇰🇪', 'Swahili'],
  ['Malaysia', 'MYS', 'MY', 'Kuala Lumpur', 'Asia', 'Southeast Asia', 'MYR', 'Malaysian ringgit', 'RM', '🇲🇾', 'Malay'],
  ['Mexico', 'MEX', 'MX', 'Mexico City', 'Americas', 'North America', 'MXN', 'Mexican peso', '$', '🇲🇽', 'Spanish'],
  ['Morocco', 'MAR', 'MA', 'Rabat', 'Africa', 'Northern Africa', 'MAD', 'Moroccan dirham', 'د.م.', '🇲🇦', 'Arabic'],
  ['Netherlands', 'NLD', 'NL', 'Amsterdam', 'Europe', 'Western Europe', 'EUR', 'Euro', '€', '🇳🇱', 'Dutch'],
  ['New Zealand', 'NZL', 'NZ', 'Wellington', 'Oceania', 'Australia and New Zealand', 'NZD', 'New Zealand dollar', '$', '🇳🇿', 'English'],
  ['Nigeria', 'NGA', 'NG', 'Abuja', 'Africa', 'Western Africa', 'NGN', 'Nigerian naira', '₦', '🇳🇬', 'English'],
  ['Peru', 'PER', 'PE', 'Lima', 'Americas', 'South America', 'PEN', 'Peruvian sol', 'S/', '🇵🇪', 'Spanish'],
  ['Philippines', 'PHL', 'PH', 'Manila', 'Asia', 'Southeast Asia', 'PHP', 'Philippine peso', '₱', '🇵🇭', 'Filipino'],
  ['Poland', 'POL', 'PL', 'Warsaw', 'Europe', 'Central Europe', 'PLN', 'Polish złoty', 'zł', '🇵🇱', 'Polish'],
  ['Portugal', 'PRT', 'PT', 'Lisbon', 'Europe', 'Southern Europe', 'EUR', 'Euro', '€', '🇵🇹', 'Portuguese'],
  ['Russia', 'RUS', 'RU', 'Moscow', 'Europe', 'Eastern Europe', 'RUB', 'Russian ruble', '₽', '🇷🇺', 'Russian'],
  ['Singapore', 'SGP', 'SG', 'Singapore', 'Asia', 'Southeast Asia', 'SGD', 'Singapore dollar', '$', '🇸🇬', 'English'],
  ['South Africa', 'ZAF', 'ZA', 'Pretoria', 'Africa', 'Southern Africa', 'ZAR', 'South African rand', 'R', '🇿🇦', 'Zulu'],
  ['South Korea', 'KOR', 'KR', 'Seoul', 'Asia', 'Eastern Asia', 'KRW', 'South Korean won', '₩', '🇰🇷', 'Korean'],
  ['Spain', 'ESP', 'ES', 'Madrid', 'Europe', 'Southern Europe', 'EUR', 'Euro', '€', '🇪🇸', 'Spanish'],
  ['Sweden', 'SWE', 'SE', 'Stockholm', 'Europe', 'Northern Europe', 'SEK', 'Swedish krona', 'kr', '🇸🇪', 'Swedish'],
  ['Switzerland', 'CHE', 'CH', 'Bern', 'Europe', 'Central Europe', 'CHF', 'Swiss franc', 'CHF', '🇨🇭', 'German'],
  ['Thailand', 'THA', 'TH', 'Bangkok', 'Asia', 'Southeast Asia', 'THB', 'Thai baht', '฿', '🇹🇭', 'Thai'],
  ['Tunisia', 'TUN', 'TN', 'Tunis', 'Africa', 'Northern Africa', 'TND', 'Tunisian dinar', 'د.ت', '🇹🇳', 'Arabic'],
  ['Turkey', 'TUR', 'TR', 'Ankara', 'Asia', 'Western Asia', 'TRY', 'Turkish lira', '₺', '🇹🇷', 'Turkish'],
  ['Ukraine', 'UKR', 'UA', 'Kyiv', 'Europe', 'Eastern Europe', 'UAH', 'Ukrainian hryvnia', '₴', '🇺🇦', 'Ukrainian'],
  ['United Kingdom', 'GBR', 'GB', 'London', 'Europe', 'Northern Europe', 'GBP', 'British pound', '£', '🇬🇧', 'English'],
  ['United States', 'USA', 'US', 'Washington, D.C.', 'Americas', 'North America', 'USD', 'United States dollar', '$', '🇺🇸', 'English'],
  ['Vietnam', 'VNM', 'VN', 'Hanoi', 'Asia', 'Southeast Asia', 'VND', 'Vietnamese đồng', '₫', '🇻🇳', 'Vietnamese']
];

const currencyRatesToUSD = {
  ARS: 0.001,
  AUD: 0.66,
  CHF: 1.12,
  CLP: 0.001,
  COP: 0.00025,
  CZK: 0.044,
  DKK: 0.145,
  EGP: 0.020,
  HKD: 0.128,
  IDR: 0.000064,
  ILS: 0.27,
  JMD: 0.0064,
  KES: 0.0077,
  MAD: 0.10,
  MYR: 0.22,
  NGN: 0.00065,
  NOK: 0.094,
  NZD: 0.61,
  PHP: 0.018,
  PLN: 0.25,
  RUB: 0.011,
  SAR: 0.27,
  SEK: 0.094,
  SGD: 0.74,
  THB: 0.028,
  TND: 0.32,
  TRY: 0.031,
  UAH: 0.024,
  VND: 0.000039,
  ZAR: 0.055,
  BRL: 0.20,
  CAD: 0.74,
  CNY: 0.14,
  EUR: 1.08,
  GBP: 1.27,
  INR: 0.012,
  JPY: 0.0067,
  KRW: 0.00074,
  MXN: 0.059,
  PEN: 0.27,
  USD: 1
};

function createCountry(fixture) {
  const [common, alpha3, alpha2, capital, region, subregion, currencyCode, currencyName, symbol, flag, language] = fixture;
  const official = common === 'United States' ?
    'United States of America' :
    common === 'United Kingdom' ?
    'United Kingdom of Great Britain and Northern Ireland' :
    common;
  const flagCodePoints = [...alpha2].map(character =>
    (0x1F1E6 + character.charCodeAt(0) - 65).toString(16).toUpperCase()
  );
  const continent = region === 'Americas' ?
    (subregion === 'South America' ? 'South America' : 'North America') :
    region;
  return {
    isMockData: true,
    names: {
      common,
      official,
      native: {
        [language]: {
          common,
          official
        }
      }
    },
    codes: {
      alpha_2: alpha2,
      alpha_3: alpha3
    },
    capitals: [capital],
    tlds: [`.${alpha2.toLocaleLowerCase()}`],
    flag: {
      emoji: flag,
      unicode: flagCodePoints.map(codePoint => `U+${codePoint}`).join(' '),
      html_entity: flagCodePoints.map(codePoint => `&#x${codePoint};`).join(''),
      url_png: `https://flagcdn.com/w320/${alpha2.toLocaleLowerCase()}.png`,
      url_svg: `https://flagcdn.com/${alpha2.toLocaleLowerCase()}.svg`
    },
    region,
    subregion,
    continents: [continent],
    area: {
      miles: 0
    },
    timezones: ['UTC'],
    population: 0,
    languages: {
      [language.slice(0, 3).toLocaleLowerCase()]: language
    },
    currencies: {
      [currencyCode]: {
        name: currencyName,
        symbol
      }
    },
    calling_codes: [],
    classification: {
      sovereign: true,
      un_member: true,
      un_observer: false
    },
    government_type: null,
    leaders: [],
    links: {
      google_maps: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(common)}`
    },
    altSpellings: common === 'United States' ? ['US', 'USA', 'United States of America'] : common === 'United Kingdom' ? ['UK', 'Great Britain', 'Britain'] : common === 'South Korea' ? ['Korea', 'Republic of Korea'] : [alpha2, alpha3]
  };
}

export const mockCountries = countryFixtures.map(createCountry);

export function createMockCountryForName(name) {
  const common = String(name).trim();
  const mockCode = `MOCK-${encodeURIComponent(common.toLocaleLowerCase())}`;
  return {
    isMockData: true,
    names: {
      common,
      official: `${common} (mock)`,
      native: {}
    },
    codes: {
      alpha_2: mockCode,
      alpha_3: mockCode
    },
    capitals: [],
    tlds: [],
    flag: {
      emoji: '🏳️',
      unicode: 'U+1F3F3',
      html_entity: '&#x1F3F3;',
      url_png: 'https://flagcdn.com/w320/un.png',
      url_svg: 'https://flagcdn.com/un.svg'
    },
    region: 'Mock data',
    subregion: 'Mock data',
    continents: ['Mock data'],
    area: {
      miles: 0
    },
    timezones: ['UTC'],
    population: 0,
    languages: {},
    currencies: {},
    calling_codes: [],
    classification: {
      sovereign: false,
      un_member: false,
      un_observer: false
    },
    government_type: null,
    leaders: [],
    links: {
      google_maps: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(common)}`
    },
    altSpellings: []
  };
}

export function searchMockCountries(query, limit = 25) {
  const searchTerm = String(query).trim().toLocaleLowerCase();
  const matches = searchTerm ?
    mockCountries.filter(country => [
      country.names.common,
      country.names.official,
      country.codes.alpha_2,
      country.codes.alpha_3,
      ...country.altSpellings,
      ...Object.values(country.names.native).flatMap(names => Object.values(names))
    ].some(name => name.toLocaleLowerCase().includes(searchTerm))) :
    mockCountries;
  return matches.slice(0, limit).map(country => structuredClone(country));
}

export function convertMockCurrency(from, to, amount) {
  const fromCode = String(from).trim().toUpperCase();
  const toCode = String(to).trim().toUpperCase();
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) {
    throw new TypeError('Mock currency conversion amount must be a finite number');
  }
  const fromRate = currencyRatesToUSD[fromCode] ?? 1;
  const toRate = currencyRatesToUSD[toCode] ?? 1;
  const rate = fromRate / toRate;
  return {
    isMockData: true,
    query: {
      from: fromCode,
      to: toCode,
      amount: numericAmount
    },
    info: {
      rate
    },
    result: numericAmount * rate
  };
}

export function getMockCurrencySymbols() {
  return {
    isMockData: true,
    ...Object.fromEntries(
      countryFixtures.map(([, , , , , , currencyCode, , symbol]) => [currencyCode, symbol])
    )
  };
}
