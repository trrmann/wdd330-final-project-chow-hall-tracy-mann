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
  #currencyConversionTest;
  #initialization;
  constructor() {
    this.#apis = new APIs();
    this.#storage = new Storage();
    this.#countries = new Countries();
    this.#weeks = new Weeks();
    this.#recipes = new Recipes();
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
  toJSON() {
    return {
      countries: this.#countries.toJSON(),
      recipes: this.#recipes.toJSON(),
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
    for (let offset = -3; offset <= 3; offset += 1) {
      this.#weeks.getWeekByOffset(offset);
    }
    this.#restoreLegacyRecipes();

    this.#restoreWeekRecipes(storedWeeks);
    if (Object.keys(this.#recipes.toJSON().collection).length === 0) {
      const randomMeal = await this.#apis.RandomMeal();
      this.#recipes = Recipes.importMealsDBJSON(this.#recipes, randomMeal);
    }

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
