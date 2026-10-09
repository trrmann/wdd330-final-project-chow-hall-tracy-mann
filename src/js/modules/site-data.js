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
import {
  APIRequestQueue
} from './api-request-queue.js'
import {
  QuantifiedIngredients
} from './ingredients.js'
import {
  createApiConfiguration
} from '../utils.js'

const legacyDefaultRecipeIDs = new Set([
  'Eggs',
  'Omlette',
  'Fried Chicken',
  'Rice'
]);

export class SiteData {
  static weekDays = [
    ['Mon', 'Monday'],
    ['Tue', 'Tuesday'],
    ['Wed', 'Wednesday'],
    ['Thu', 'Thursday'],
    ['Fri', 'Friday'],
    ['Sat', 'Saturday'],
    ['Sun', 'Sunday']
  ];
  static mealTypes = [
    ['breakfast', 'Breakfast'],
    ['brunch', 'Brunch'],
    ['lunch', 'Lunch'],
    ['dinner', 'Dinner'],
    ['midnightMeal', 'Midnight Meal']
  ];
  static supportedRateLimitIntervals = [
    'second',
    'minute',
    'hour',
    'day',
    'week',
    'month',
    'year'
  ];
  static apiConfigurationDefaults = {
    intervalMilliseconds: {
      second: 1000,
      minute: 60 * 1000,
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000
    },
    priorities: {
      recipe: 0,
      country: 1,
      word: 2
    },
    providers: {
      themealdb: {
        priority: 'recipe',
        rateLimitEnvironmentVariable: 'VITE_MEALDB_RATE_LIMITS',
        defaultRateLimits: [{
          requests: 1,
          interval: 'second'
        }],
        baseURLEnvironmentVariable: 'VITE_MEALDB_BASE_URL',
        defaultBaseURL: 'https://www.themealdb.com/',
        usageStorageKey: 'TheMealDB-API-Request-Usage'
      },
      'rest-countries': {
        priority: 'country',
        rateLimitEnvironmentVariable: 'VITE_REST_COUNTRIES_RATE_LIMITS',
        defaultRateLimits: [{
          requests: 1,
          interval: 'second'
        }, {
          requests: 1000,
          interval: 'month'
        }],
        baseURLEnvironmentVariable: 'VITE_REST_COUNTRIES_BASE_URL',
        defaultBaseURL: 'https://api.restcountries.com/',
        usageStorageKey: 'RestCountries-API-Throttle-Usage'
      },
      dictionary: {
        priority: 'word',
        rateLimitEnvironmentVariable: 'VITE_DICTIONARY_RATE_LIMITS',
        defaultRateLimits: [{
          requests: 1,
          interval: 'second'
        }, {
          requests: 1000,
          interval: 'hour'
        }],
        baseURLEnvironmentVariable: 'VITE_DICTIONARY_BASE_URL',
        defaultBaseURL: 'https://freedictionaryapi.com/',
        usageStorageKey: 'Dictionary-API-Request-Usage'
      }
    }
  };
  static shellMenuItems = [{
      href: '/MealPlan/',
      dataNavPage: "meals",
      display: 'Meals',
      class: 'site-nav-link'
    },
    {
      href: '/Inventory/',
      dataNavPage: "inventory",
      display: 'Inventory',
      class: 'site-nav-link'
    },
    {
      href: '/Shopping/',
      dataNavPage: "shopping",
      display: 'Shopping',
      class: 'site-nav-link'
    },
    {
      href: '/Search/',
      dataNavPage: "search",
      display: 'Search',
      class: 'site-nav-link special-menu-item'
    }
  ];
  static weekNamedOffsets = {
    min: {
      param: "min",
      name: "Minimum",
      offset: -3,
      resetHidden: false,
      isOffset: true,
      allowNextWeek: true,
      allowPreviousWeek: false,
      onDashboard: false,
      nextDashboardKey: "current",
      dashboardDisplay: "Other Week",
      dashboardTitle: "Click to change to the current week!"
    },
    last: {
      param: "last",
      name: "Last",
      offset: -1,
      resetHidden: false,
      isOffset: true,
      allowNextWeek: true,
      allowPreviousWeek: true,
      onDashboard: true,
      nextDashboardKey: "current",
      dashboardDisplay: "Last Week",
      dashboardTitle: "Click to change to the current week!"
    },
    current: {
      param: "current",
      name: "Current",
      offset: 0,
      resetHidden: true,
      isOffset: false,
      allowNextWeek: true,
      allowPreviousWeek: true,
      onDashboard: true,
      nextDashboardKey: "next",
      dashboardDisplay: "This Week",
      dashboardTitle: "Click to change to next week!"
    },
    next: {
      param: "next",
      name: "Next",
      offset: 1,
      resetHidden: false,
      isOffset: true,
      allowNextWeek: true,
      allowPreviousWeek: true,
      onDashboard: true,
      nextDashboardKey: "last",
      dashboardDisplay: "Next Week",
      dashboardTitle: "Click to change to last week!"
    },
    max: {
      param: "max",
      name: "Maximum",
      offset: 3,
      resetHidden: false,
      isOffset: true,
      allowNextWeek: false,
      allowPreviousWeek: true,
      onDashboard: false,
      nextDashboardKey: "current",
      dashboardDisplay: "Other Week",
      dashboardTitle: "Click to change to the current week!"
    }
  };
  #apis;
  #storage;
  #countries;
  #weeks;
  #recipes;
  #words;
  #inventory;
  #shoppingList;
  #weekConfiguration;
  #apiConfiguration;
  #currencyConversionTest;
  #initialization;
  #wordResolutionTask;
  #wordResolutionRequested;
  constructor() {
    this.#apiConfiguration = createApiConfiguration(
      SiteData.apiConfigurationDefaults,
      SiteData.supportedRateLimitIntervals
    );
    APIRequestQueue.configure(this.#apiConfiguration);
    this.#apis = new APIs();
    this.#storage = new Storage();
    this.#countries = new Countries();
    this.#weekConfiguration = {
      weekAliasOffsets: Object.fromEntries(
        Object.entries(SiteData.weekNamedOffsets).map(([name, configuration]) => [name, configuration.offset])
      ),
      weekDays: SiteData.weekDays,
      mealTypes: SiteData.mealTypes
    };
    Weeks.configure(this.#weekConfiguration);
    this.#weeks = new Weeks();
    this.#recipes = new Recipes();
    this.#words = new Words();
    this.#inventory = new QuantifiedIngredients();
    this.#shoppingList = new QuantifiedIngredients();
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
  get inventory() {
    return this.#inventory;
  };
  get shoppingList() {
    return this.#shoppingList;
  };
  get weekNamedOffsets() {
    return SiteData.weekNamedOffsets;
  };
  get apiConfiguration() {
    return this.#apiConfiguration;
  };
  toJSON() {
    return {
      countries: this.#countries.toJSON(),
      recipes: this.#recipes.toJSON(),
      words: this.#words.toJSON(),
      weeks: this.#weeks.toJSON(),
      inventory: this.#inventory.toJSON(),
      shoppingList: this.#shoppingList.toJSON(),
      weekNamedOffsets: SiteData.weekNamedOffsets,
      weekConfiguration: this.#weekConfiguration,
      apiConfiguration: this.#apiConfiguration,
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
    if (this.#storage.hasKey('countries', false)) {
      this.#countries = Countries.fromJSON(this.#storage.objectRead('countries', false));
    }
    const storedWeeks = this.#storage.hasKey('weeks', false) ?
      this.#storage.objectRead('weeks', false) : {};
    if (storedWeeks.collection) {
      this.#weeks = Weeks.fromJSON(storedWeeks);
    }
    if (this.#storage.hasKey('recipes', false)) {
      this.#recipes = Recipes.fromJSON(this.#storage.objectRead('recipes', false));
    }
    if (this.#storage.hasKey('words', false)) {
      this.#words = Words.fromJSON(this.#storage.objectRead('words', false));
    }
    this.#normalizeWeekRange();
    this.#restoreRecipes(storedWeeks);
    this.#removeLegacyDefaultRecipeReferences();
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
    console.log('Site data initialized:', JSON.parse(JSON.stringify(this)));
    return this;
  };
  #normalizeWeekRange() {
    const minOffset = SiteData.weekNamedOffsets.min.offset;
    const maxOffset = SiteData.weekNamedOffsets.max.offset;
    if (!Number.isInteger(minOffset) || !Number.isInteger(maxOffset) || minOffset > maxOffset) {
      throw new RangeError('Minimum and maximum week offsets must be valid ordered integers');
    }
    const referenceDate = Weeks.getMondayDate();
    const minWeekStart = this.#weeks.getWeekByOffset(minOffset, referenceDate).weekStartDate;
    const maxWeekStart = this.#weeks.getWeekByOffset(maxOffset, referenceDate).weekStartDate;
    Object.keys(this.#weeks.toJSON().collection).forEach(weekStartDate => {
      if (weekStartDate < minWeekStart || weekStartDate > maxWeekStart) {
        this.#weeks.removeWeekByID(weekStartDate);
      }
    });
    for (let offset = minOffset; offset <= maxOffset; offset += 1) {
      this.#weeks.getWeekByOffset(offset, referenceDate);
    }
    this.#storage.objectWrite('weeks', this.#weeks, false);
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
  #restoreRecipes(storedWeeks) {
    const recipeData = [];
    if (this.#storage.hasKey('recipes', true)) {
      recipeData.push(this.#storage.objectRead('recipes', true));
    }
    Object.values(storedWeeks.collection || {}).forEach(weekData => {
      recipeData.push(weekData.recipes || {});
    });
    recipeData.forEach(data => {
      const restoredRecipes = Recipes.fromJSON(data);
      Object.values(restoredRecipes.toJSON().collection).forEach(recipe => {
        const existingRecipe = this.#recipes.getRecipeByID(recipe.ID);
        if (existingRecipe) {
          this.#recipes.updateRecipe(recipe);
        } else {
          this.#recipes.addRecipe(recipe);
        }
      });
    });
  };
  #removeLegacyDefaultRecipeReferences() {
    if (this.#storage.read('mealPlanDefaultsVersion', false) !== '2') {
      return;
    }
    let changed = false;
    Object.values(this.#weeks.toJSON().collection).forEach(week => {
      Object.values(week.days.toJSON().collection).forEach(day => {
        const meals = Object.values(day.meals.toJSON().collection);
        let removedFromDay = false;
        meals.forEach(meal => {
          meal.recipeIDs.forEach(recipeID => {
            if (legacyDefaultRecipeIDs.has(recipeID)) {
              meal.removeRecipeByID(recipeID);
              changed = true;
              removedFromDay = true;
            }
          });
        });
        if (removedFromDay && meals.every(meal => meal.recipeIDs.length === 0)) {
          day.status = 'empty';
        }
      });
    });
    if (changed) {
      this.#storage.objectWrite('weeks', this.#weeks, false);
    }
    this.#storage.remove('mealPlanDefaultsVersion', false);
  };
  async importMealDBRecipes(mealDBResponse) {
    this.#recipes = Recipes.importMealsDBJSON(this.#recipes, mealDBResponse);
    this.#scheduleRecipeWordResolution();
    return this.#recipes;
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
