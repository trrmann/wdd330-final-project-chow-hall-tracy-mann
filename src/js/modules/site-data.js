import {
  APIs
} from './apis.js'
import {
  Countries
} from './countries.js'
import {
  Recipes
} from './recipes.js'
import {
  Word,
  Words
} from './words.js'
import {
  Weeks
} from './days.js'
import {
  Storage
} from './storage.js'

export class SiteData {
  #apis;
  #storage;
  #countries;
  #weeks;
  #recipes;
  #words;
  #currencyConversionTest;
  #initialization;
  #wordResolutionTask;
  #wordResolutionRequested;
  constructor() {
    this.#apis = new APIs();
    this.#storage = new Storage();
    this.#countries = new Countries();
    this.#weeks = new Weeks();
    this.#recipes = new Recipes();
    this.#words = new Words();
    this.#wordResolutionTask = null;
    this.#wordResolutionRequested = false;
  };
  get countries() {
    return this.#countries;
  };
  get weeks() {
    return this.#weeks;
  };
  get recipes() {
    return this.#recipes;
  };
  get words() {
    return this.#words;
  };
  toJSON() {
    return {
      countries: this.#countries.toJSON(),
      recipes: this.#recipes.toJSON(),
      words: this.#words.toJSON(),
      weeks: this.#weeks.toJSON(),
      currencyConversionTest: this.#currencyConversionTest
    };
  };
  initialize() {
    if (!this.#initialization) {
      this.#initialization = this.#initialize();
    }
    return this.#initialization;
  };
  async #initialize() {
    this.#countries = this.#storage.hasKey('countries', false) ?
      Countries.fromJSON(this.#storage.objectRead('countries', false)) :
      new Countries();
    const storedWeeks = this.#storage.hasKey('weeks', false) ?
      this.#storage.objectRead('weeks', false) :
      {};
    this.#weeks = storedWeeks.collection ?
      Weeks.fromJSON(storedWeeks) :
      new Weeks();
    this.#recipes = this.#storage.hasKey('recipes', false) ?
      Recipes.fromJSON(this.#storage.objectRead('recipes', false)) :
      new Recipes();
    this.#words = this.#storage.hasKey('words', false) ?
      Words.fromJSON(this.#storage.objectRead('words', false)) :
      new Words();
    for (let offset = -3; offset <= 3; offset += 1) {
      this.#weeks.getWeekByOffset(offset);
    }
    this.#restoreLegacyRecipes();

    this.#restoreWeekRecipes(storedWeeks);
    if (Object.keys(this.#recipes.toJSON().collection).length === 0) {
      const randomMeal = await this.#apis.RandomMeal();
      await this.importMealDBRecipes(randomMeal);
    }
    this.#scheduleRecipeWordResolution();

    const meals = Object.values(this.#recipes.toJSON().collection).map(recipe => ({
        strArea: recipe.Area,
        strCountry: recipe.Country
      }));
    await this.importMealDBMeals(meals);
    this.#currencyConversionTest = await this.#apis.convertCurrency('USD', 'PEN', 100);
    this.#storage.objectWrite('recipes', this.#recipes, false);
    this.#storage.objectWrite('weeks', this.#weeks, false);
    console.log('Site data initialized:', JSON.parse(JSON.stringify(this)));
    return this;
  };
  async #resolveRecipeWords() {
    const pendingWords = new Map();
    const recipeWords = new Map();
    Object.values(this.#recipes.toJSON().collection).forEach(recipe => {
      const words = String(recipe.Instructions || '').match(/[\p{L}]+(?:['’][\p{L}]+)*/gu) || [];
      const normalizedWords = [...new Set(words.map(word => word.normalize('NFC').toLocaleLowerCase()))];
      recipeWords.set(recipe, normalizedWords);
      normalizedWords.forEach(word => {
        if (!this.#words.getWordByWord(word)) {
          pendingWords.set(word, word);
        }
      });
    });
    await Promise.all([...pendingWords.values()].map(async word => {
      try {
        const entry = await this.#apis.lookupDictionaryEntryByString(word);
        this.#words.addWord(new Word({
          word,
          entry
        }));
        this.#storage.objectWrite('words', this.#words, false);
      } catch (error) {
        console.warn(`Dictionary lookup failed for "${word}":`, error);
      }
    }));
    recipeWords.forEach((words, recipe) => {
      recipe.WordIDs = words
        .map(word => this.#words.getWordByWord(word)?.ID)
        .filter(wordID => wordID !== undefined);
    });
    this.#storage.objectWrite('words', this.#words, false);
    this.#storage.objectWrite('recipes', this.#recipes, false);
  };
  #scheduleRecipeWordResolution() {
    this.#wordResolutionRequested = true;
    if (!this.#wordResolutionTask) {
      this.#wordResolutionTask = (async () => {
        while (this.#wordResolutionRequested) {
          this.#wordResolutionRequested = false;
          await this.#resolveRecipeWords();
        }
      })().catch(error => {
        console.error('Recipe word resolution failed:', error);
      }).finally(() => {
        this.#wordResolutionTask = null;
        if (this.#wordResolutionRequested) {
          this.#scheduleRecipeWordResolution();
        }
      });
    }
    return this.#wordResolutionTask;
  };
  #restoreLegacyRecipes() {
    if (!this.#storage.hasKey('recipes', true)) {
      return;
    }
    const legacyRecipes = Recipes.fromJSON(this.#storage.objectRead('recipes', true));
    Object.values(legacyRecipes.toJSON().collection).forEach(recipe => {
      const existingRecipe = this.#recipes.getRecipeByID(recipe.ID);
      if (existingRecipe) {
        this.#recipes.updateRecipe(recipe);
      } else {
        this.#recipes.addRecipe(recipe);
      }
    });
  };
  #restoreWeekRecipes(storedWeeks) {
    Object.values(storedWeeks.collection || {}).forEach(weekData => {
      const legacyRecipes = Recipes.fromJSON(weekData.recipes || {});
      Object.values(legacyRecipes.toJSON().collection).forEach(recipe => {
        const existingRecipe = this.#recipes.getRecipeByID(recipe.ID);
        if (existingRecipe) {
          this.#recipes.updateRecipe(recipe);
        } else {
          this.#recipes.addRecipe(recipe);
        }
      });
    });
  };
  getRecipeByID(id) {
    return this.#recipes.getRecipeByID(id);
  };
  getWordByID(id) {
    return this.#words.getWordByID(id);
  };
  async importMealDBRecipes(mealDBResponse) {
    this.#recipes = Recipes.importMealsDBJSON(this.#recipes, mealDBResponse);
    this.#scheduleRecipeWordResolution();
    return this.#recipes;
  };
  getWeekByName(name) {
    return this.#weeks.getWeekByName(name);
  };
  getWeekByOffset(offset) {
    const week = this.#weeks.getWeekByOffset(offset);
    this.#storage.objectWrite('weeks', this.#weeks, false);
    return week;
  };
  async importMealDBMeals(meals) {
    const result = await this.#apis.importMealCountries(meals, this.#countries);
    this.#countries = result.countries;
    this.#storage.objectWrite('countries', this.#countries, false);
    if (result.unmatchedCountries.length) {
      console.warn('MealsDB countries not matched by Rest Countries:', result.unmatchedCountries);
    }
    this.#storage.objectWrite('recipes', this.#recipes, false);
    this.#storage.objectWrite('weeks', this.#weeks, false);
    return this.#countries;
  };
};

export const siteData = new SiteData();
