function normalizeWord(value) {
  return typeof value === 'string' ? value.trim().normalize('NFC').toLocaleLowerCase() : '';
}

function objectOrEmpty(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function modelArray(value, Model) {
  return Array.isArray(value) ?
    value.map(item => item instanceof Model ? item : Model.fromJSON(item)) : [];
}

function stringArray(value) {
  return Array.isArray(value) ? value.filter(item => typeof item === 'string') : [];
}

export class Words {
  static fromJSON(json) {
    const instance = new Words();
    instance.#fromJSON(json);
    return instance;
  };
  #collection;
  #index;
  #rebuildIndex() {
    this.#index = this.#collection.reduce((index, word, id) => {
      const key = word ? normalizeWord(word.Word) : '';
      if (key) {
        index[key] = id;
      }
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
    if (json && Array.isArray(json.collection)) {
      this.#collection = json.collection.map((word, id) => {
        if (!word || typeof word !== 'object') {
          return null;
        }
        const restoredWord = Word.fromJSON(word);
        restoredWord.ID = id;
        return restoredWord;
      });
      this.#rebuildIndex();
    } else if (json && json.collection && typeof json.collection === 'object') {
      this.#collection = Object.values(json.collection).map((word, id) => {
        const restoredWord = Word.fromJSON(word);
        restoredWord.ID = id;
        return restoredWord;
      });
      this.#rebuildIndex();
    }
  };
  constructor() {
    this.#collection = [];
    this.#index = {};
  };
  toJSON() {
    return this.#toJSON();
  };
  getWordByID(id) {
    const wordID = Number(id);
    return Number.isSafeInteger(wordID) && wordID >= 0 ? this.#collection[wordID] || undefined : undefined;
  };
  getWordByWord(word) {
    return this.getWordByID(this.#index[normalizeWord(word)]);
  };
  addWord(word) {
    if (!(word instanceof Word)) {
      throw new TypeError('word must be a Word instance');
    }
    if (!normalizeWord(word.Word)) {
      throw new TypeError('word must have a word value');
    }
    const newID = this.#collection.length;
    if (word.ID !== null && word.ID !== newID) {
      throw new Error(`A new word must use the next array index "${newID}"`);
    }
    if (this.getWordByWord(word.Word)) {
      throw new Error(`The word "${word.Word}" already exists`);
    }
    word.ID = newID;
    this.#collection.push(word);
    this.#rebuildIndex();
    return word;
  };
  updateWord(word) {
    if (!(word instanceof Word)) {
      throw new TypeError('word must be a Word instance');
    }
    if (!Number.isSafeInteger(word.ID) || word.ID < 0 || !this.#collection[word.ID]) {
      throw new Error(`No word exists with ID "${word.ID}"`);
    }
    const existingWord = this.#collection[word.ID];
    const duplicateWord = this.getWordByWord(word.Word);
    if (duplicateWord && duplicateWord.ID !== existingWord.ID) {
      throw new Error(`The word "${word.Word}" already exists`);
    }
    this.#collection[word.ID] = word;
    this.#rebuildIndex();
    return word;
  };
  addOrUpdateWord(word) {
    const existingWord = word.ID === null ? this.getWordByWord(word.Word) : this.getWordByID(word.ID);
    if (existingWord && word.ID === null) {
      word.ID = existingWord.ID;
    }
    if (existingWord && word.ID !== existingWord.ID) {
      throw new Error(`The word "${word.Word}" already exists`);
    }
    return existingWord ?
      this.updateWord(word) :
      this.addWord(word);
  };
  removeWordByID(id) {
    const wordID = Number(id);
    if (!Number.isSafeInteger(wordID) || wordID < 0) {
      return undefined;
    }
    const word = this.#collection[wordID];
    if (word) {
      this.#collection[wordID] = null;
      this.#rebuildIndex();
    }
    return word;
  };
  clearAll() {
    this.#collection = [];
    this.#index = {};
  };
};

export class Word {
  static fromJSON(json) {
    const instance = new Word();
    instance.#fromJSON(json);
    return instance;
  };
  #word;
  #id;
  #entry;
  #toJSON() {
    return {
      id: this.#id,
      word: this.#word,
      entry: this.#entry
    };
  };
  #fromJSON(json) {
    if (json && typeof json.word === 'string') {
      this.#id = Number.isSafeInteger(json.id) && json.id >= 0 ? json.id : null;
      this.#word = json.word.trim();
      this.#entry = json.entry instanceof DictionaryWordEntry ?
        json.entry :
        json.entry ? DictionaryWordEntry.fromJSON(json.entry) : null;
    }
  };
  constructor({
    id = null,
    word = '',
    entry = null
  } = {}) {
    this.#id = Number.isSafeInteger(id) && id >= 0 ? id : null;
    this.#word = typeof word === 'string' ? word.trim() : '';
    this.#entry = entry instanceof DictionaryWordEntry ?
      entry :
      entry ? DictionaryWordEntry.fromJSON(entry) : null;
  };
  toJSON() {
    return this.#toJSON();
  };
  get ID() {
    return this.#id;
  };
  set ID(id) {
    if (!Number.isSafeInteger(id) || id < 0) {
      throw new TypeError('word ID must be a non-negative safe integer');
    }
    this.#id = id;
  };
  get Word() {
    return this.#word;
  };
  get Entry() {
    return this.#entry;
  };
  get HasDefinition() {
    return this.#entry !== null;
  };
};

export class DictionaryWordEntry {
  static fromJSON(json) {
    const value = objectOrEmpty(json);
    return new DictionaryWordEntry({
      word: value.word,
      entries: value.entries,
      source: value.source
    });
  };
  #word;
  #entries;
  #source;
  constructor({
    word = '',
    entries = [],
    source = null
  } = {}) {
    this.#word = typeof word === 'string' ? word : '';
    this.#entries = modelArray(entries, DictionaryEntry);
    this.#source = source ? DictionarySource.fromJSON(source) : null;
  };
  toJSON() {
    return {
      word: this.#word,
      entries: this.#entries,
      source: this.#source
    };
  };
  get Word() {
    return this.#word;
  };
  get Entries() {
    return [...this.#entries];
  };
  get Source() {
    return this.#source;
  };
};

export class DictionaryEntry {
  static fromJSON(json) {
    const value = objectOrEmpty(json);
    return new DictionaryEntry({
      language: value.language,
      partOfSpeech: value.partOfSpeech,
      pronunciations: value.pronunciations,
      forms: value.forms,
      senses: value.senses,
      synonyms: value.synonyms,
      antonyms: value.antonyms
    });
  };
  #language;
  #partOfSpeech;
  #pronunciations;
  #forms;
  #senses;
  #synonyms;
  #antonyms;
  constructor({
    language = null,
    partOfSpeech = '',
    pronunciations = [],
    forms = [],
    senses = [],
    synonyms = [],
    antonyms = []
  } = {}) {
    this.#language = language ? DictionaryLanguage.fromJSON(language) : null;
    this.#partOfSpeech = typeof partOfSpeech === 'string' ? partOfSpeech : '';
    this.#pronunciations = modelArray(pronunciations, DictionaryPronunciation);
    this.#forms = modelArray(forms, DictionaryForm);
    this.#senses = modelArray(senses, DictionarySense);
    this.#synonyms = stringArray(synonyms);
    this.#antonyms = stringArray(antonyms);
  };
  toJSON() {
    return {
      language: this.#language,
      partOfSpeech: this.#partOfSpeech,
      pronunciations: this.#pronunciations,
      forms: this.#forms,
      senses: this.#senses,
      synonyms: this.#synonyms,
      antonyms: this.#antonyms
    };
  };
  get Language() {
    return this.#language;
  };
  get PartOfSpeech() {
    return this.#partOfSpeech;
  };
  get Pronunciations() {
    return [...this.#pronunciations];
  };
  get Forms() {
    return [...this.#forms];
  };
  get Senses() {
    return [...this.#senses];
  };
  get Synonyms() {
    return [...this.#synonyms];
  };
  get Antonyms() {
    return [...this.#antonyms];
  };
};

export class DictionaryLanguage {
  static fromJSON(json) {
    const value = objectOrEmpty(json);
    return new DictionaryLanguage(value);
  };
  #code;
  #name;
  constructor({
    code = '',
    name = ''
  } = {}) {
    this.#code = typeof code === 'string' ? code : '';
    this.#name = typeof name === 'string' ? name : '';
  };
  toJSON() {
    return {
      code: this.#code,
      name: this.#name
    };
  };
  get Code() {
    return this.#code;
  };
  get Name() {
    return this.#name;
  };
};

export class DictionaryPronunciation {
  static fromJSON(json) {
    const value = objectOrEmpty(json);
    return new DictionaryPronunciation(value);
  };
  #type;
  #text;
  #tags;
  constructor({
    type = '',
    text = '',
    tags = []
  } = {}) {
    this.#type = typeof type === 'string' ? type : '';
    this.#text = typeof text === 'string' ? text : '';
    this.#tags = stringArray(tags);
  };
  toJSON() {
    return {
      type: this.#type,
      text: this.#text,
      tags: this.#tags
    };
  };
  get Type() {
    return this.#type;
  };
  get Text() {
    return this.#text;
  };
  get Tags() {
    return [...this.#tags];
  };
};

export class DictionaryForm {
  static fromJSON(json) {
    const value = objectOrEmpty(json);
    return new DictionaryForm(value);
  };
  #word;
  #tags;
  constructor({
    word = '',
    tags = []
  } = {}) {
    this.#word = typeof word === 'string' ? word : '';
    this.#tags = stringArray(tags);
  };
  toJSON() {
    return {
      word: this.#word,
      tags: this.#tags
    };
  };
  get Word() {
    return this.#word;
  };
  get Tags() {
    return [...this.#tags];
  };
};

export class DictionarySense {
  static fromJSON(json) {
    const value = objectOrEmpty(json);
    return new DictionarySense(value);
  };
  #definition;
  #tags;
  #examples;
  #quotes;
  #synonyms;
  #antonyms;
  #translations;
  #subsenses;
  constructor({
    definition = '',
    tags = [],
    examples = [],
    quotes = [],
    synonyms = [],
    antonyms = [],
    translations = [],
    subsenses = []
  } = {}) {
    this.#definition = typeof definition === 'string' ? definition : '';
    this.#tags = stringArray(tags);
    this.#examples = stringArray(examples);
    this.#quotes = modelArray(quotes, DictionaryQuote);
    this.#synonyms = stringArray(synonyms);
    this.#antonyms = stringArray(antonyms);
    this.#translations = modelArray(translations, DictionaryTranslation);
    this.#subsenses = modelArray(subsenses, DictionarySense);
  };
  toJSON() {
    return {
      definition: this.#definition,
      tags: this.#tags,
      examples: this.#examples,
      quotes: this.#quotes,
      synonyms: this.#synonyms,
      antonyms: this.#antonyms,
      translations: this.#translations,
      subsenses: this.#subsenses
    };
  };
  get Definition() {
    return this.#definition;
  };
  get Tags() {
    return [...this.#tags];
  };
  get Examples() {
    return [...this.#examples];
  };
  get Quotes() {
    return [...this.#quotes];
  };
  get Synonyms() {
    return [...this.#synonyms];
  };
  get Antonyms() {
    return [...this.#antonyms];
  };
  get Translations() {
    return [...this.#translations];
  };
  get Subsenses() {
    return [...this.#subsenses];
  };
};

export class DictionaryQuote {
  static fromJSON(json) {
    const value = objectOrEmpty(json);
    return new DictionaryQuote(value);
  };
  #text;
  #reference;
  constructor({
    text = '',
    reference = ''
  } = {}) {
    this.#text = typeof text === 'string' ? text : '';
    this.#reference = typeof reference === 'string' ? reference : '';
  };
  toJSON() {
    return {
      text: this.#text,
      reference: this.#reference
    };
  };
  get Text() {
    return this.#text;
  };
  get Reference() {
    return this.#reference;
  };
};

export class DictionaryTranslation {
  static fromJSON(json) {
    const value = objectOrEmpty(json);
    return new DictionaryTranslation(value);
  };
  #language;
  #word;
  constructor({
    language = null,
    word = ''
  } = {}) {
    this.#language = language ? DictionaryLanguage.fromJSON(language) : null;
    this.#word = typeof word === 'string' ? word : '';
  };
  toJSON() {
    return {
      language: this.#language,
      word: this.#word
    };
  };
  get Language() {
    return this.#language;
  };
  get Word() {
    return this.#word;
  };
};

export class DictionarySource {
  static fromJSON(json) {
    const value = objectOrEmpty(json);
    return new DictionarySource(value);
  };
  #url;
  #license;
  constructor({
    url = '',
    license = null
  } = {}) {
    this.#url = typeof url === 'string' ? url : '';
    this.#license = license ? DictionaryLicense.fromJSON(license) : null;
  };
  toJSON() {
    return {
      url: this.#url,
      license: this.#license
    };
  };
  get URL() {
    return this.#url;
  };
  get License() {
    return this.#license;
  };
};

export class DictionaryLicense {
  static fromJSON(json) {
    const value = objectOrEmpty(json);
    return new DictionaryLicense(value);
  };
  #name;
  #url;
  constructor({
    name = '',
    url = ''
  } = {}) {
    this.#name = typeof name === 'string' ? name : '';
    this.#url = typeof url === 'string' ? url : '';
  };
  toJSON() {
    return {
      name: this.#name,
      url: this.#url
    };
  };
  get Name() {
    return this.#name;
  };
  get URL() {
    return this.#url;
  };
};
