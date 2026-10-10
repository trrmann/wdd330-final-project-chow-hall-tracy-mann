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
  Meal
} from './meals.js'
import {
  Storage
} from './storage.js'
import {
  APIRequestQueue
} from './api-request-queue.js'
import {
  QuantifiedIngredient,
  QuantifiedIngredients
} from './ingredients.js'
import {
  createApiConfiguration,
  getWeekForParameter,
  getWeekOffset,
  parseDate,
  toMondayDate
} from '../utils.js'

const legacyDefaultRecipeIDs = new Set([
  'Eggs',
  'Omlette',
  'Fried Chicken',
  'Rice'
]);
const unitDefinitions = {
  tsp: {
    category: 'volume',
    factor: 4.92892,
    unit: 'ml'
  },
  teaspoon: {
    category: 'volume',
    factor: 4.92892,
    unit: 'ml'
  },
  teaspoons: {
    category: 'volume',
    factor: 4.92892,
    unit: 'ml'
  },
  tbsp: {
    category: 'volume',
    factor: 14.7868,
    unit: 'ml'
  },
  tablespoon: {
    category: 'volume',
    factor: 14.7868,
    unit: 'ml'
  },
  tablespoons: {
    category: 'volume',
    factor: 14.7868,
    unit: 'ml'
  },
  cup: {
    category: 'volume',
    factor: 236.588,
    unit: 'ml'
  },
  cups: {
    category: 'volume',
    factor: 236.588,
    unit: 'ml'
  },
  ml: {
    category: 'volume',
    factor: 1,
    unit: 'ml'
  },
  milliliter: {
    category: 'volume',
    factor: 1,
    unit: 'ml'
  },
  milliliters: {
    category: 'volume',
    factor: 1,
    unit: 'ml'
  },
  l: {
    category: 'volume',
    factor: 1000,
    unit: 'ml'
  },
  liter: {
    category: 'volume',
    factor: 1000,
    unit: 'ml'
  },
  liters: {
    category: 'volume',
    factor: 1000,
    unit: 'ml'
  },
  g: {
    category: 'weight',
    factor: 1,
    unit: 'g'
  },
  gram: {
    category: 'weight',
    factor: 1,
    unit: 'g'
  },
  grams: {
    category: 'weight',
    factor: 1,
    unit: 'g'
  },
  kg: {
    category: 'weight',
    factor: 1000,
    unit: 'g'
  },
  kilogram: {
    category: 'weight',
    factor: 1000,
    unit: 'g'
  },
  kilograms: {
    category: 'weight',
    factor: 1000,
    unit: 'g'
  },
  oz: {
    category: 'weight',
    factor: 28.3495,
    unit: 'g'
  },
  ounce: {
    category: 'weight',
    factor: 28.3495,
    unit: 'g'
  },
  ounces: {
    category: 'weight',
    factor: 28.3495,
    unit: 'g'
  },
  lb: {
    category: 'weight',
    factor: 453.592,
    unit: 'g'
  },
  lbs: {
    category: 'weight',
    factor: 453.592,
    unit: 'g'
  },
  pound: {
    category: 'weight',
    factor: 453.592,
    unit: 'g'
  },
  pounds: {
    category: 'weight',
    factor: 453.592,
    unit: 'g'
  },
  each: {
    category: 'count',
    factor: 1,
    unit: 'each'
  },
  piece: {
    category: 'count',
    factor: 1,
    unit: 'each'
  },
  pieces: {
    category: 'count',
    factor: 1,
    unit: 'each'
  },
  clove: {
    category: 'clove',
    factor: 1,
    unit: 'clove'
  },
  cloves: {
    category: 'clove',
    factor: 1,
    unit: 'clove'
  }
};
const normalizeIngredientName = name => name.trim().normalize('NFC').toLocaleLowerCase();
const normalizeUnitName = unit => unit.trim().toLocaleLowerCase().replace(/[.,]/g, '');
const parseFraction = value => {
  const mixed = value.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) {
    return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  }
  const fraction = value.match(/^(\d+)\/(\d+)$/);
  return fraction ? Number(fraction[1]) / Number(fraction[2]) : Number(value);
};
const normalizeUnit = unit => {
  const normalized = normalizeUnitName(unit);
  return unitDefinitions[normalized] || {
    category: `custom:${normalized || 'each'}`,
    factor: 1,
    unit: normalized || 'each'
  };
};

export class SiteData {
  static recipeSuggestionConfiguration = {
    commonCount: 4,
    maximumAttemptsPerSuggestion: 3
  };
  static recipeSuggestionsStorageKey = 'recipeSuggestions';
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
  #ingredientUnitConversions;
  #weekConfiguration;
  #apiConfiguration;
  #currencyConversionTest;
  #initialization;
  #weekRecipeSuggestions;
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
    this.#ingredientUnitConversions = [];
    this.#weekRecipeSuggestions = {};
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
      ingredientUnitConversions: this.#ingredientUnitConversions,
      weekRecipeSuggestions: this.#weekRecipeSuggestions,
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
    if (!this.#apis.isUsingMockRestCountriesData) {
      this.#countries.removeMockCountries();
    }
    const storedWeeks = this.#storage.hasKey('weeks', false) ?
      this.#storage.objectRead('weeks', false) : {};
    if (storedWeeks.collection) {
      this.#weeks = Weeks.fromJSON(storedWeeks);
    }
    if (this.#storage.hasKey('inventory', false)) {
      this.#inventory = QuantifiedIngredients.fromJSON(this.#storage.objectRead('inventory', false));
    }
    if (this.#storage.hasKey('shoppingList', false)) {
      this.#shoppingList = QuantifiedIngredients.fromJSON(this.#storage.objectRead('shoppingList', false));
    }
    if (this.#storage.hasKey('ingredientUnitConversions', false)) {
      const savedConversions = this.#storage.objectRead('ingredientUnitConversions', false);
      this.#ingredientUnitConversions = Array.isArray(savedConversions) ? savedConversions : [];
    }
    if (this.#storage.hasKey('recipes', false)) {
      this.#recipes = Recipes.fromJSON(this.#storage.objectRead('recipes', false));
    }
    if (this.#storage.hasKey('words', false)) {
      this.#words = Words.fromJSON(this.#storage.objectRead('words', false));
    }
    if (this.#storage.hasKey(SiteData.recipeSuggestionsStorageKey, false)) {
      this.#weekRecipeSuggestions = this.#storage.objectRead(
        SiteData.recipeSuggestionsStorageKey,
        false
      ) || {};
    }
    this.#normalizeWeekRange();
    this.#restoreRecipes(storedWeeks);
    this.#removeLegacyDefaultRecipeReferences();

    const meals = Object.values(this.#recipes.toJSON().collection).map(recipe => ({
      strArea: recipe.Area,
      strCountry: recipe.Country
    }));
    await this.importMealDBMeals(meals);
    this.#currencyConversionTest = await this.#apis.convertCurrency('USD', 'PEN', 100);
    console.log('Site data initialized:', JSON.parse(JSON.stringify(this)));
    return this;
  };
  async getSuggestedRecipesForWeek(weekParameter) {
    const {
      commonCount,
      maximumAttemptsPerSuggestion
    } = SiteData.recipeSuggestionConfiguration;
    if (
      !Number.isSafeInteger(commonCount) ||
      !Number.isSafeInteger(maximumAttemptsPerSuggestion) ||
      commonCount < 1 ||
      maximumAttemptsPerSuggestion < 1
    ) {
      throw new RangeError('Recipe suggestion limits must be valid positive integers');
    }

    const week = getWeekForParameter(weekParameter, this);
    const weekStartDate = week.weekStartDate;
    const weekOffset = getWeekOffset(weekStartDate);
    const minOffset = SiteData.weekNamedOffsets.min.offset;
    const maxOffset = SiteData.weekNamedOffsets.max.offset;
    if (
      weekOffset < 0 ||
      weekOffset < minOffset ||
      weekOffset > maxOffset ||
      this.#isWeekFull(week)
    ) {
      return [];
    }

    let savedSuggestions = this.#weekRecipeSuggestions[weekStartDate];
    if (!savedSuggestions) {
      savedSuggestions = await this.#createWeekSuggestions(week);
      this.#weekRecipeSuggestions[weekStartDate] = savedSuggestions;
    }
    await this.#ensureActiveWeekSuggestions(week, savedSuggestions);
    this.#storage.objectWrite(
      SiteData.recipeSuggestionsStorageKey,
      this.#weekRecipeSuggestions,
      false
    );
    const dismissedIDs = new Set(savedSuggestions.dismissedRecipeIDs || []);
    const usedRecipeIDs = this.#getWeekRecipeIDs(week);
    const randomRecipeIDs = new Set(this.#getRandomSuggestionIDs(savedSuggestions));
    return savedSuggestions.recipeIDs
      .filter(recipeID =>
        !dismissedIDs.has(String(recipeID)) && !usedRecipeIDs.has(String(recipeID))
      )
      .map(recipeID => ({
        recipe: this.#recipes.getRecipeByID(recipeID),
        source: randomRecipeIDs.has(String(recipeID)) ? 'random' : 'common'
      }))
      .filter(suggestion => suggestion.recipe !== undefined);
  };
  assignRecipeToMeal(
    weekParameter,
    dayID,
    mealID,
    recipeID,
    recipeYield = 1,
    mealServings = 1,
    expectedServings = 1,
    replaceRecipeID = null
  ) {
    if (!Number.isFinite(recipeYield) || recipeYield <= 0) {
      throw new RangeError('Recipe yield must be greater than zero');
    }
    if (!Number.isSafeInteger(mealServings) || mealServings <= 0) {
      throw new RangeError('Meal servings to cover must be a positive whole number');
    }
    if (!Number.isSafeInteger(expectedServings) || expectedServings <= 0) {
      throw new RangeError('Expected meal servings must be a positive whole number');
    }
    const week = getWeekForParameter(weekParameter, this);
    const dayIndex = SiteData.weekDays.findIndex(([configuredDayID]) => configuredDayID === dayID);
    if (dayIndex < 0) {
      throw new TypeError('Choose a valid day and meal');
    }
    const dayDate = new Date(`${week.weekStartDate}T00:00:00`);
    dayDate.setDate(dayDate.getDate() + dayIndex);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dayDate < today) {
      throw new RangeError('Recipes cannot be assigned to a past day');
    }
    const recipe = this.#recipes.getRecipeByID(String(recipeID));
    if (!recipe) {
      throw new Error('The selected recipe is no longer available');
    }
    const day = week.days.getDayByID(dayID);
    const meal = day?.meals.getMealByID(mealID);
    if (!meal) {
      throw new Error('The selected meal slot is unavailable');
    }
    if (meal.isExecuted) {
      throw new Error('Executed meals are locked and cannot be changed');
    }
    if (replaceRecipeID !== null) {
      if (!meal.getRecipeWrapper(replaceRecipeID)) {
        throw new Error('The recipe selected for replacement is no longer in this meal');
      }
      if (String(replaceRecipeID) !== String(recipeID) && meal.getRecipeWrapper(recipeID)) {
        throw new Error('The replacement recipe is already in this meal');
      }
      meal.removeRecipeByID(replaceRecipeID);
    }
    meal.addRecipe(recipe, recipeYield, mealServings);
    meal.servingsRequired = expectedServings;
    day.status = 'planned';
    this.#storage.objectWrite('weeks', this.#weeks, false);
    return {
      day: day.Name,
      meal: meal.Name,
      recipe: recipe.Name,
      replacedRecipeID: replaceRecipeID,
      expectedServings,
      mealServings,
      recipeYield,
      ingredientMultiplier: mealServings / recipeYield,
      coverage: mealServings / expectedServings * 100
    };
  };
  #getEditableMeal(weekParameter, dayID, mealID) {
    const week = getWeekForParameter(weekParameter, this);
    const dayIndex = SiteData.weekDays.findIndex(([configuredDayID]) => configuredDayID === dayID);
    if (dayIndex < 0) {
      throw new TypeError('Choose a valid day and meal');
    }
    const dayDate = new Date(`${week.weekStartDate}T00:00:00`);
    dayDate.setDate(dayDate.getDate() + dayIndex);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dayDate < today) {
      throw new RangeError('Past days are read-only');
    }
    const day = week.days.getDayByID(dayID);
    const meal = day?.meals.getMealByID(mealID);
    if (!day || !meal) {
      throw new Error('The selected meal slot is unavailable');
    }
    if (meal.isExecuted) {
      throw new Error('Executed meals are locked and cannot be changed');
    }
    return {
      week,
      day,
      meal
    };
  };
  #getDayForDate(dateValue, allowPast = false) {
    if (typeof dateValue !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      throw new TypeError('Choose a valid date');
    }
    const date = parseDate(dateValue);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!allowPast && date < today) {
      throw new RangeError('Plans can only be copied to today or a future day');
    }
    const week = this.#weeks.getOrCreateWeek(toMondayDate(date));
    const dayID = SiteData.weekDays[(date.getDay() + 6) % 7][0];
    const day = week.days.getDayByID(dayID);
    if (!day) {
      throw new Error('The destination day is unavailable');
    }
    return {
      week,
      day,
      dayID
    };
  };
  getMealsForDate(dateValue) {
    const {
      day
    } = this.#getDayForDate(dateValue, true);
    return Object.values(day.meals.toJSON().collection)
      .map(meal => ({
        ID: meal.ID,
        Name: meal.Name
      }));
  };
  #validateRecipesAvailable(meals) {
    meals.forEach(meal => {
      meal.recipeWrappers.forEach(wrapper => {
        if (!this.#recipes.getRecipeByID(wrapper.recipeID)) {
          throw new Error(`Recipe "${wrapper.recipeID}" is no longer available`);
        }
      });
    });
  };
  #replaceMealContents(sourceMeal, destinationMeal) {
    if (destinationMeal.isExecuted) {
      throw new Error('An executed meal cannot be replaced');
    }
    const servingsRequired = sourceMeal.servingsRequired;
    const recipeWrappers = sourceMeal.recipeWrappers.map(wrapper => wrapper.toJSON());
    destinationMeal.clearRecipes();
    destinationMeal.servingsRequired = servingsRequired;
    recipeWrappers.forEach(wrapper => {
      const recipe = this.#recipes.getRecipeByID(wrapper.recipeID);
      destinationMeal.addRecipe(recipe, wrapper.servingsProduced, wrapper.servingsNeeded);
    });
  };
  #replaceDayContents(sourceDay, destinationDay) {
    if (Object.values(destinationDay.meals.toJSON().collection).some(meal => meal.isExecuted)) {
      throw new Error('A day containing an executed meal cannot be replaced');
    }
    destinationDay.clearMeals();
    Object.values(sourceDay.meals.toJSON().collection).forEach(sourceMeal => {
      const destinationMeal = destinationDay.addMeal(new Meal({
        id: sourceMeal.ID,
        name: sourceMeal.Name,
        servingsRequired: sourceMeal.servingsRequired
      }));
      sourceMeal.recipeWrappers.forEach(wrapper => {
        const recipe = this.#recipes.getRecipeByID(wrapper.recipeID);
        if (!recipe) {
          throw new Error(`Recipe "${wrapper.recipeID}" is no longer available`);
        }
        destinationMeal.addRecipe(recipe, wrapper.servingsProduced, wrapper.servingsNeeded);
      });
    });
  };
  #updateDayStatus(day) {
    day.status = Object.values(day.meals.toJSON().collection)
      .some(meal => meal.recipeIDs.length) ? 'planned' : 'empty';
  };
  #saveWeeks() {
    this.#storage.objectWrite('weeks', this.#weeks, false);
  };
  #saveInventory() {
    this.#storage.objectWrite('inventory', this.#inventory, false);
  };
  #saveShoppingList() {
    this.#storage.objectWrite('shoppingList', this.#shoppingList, false);
  };
  resolveRecipeIngredientAmount(recipeID, ingredientKey, quantity, unit) {
    if (typeof recipeID !== 'string' || !recipeID.trim()) {
      throw new TypeError('Choose a valid recipe');
    }
    const recipe = this.#recipes.getRecipeByID(recipeID);
    if (!recipe) {
      throw new Error('The recipe is no longer available');
    }
    const ingredient = recipe.QuantifiedIngredient.getIngredientByIndex(ingredientKey);
    if (!ingredient) {
      throw new Error('The recipe ingredient is no longer available');
    }
    ingredient.setAmount(quantity, unit);
    this.#storage.objectWrite('recipes', this.#recipes, false);
    return ingredient;
  };
  addMealToDay(weekParameter, dayID, name) {
    const week = getWeekForParameter(weekParameter, this);
    const dayIndex = SiteData.weekDays.findIndex(([configuredDayID]) => configuredDayID === dayID);
    if (dayIndex < 0) {
      throw new TypeError('Choose a valid day');
    }
    const dayDate = new Date(`${week.weekStartDate}T00:00:00`);
    dayDate.setDate(dayDate.getDate() + dayIndex);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dayDate < today) {
      throw new RangeError('Past days are read-only');
    }
    const day = week.days.getDayByID(dayID);
    if (!day || typeof name !== 'string' || !name.trim()) {
      throw new TypeError('Enter a meal name');
    }
    const cleanName = name.trim();
    if (Object.values(day.meals.toJSON().collection).some(meal =>
        normalizeIngredientName(meal.Name) === normalizeIngredientName(cleanName)
      )) {
      throw new Error(`A meal named "${cleanName}" already exists on this day`);
    }
    const baseID = cleanName.toLocaleLowerCase().normalize('NFC')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'custom-meal';
    let id = `custom-${baseID}`;
    let suffix = 2;
    while (day.meals.getMealByID(id)) {
      id = `custom-${baseID}-${suffix++}`;
    }
    const meal = day.addMeal(new Meal({
      id,
      name: cleanName,
      servingsRequired: 1
    }));
    this.#saveWeeks();
    return meal;
  };
  renameMealOnDay(weekParameter, dayID, mealID, name) {
    const {
      day,
      meal
    } = this.#getEditableMeal(weekParameter, dayID, mealID);
    if (typeof name !== 'string' || !name.trim()) {
      throw new TypeError('Enter a meal name');
    }
    const cleanName = name.trim();
    const duplicate = Object.values(day.meals.toJSON().collection).some(existing =>
      existing.ID !== meal.ID && normalizeIngredientName(existing.Name) === normalizeIngredientName(cleanName)
    );
    if (duplicate) {
      throw new Error(`A meal named "${cleanName}" already exists on this day`);
    }
    meal.Name = cleanName;
    this.#saveWeeks();
    return meal.Name;
  };
  removeMealFromDay(weekParameter, dayID, mealID) {
    const {
      day,
      meal
    } = this.#getEditableMeal(weekParameter, dayID, mealID);
    if (meal.isExecuted) throw new Error('Executed meals are locked and cannot be removed');
    day.removeMealByID(mealID);
    this.#updateDayStatus(day);
    this.#saveWeeks();
  };
  get ingredientUnitConversions() {
    return this.#ingredientUnitConversions.map(conversion => ({
      ...conversion
    }));
  }
  #getIngredientUnitGraph(ingredientName) {
    const graph = new Map();
    const addEdge = (fromUnit, toUnit, ratio) => {
      if (!graph.has(fromUnit)) {
        graph.set(fromUnit, new Map());
      }
      if (!graph.has(toUnit)) {
        graph.set(toUnit, new Map());
      }
      graph.get(fromUnit).set(toUnit, ratio);
      graph.get(toUnit).set(fromUnit, 1 / ratio);
    };
    Object.entries(unitDefinitions).forEach(([unit, definition]) => {
      const normalizedUnit = normalizeUnitName(unit);
      const baseUnit = normalizeUnitName(definition.unit);
      if (normalizedUnit !== baseUnit) {
        addEdge(normalizedUnit, baseUnit, definition.factor);
      }
    });
    const ingredientKey = normalizeIngredientName(ingredientName);
    this.#ingredientUnitConversions
      .filter(conversion => normalizeIngredientName(conversion.ingredient) === ingredientKey)
      .forEach(conversion => {
        addEdge(
          normalizeUnitName(conversion.fromUnit),
          normalizeUnitName(conversion.toUnit),
          conversion.toQuantity / conversion.fromQuantity
        );
      });
    return graph;
  }
  #unitGraphIsConsistent(graph) {
    const scales = new Map();
    for (const [rootUnit, neighbors] of graph) {
      if (scales.has(rootUnit) || !neighbors.size) {
        continue;
      }
      scales.set(rootUnit, 1);
      const queue = [rootUnit];
      while (queue.length) {
        const currentUnit = queue.shift();
        const currentScale = scales.get(currentUnit);
        for (const [neighbor, ratio] of graph.get(currentUnit)) {
          const expectedScale = currentScale / ratio;
          if (!scales.has(neighbor)) {
            scales.set(neighbor, expectedScale);
            queue.push(neighbor);
            continue;
          }
          const scaleDifference = Math.abs(scales.get(neighbor) - expectedScale);
          const scaleTolerance = 1e-9 * Math.max(1, Math.abs(expectedScale));
          if (scaleDifference > scaleTolerance) {
            return false;
          }
        }
      }
    }
    return true;
  }
  #getIngredientUnitDefinition(ingredientName, unit) {
    const unitName = normalizeUnitName(unit);
    const graph = this.#getIngredientUnitGraph(ingredientName);
    if (!graph.has(unitName)) {
      return normalizeUnit(unit);
    }
    const component = new Set([unitName]);
    const componentQueue = [unitName];
    while (componentQueue.length) {
      const currentUnit = componentQueue.shift();
      graph.get(currentUnit).forEach((_, neighbor) => {
        if (!component.has(neighbor)) {
          component.add(neighbor);
          componentQueue.push(neighbor);
        }
      });
    }
    const rootUnit = [...component].sort()[0];
    const scales = new Map([
      [rootUnit, 1]
    ]);
    const scaleQueue = [rootUnit];
    while (scaleQueue.length) {
      const currentUnit = scaleQueue.shift();
      const currentScale = scales.get(currentUnit);
      graph.get(currentUnit).forEach((ratio, neighbor) => {
        if (!scales.has(neighbor)) {
          scales.set(neighbor, currentScale / ratio);
          scaleQueue.push(neighbor);
        }
      });
    }
    return {
      category: `ingredient:${normalizeIngredientName(ingredientName)}:${rootUnit}`,
      factor: scales.get(unitName),
      unit: rootUnit
    };
  }
  translateIngredientQuantity(ingredientName, quantity, fromUnit, toUnit) {
    if (typeof ingredientName !== 'string' || !ingredientName.trim()) {
      throw new TypeError('Enter an ingredient name');
    }
    if (!Number.isFinite(quantity) || quantity < 0) {
      throw new RangeError('Quantity must be zero or greater');
    }
    if (typeof fromUnit !== 'string' || !fromUnit.trim() ||
      typeof toUnit !== 'string' || !toUnit.trim()) {
      throw new TypeError('Enter both units to translate');
    }
    const fromDefinition = this.#getIngredientUnitDefinition(ingredientName, fromUnit);
    const toDefinition = this.#getIngredientUnitDefinition(ingredientName, toUnit);
    if (fromDefinition.category !== toDefinition.category) {
      throw new Error(`No unit translation is defined for ${ingredientName} from ${fromUnit} to ${toUnit}`);
    }
    return quantity * fromDefinition.factor / toDefinition.factor;
  }
  setIngredientUnitConversion(ingredientName, fromQuantity, fromUnit, toQuantity, toUnit) {
    const ingredient = typeof ingredientName === 'string' ? ingredientName.trim() : '';
    const sourceUnit = typeof fromUnit === 'string' ? fromUnit.trim() : '';
    const targetUnit = typeof toUnit === 'string' ? toUnit.trim() : '';
    if (!ingredient || !sourceUnit || !targetUnit) {
      throw new TypeError('Enter an ingredient and both units');
    }
    if (!Number.isFinite(fromQuantity) || fromQuantity <= 0 ||
      !Number.isFinite(toQuantity) || toQuantity <= 0) {
      throw new RangeError('Both equivalent quantities must be greater than zero');
    }
    const sourceKey = normalizeUnitName(sourceUnit);
    const targetKey = normalizeUnitName(targetUnit);
    if (sourceKey === targetKey) {
      throw new Error('Choose two different units to translate');
    }
    const conversionRatio = toQuantity / fromQuantity;
    if (!Number.isFinite(conversionRatio) || conversionRatio <= 0) {
      throw new RangeError('The equivalent quantities produce an invalid conversion ratio');
    }
    const ingredientKey = normalizeIngredientName(ingredient);
    const existingIndex = this.#ingredientUnitConversions.findIndex(conversion =>
      normalizeIngredientName(conversion.ingredient) === ingredientKey &&
      ((normalizeUnitName(conversion.fromUnit) === sourceKey &&
          normalizeUnitName(conversion.toUnit) === targetKey) ||
        (normalizeUnitName(conversion.fromUnit) === targetKey &&
          normalizeUnitName(conversion.toUnit) === sourceKey))
    );
    const previousConversion = existingIndex < 0 ? null : this.#ingredientUnitConversions[existingIndex];
    const conversion = {
      id: previousConversion?.id ||
        `unit-conversion-${encodeURIComponent(ingredientKey)}-${encodeURIComponent(sourceKey)}-${encodeURIComponent(targetKey)}`,
      ingredient,
      fromQuantity,
      fromUnit: sourceUnit,
      toQuantity,
      toUnit: targetUnit
    };
    if (existingIndex < 0) {
      this.#ingredientUnitConversions.push(conversion);
    } else {
      this.#ingredientUnitConversions[existingIndex] = conversion;
    }
    if (!this.#unitGraphIsConsistent(this.#getIngredientUnitGraph(ingredient))) {
      if (existingIndex < 0) {
        this.#ingredientUnitConversions.pop();
      } else {
        this.#ingredientUnitConversions[existingIndex] = previousConversion;
      }
      throw new Error('This translation conflicts with another conversion for this ingredient');
    }
    this.#storage.objectWrite('ingredientUnitConversions', this.#ingredientUnitConversions, false);
    return {
      ...conversion
    };
  }
  removeIngredientUnitConversion(conversionID) {
    const index = this.#ingredientUnitConversions.findIndex(conversion => conversion.id === conversionID);
    if (index < 0) {
      throw new Error('The ingredient unit translation is no longer available');
    }
    const [removed] = this.#ingredientUnitConversions.splice(index, 1);
    this.#storage.objectWrite('ingredientUnitConversions', this.#ingredientUnitConversions, false);
    return {
      ...removed
    };
  }
  setInventoryItem(name, quantity, unit) {
    if (typeof name !== 'string' || !name.trim()) {
      throw new TypeError('Enter an ingredient name');
    }
    if (!Number.isFinite(quantity) || quantity < 0) {
      throw new RangeError('Inventory quantity must be zero or greater');
    }
    if (typeof unit !== 'string' || !unit.trim()) {
      throw new TypeError('Enter an inventory unit');
    }
    const cleanName = name.trim();
    const keyName = normalizeIngredientName(cleanName);
    const collection = this.#inventory.toJSON().collection;
    const current = Object.values(collection).find(item => normalizeIngredientName(item.Name || '') === keyName);
    if (current) {
      const currentUnit = current.Unit || unit;
      const incomingDefinition = this.#getIngredientUnitDefinition(cleanName, unit);
      const currentDefinition = this.#getIngredientUnitDefinition(cleanName, currentUnit);
      if (incomingDefinition.category !== currentDefinition.category) {
        throw new Error(`Use the existing ${currentUnit} unit for ${current.Name}`);
      }
      current.setStock(
        quantity * incomingDefinition.factor / currentDefinition.factor,
        currentUnit
      );
    } else {
      const key = `stock-${keyName.replace(/[^a-z0-9]+/g, '-')}`;
      let uniqueKey = key;
      let suffix = 2;
      while (Object.prototype.hasOwnProperty.call(collection, uniqueKey)) {
        uniqueKey = `${key}-${suffix++}`;
      }
      this.#inventory.addIngredient(uniqueKey, new QuantifiedIngredient({
        ingredient: cleanName,
        quantity,
        unit: unit.trim()
      }));
    }
    this.#saveInventory();
    return Object.values(this.#inventory.toJSON().collection)
      .find(item => normalizeIngredientName(item.Name || '') === keyName);
  };
  removeInventoryItem(name) {
    const keyName = normalizeIngredientName(name);
    const collection = this.#inventory.toJSON().collection;
    const key = Object.keys(collection).find(index =>
      normalizeIngredientName(collection[index].Name || '') === keyName
    );
    if (key === undefined) {
      throw new Error('The inventory item is no longer available');
    }
    this.#inventory.removeIngredientByIndex(key);
    this.#saveInventory();
  };
  purchaseShoppingListItem(name, purchasedQuantity, unitFilter = null) {
    const keyName = normalizeIngredientName(name);
    const shoppingCollection = this.#shoppingList.toJSON().collection;
    const matchingKeys = Object.keys(shoppingCollection).filter(index =>
      normalizeIngredientName(shoppingCollection[index].Name || '') === keyName
    );
    const exactUnitKey = unitFilter === null ? undefined : matchingKeys.find(index =>
      normalizeUnitName(shoppingCollection[index].Unit || '') === normalizeUnitName(unitFilter)
    );
    const compatibleUnitKey = unitFilter === null ? undefined : matchingKeys.find(index =>
      this.#getIngredientUnitDefinition(name, shoppingCollection[index].Unit || '').category ===
      this.#getIngredientUnitDefinition(name, unitFilter).category
    );
    const shoppingKey = unitFilter === null ?
      matchingKeys[0] :
      exactUnitKey || compatibleUnitKey;
    const shoppingItem = shoppingKey === undefined ? null : shoppingCollection[shoppingKey];
    if (!shoppingItem || !Number.isFinite(shoppingItem.Quantity) || shoppingItem.Quantity <= 0) {
      throw new Error('The quantified shopping-list item is no longer available');
    }
    if (!Number.isFinite(purchasedQuantity) || purchasedQuantity <= 0) {
      throw new RangeError('Purchased quantity must be greater than zero');
    }
    const unit = shoppingItem.Unit || 'each';
    const inventoryCollection = this.#inventory.toJSON().collection;
    const inventoryItem = Object.values(inventoryCollection).find(item =>
      normalizeIngredientName(item.Name || '') === keyName
    );
    if (inventoryItem) {
      const inventoryUnit = inventoryItem.Unit || unit;
      const purchasedDefinition = this.#getIngredientUnitDefinition(name, unit);
      const inventoryDefinition = this.#getIngredientUnitDefinition(name, inventoryUnit);
      if (purchasedDefinition.category !== inventoryDefinition.category) {
        throw new Error(`Use the existing ${inventoryUnit} unit for ${inventoryItem.Name}`);
      }
      const currentQuantity = Number.isFinite(inventoryItem.Quantity) ? inventoryItem.Quantity : 0;
      inventoryItem.setStock(
        currentQuantity + purchasedQuantity * purchasedDefinition.factor / inventoryDefinition.factor,
        inventoryUnit
      );
    } else {
      const baseKey = `stock-${keyName.replace(/[^a-z0-9]+/g, '-')}`;
      let inventoryKey = baseKey;
      let suffix = 2;
      while (Object.prototype.hasOwnProperty.call(inventoryCollection, inventoryKey)) {
        inventoryKey = `${baseKey}-${suffix++}`;
      }
      this.#inventory.addIngredient(inventoryKey, new QuantifiedIngredient({
        ingredient: shoppingItem.Name,
        quantity: purchasedQuantity,
        unit
      }));
    }
    this.#saveInventory();
    const remainingQuantity = Math.max(0, shoppingItem.Quantity - purchasedQuantity);
    if (remainingQuantity > 0) {
      shoppingItem.setStock(remainingQuantity, unit);
    } else {
      this.#shoppingList.removeIngredientByIndex(shoppingKey);
    }
    this.#saveShoppingList();
    return {
      purchased: purchasedQuantity,
      remaining: remainingQuantity,
      unit
    };
  };
  removeShoppingListItem(name, unitFilter = null) {
    const keyName = normalizeIngredientName(name);
    const collection = this.#shoppingList.toJSON().collection;
    const matchingKeys = Object.keys(collection).filter(index =>
      normalizeIngredientName(collection[index].Name || '') === keyName
    );
    const exactUnitKey = unitFilter === null ? undefined : matchingKeys.find(index =>
      normalizeUnitName(collection[index].Unit || '') === normalizeUnitName(unitFilter)
    );
    const compatibleUnitKey = unitFilter === null ? undefined : matchingKeys.find(index =>
      this.#getIngredientUnitDefinition(name, collection[index].Unit || '').category ===
      this.#getIngredientUnitDefinition(name, unitFilter).category
    );
    const key = unitFilter === null ?
      matchingKeys[0] :
      exactUnitKey || compatibleUnitKey;
    if (key === undefined) {
      throw new Error('The shopping-list item is no longer available');
    }
    this.#shoppingList.removeIngredientByIndex(key);
    this.#saveShoppingList();
  };
  #getMealIngredientRequirements(meal) {
    const requirements = new Map();
    const unresolved = [];
    meal.recipeWrappers.forEach(wrapper => {
      const recipe = this.#recipes.getRecipeByID(wrapper.recipeID);
      if (!recipe) {
        throw new Error(`Recipe "${wrapper.recipeID}" is no longer available`);
      }
      Object.entries(recipe.QuantifiedIngredient.toJSON().collection).forEach(([ingredientKey, ingredient]) => {
        const name = ingredient.Name?.trim();
        if (!name) {
          return;
        }
        const measure = ingredient.Measure?.trim() || '';
        let amount = ingredient.Quantity;
        let rawUnit = ingredient.Unit;
        const hasStructuredAmount = Number.isFinite(amount) && amount > 0;
        if (!hasStructuredAmount) {
          const match = measure.match(/^((?:\d+\s+)?\d+(?:\.\d+)?(?:\/\d+)?)\s*(.*)$/);
          if (!match) {
            unresolved.push({
              recipeID: recipe.ID,
              recipeName: recipe.Name,
              ingredientKey,
              name,
              measure
            });
            return;
          }
          amount = parseFraction(match[1]);
          rawUnit = match[2] || 'each';
          if (['large', 'medium', 'small', 'whole'].includes(rawUnit.toLocaleLowerCase())) {
            rawUnit = 'each';
          }
        }
        if (!Number.isFinite(amount) || amount <= 0) {
          unresolved.push({
            recipeID: recipe.ID,
            recipeName: recipe.Name,
            ingredientKey,
            name,
            measure
          });
          return;
        }
        const definition = this.#getIngredientUnitDefinition(name, rawUnit || 'each');
        if (!hasStructuredAmount && definition.category.startsWith('custom:')) {
          unresolved.push({
            recipeID: recipe.ID,
            recipeName: recipe.Name,
            ingredientKey,
            name,
            measure
          });
          return;
        }
        const key = `${normalizeIngredientName(name)}|${definition.category}`;
        const required = amount * wrapper.ingredientMultiplier * definition.factor;
        const current = requirements.get(key) || {
          name,
          category: definition.category,
          unit: definition.unit,
          displayUnit: rawUnit || 'each',
          factor: definition.factor,
          required: 0
        };
        current.required += required;
        requirements.set(key, current);
      });
    });
    return {
      requirements: [...requirements.values()],
      unresolved
    };
  };
  getMealExecutionCheck(weekParameter, dayID, mealID) {
    const week = getWeekForParameter(weekParameter, this);
    const day = week.days.getDayByID(dayID);
    const meal = day?.meals.getMealByID(mealID);
    if (!meal) {
      throw new Error('The selected meal slot is unavailable');
    }
    const {
      requirements,
      unresolved
    } = this.#getMealIngredientRequirements(meal);
    const stock = Object.values(this.#inventory.toJSON().collection);
    const shortages = requirements.flatMap(requirement => {
      const available = stock.reduce((total, item) => {
        if (normalizeIngredientName(item.Name || '') !== normalizeIngredientName(requirement.name) ||
          !Number.isFinite(item.Quantity) || item.Quantity <= 0) {
          return total;
        }
        const definition = this.#getIngredientUnitDefinition(requirement.name, item.Unit || '');
        return definition.category === requirement.category ?
          total + item.Quantity * definition.factor : total;
      }, 0);
      const missing = Math.max(0, requirement.required - available);
      return missing > 0 ? [{
        name: requirement.name,
        required: requirement.required,
        available,
        missing,
        unit: requirement.displayUnit || requirement.unit
      }] : [];
    });
    return {
      executed: meal.isExecuted,
      shortages,
      unresolved
    };
  };
  getPlannedIngredientShortages(weekParameter) {
    const week = getWeekForParameter(weekParameter, this);
    const requirements = new Map();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    Object.entries(week.days.toJSON().collection).forEach(([dayID, day]) => {
      const dayIndex = SiteData.weekDays.findIndex(([configuredDayID]) => configuredDayID === dayID);
      if (dayIndex < 0) {
        return;
      }
      const dayDate = new Date(`${week.weekStartDate}T00:00:00`);
      dayDate.setDate(dayDate.getDate() + dayIndex);
      if (dayDate < today) {
        return;
      }
      Object.values(day.meals.toJSON().collection).forEach(meal => {
        if (meal.isExecuted || !meal.recipeIDs.length) {
          return;
        }
        const result = this.#getMealIngredientRequirements(meal);
        result.requirements.forEach(requirement => {
          const key = `${normalizeIngredientName(requirement.name)}|${requirement.category}`;
          const current = requirements.get(key) || {
            name: requirement.name,
            category: requirement.category,
            unit: requirement.unit,
            displayUnit: requirement.displayUnit,
            factor: requirement.factor,
            required: 0
          };
          current.required += requirement.required;
          requirements.set(key, current);
        });
      });
    });
    const inventory = Object.values(this.#inventory.toJSON().collection);
    const shoppingList = Object.values(this.#shoppingList.toJSON().collection);
    return [...requirements.values()].flatMap(requirement => {
      const available = inventory.reduce((total, item) => {
        if (normalizeIngredientName(item.Name || '') !== normalizeIngredientName(requirement.name) ||
          !Number.isFinite(item.Quantity) || item.Quantity <= 0) {
          return total;
        }
        const definition = this.#getIngredientUnitDefinition(requirement.name, item.Unit || '');
        return definition.category === requirement.category ?
          total + item.Quantity * definition.factor : total;
      }, 0);
      const plannedPurchase = shoppingList.reduce((total, item) => {
        if (normalizeIngredientName(item.Name || '') !== normalizeIngredientName(requirement.name) ||
          !Number.isFinite(item.Quantity) || item.Quantity <= 0) {
          return total;
        }
        const definition = this.#getIngredientUnitDefinition(requirement.name, item.Unit || '');
        return definition.category === requirement.category ?
          total + item.Quantity * definition.factor : total;
      }, 0);
      const missing = Math.max(0, requirement.required - available - plannedPurchase);
      return missing > 0 ? [{
        name: requirement.name,
        required: requirement.required / requirement.factor,
        available: available / requirement.factor,
        plannedPurchase: plannedPurchase / requirement.factor,
        missing: missing / requirement.factor,
        unit: requirement.displayUnit || requirement.unit
      }] : [];
    });
  };
  addMealShortagesToShoppingList(shortages) {
    if (!Array.isArray(shortages) || !shortages.length) {
      throw new TypeError('There are no missing ingredients to add');
    }
    shortages.forEach(shortage => {
      const name = String(shortage.name || '').trim();
      const missing = Number(shortage.missing);
      const unit = String(shortage.unit || '').trim();
      if (!name || !Number.isFinite(missing) || missing <= 0 || !unit) {
        throw new TypeError('A shortage entry is invalid');
      }
      const keyName = normalizeIngredientName(name);
      const collection = this.#shoppingList.toJSON().collection;
      const item = Object.values(collection).find(existing =>
        normalizeIngredientName(existing.Name || '') === keyName &&
        this.#getIngredientUnitDefinition(name, existing.Unit || '').category ===
        this.#getIngredientUnitDefinition(name, unit).category
      );
      if (item) {
        const oldQuantity = Number(item.Quantity) || 0;
        const existingUnit = item.Unit || unit;
        const newUnitDefinition = this.#getIngredientUnitDefinition(name, unit);
        const existingUnitDefinition = this.#getIngredientUnitDefinition(name, existingUnit);
        const conversion = newUnitDefinition.factor / existingUnitDefinition.factor;
        item.setStock(oldQuantity + missing * conversion, existingUnit);
      } else {
        const unitDefinition = this.#getIngredientUnitDefinition(name, unit);
        const key = `need-${keyName.replace(/[^a-z0-9]+/g, '-')}-${unitDefinition.unit}`;
        this.#shoppingList.addIngredient(key, new QuantifiedIngredient({
          ingredient: name,
          quantity: missing,
          unit
        }));
      }
    });
    this.#saveShoppingList();
  };
  executeMeal(weekParameter, dayID, mealID) {
    const {
      day,
      meal
    } = this.#getEditableMeal(weekParameter, dayID, mealID);
    if (!meal.recipeIDs.length) {
      throw new Error('Add at least one recipe before executing this meal');
    }
    const check = this.getMealExecutionCheck(weekParameter, dayID, mealID);
    if (check.shortages.length || check.unresolved.length) {
      return check;
    }
    const {
      requirements
    } = this.#getMealIngredientRequirements(meal);
    requirements.forEach(requirement => {
      let remaining = requirement.required;
      Object.values(this.#inventory.toJSON().collection).forEach(item => {
        if (remaining <= 0 ||
          normalizeIngredientName(item.Name || '') !== normalizeIngredientName(requirement.name)) {
          return;
        }
        const definition = this.#getIngredientUnitDefinition(requirement.name, item.Unit || '');
        if (definition.category !== requirement.category || !Number.isFinite(item.Quantity)) {
          return;
        }
        const stockBase = item.Quantity * definition.factor;
        const usedBase = Math.min(stockBase, remaining);
        item.setStock((stockBase - usedBase) / definition.factor, item.Unit || definition.unit);
        remaining -= usedBase;
      });
    });
    meal.markExecuted();
    this.#updateDayStatus(day);
    this.#saveInventory();
    this.#saveWeeks();
    return {
      executed: true,
      shortages: [],
      unresolved: []
    };
  };
  clearMealRecipes(weekParameter, dayID, mealID) {
    const {
      day,
      meal
    } = this.#getEditableMeal(weekParameter, dayID, mealID);
    meal.clearRecipes();
    this.#updateDayStatus(day);
    this.#saveWeeks();
  };
  clearDayRecipes(weekParameter, dayID) {
    const week = getWeekForParameter(weekParameter, this);
    const dayIndex = SiteData.weekDays.findIndex(([configuredDayID]) => configuredDayID === dayID);
    if (dayIndex < 0) {
      throw new TypeError('Choose a valid day');
    }
    const dayDate = new Date(`${week.weekStartDate}T00:00:00`);
    dayDate.setDate(dayDate.getDate() + dayIndex);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dayDate < today) {
      throw new RangeError('Past days are read-only');
    }
    const day = week.days.getDayByID(dayID);
    if (!day) {
      throw new Error('The selected day is unavailable');
    }
    if (Object.values(day.meals.toJSON().collection).some(meal => meal.isExecuted)) {
      throw new Error('A day containing an executed meal cannot be cleared');
    }
    Object.values(day.meals.toJSON().collection).forEach(meal => meal.clearRecipes());
    this.#updateDayStatus(day);
    this.#saveWeeks();
  };
  copyMealPlanToDate(weekParameter, sourceDayID, sourceMealID, destinationDate, destinationMealID = sourceMealID) {
    const sourceWeek = getWeekForParameter(weekParameter, this);
    const sourceDay = sourceWeek.days.getDayByID(sourceDayID);
    const sourceMeal = sourceDay?.meals.getMealByID(sourceMealID);
    if (!sourceDay || !sourceMeal) {
      throw new Error('The source meal is unavailable');
    }
    if (!sourceMeal.recipeIDs.length) {
      throw new Error('There are no recipes in this meal to copy');
    }
    this.#validateRecipesAvailable([sourceMeal]);
    const destination = this.#getDayForDate(destinationDate);
    const destinationMeal = destination.day.meals.getMealByID(destinationMealID);
    if (destinationMeal?.isExecuted) {
      throw new Error('An executed meal cannot be replaced');
    }
    if (!destinationMeal) {
      if (destinationMealID !== sourceMealID) {
        throw new TypeError('Choose a valid destination meal');
      }
      const newMeal = destination.day.addMeal(new Meal({
        id: sourceMeal.ID,
        name: sourceMeal.Name,
        servingsRequired: 1
      }));
      this.#replaceMealContents(sourceMeal, newMeal);
      this.#updateDayStatus(destination.day);
      this.#saveWeeks();
      return {
        day: destination.day.Name,
        meal: newMeal.Name
      };
    }
    const sourceDate = new Date(`${sourceWeek.weekStartDate}T00:00:00`);
    sourceDate.setDate(sourceDate.getDate() + SiteData.weekDays.findIndex(([id]) => id === sourceDayID));
    if (
      sourceDate.toDateString() === parseDate(destinationDate).toDateString() &&
      sourceMealID === destinationMealID
    ) {
      throw new Error('Choose a different destination meal');
    }
    this.#replaceMealContents(sourceMeal, destinationMeal);
    this.#updateDayStatus(destination.day);
    this.#saveWeeks();
    return {
      day: destination.day.Name,
      meal: destinationMeal.Name
    };
  };
  copyDayPlanToDate(weekParameter, sourceDayID, destinationDate) {
    const sourceWeek = getWeekForParameter(weekParameter, this);
    const sourceDay = sourceWeek.days.getDayByID(sourceDayID);
    if (!sourceDay) {
      throw new Error('The source day is unavailable');
    }
    if (!Object.values(sourceDay.meals.toJSON().collection).some(meal => meal.recipeIDs.length)) {
      throw new Error('There are no recipes on this day to copy');
    }
    this.#validateRecipesAvailable(Object.values(sourceDay.meals.toJSON().collection));
    const destination = this.#getDayForDate(destinationDate);
    const sourceDate = new Date(`${sourceWeek.weekStartDate}T00:00:00`);
    sourceDate.setDate(sourceDate.getDate() + SiteData.weekDays.findIndex(([id]) => id === sourceDayID));
    if (sourceDate.toDateString() === parseDate(destinationDate).toDateString()) {
      throw new Error('Choose a different destination day');
    }
    this.#replaceDayContents(sourceDay, destination.day);
    this.#updateDayStatus(destination.day);
    this.#saveWeeks();
    return destination.day.Name;
  };
  copyWeekPlanToDates(weekParameter, destinationDates) {
    if (!Array.isArray(destinationDates) || destinationDates.length === 0) {
      throw new TypeError('Select at least one destination date');
    }
    const uniqueDates = [...new Set(destinationDates)];
    const sourceWeek = getWeekForParameter(weekParameter, this);
    if (!Object.values(sourceWeek.days.toJSON().collection).some(day =>
        Object.values(day.meals.toJSON().collection).some(meal => meal.recipeIDs.length)
      )) {
      throw new Error('There are no recipes in this week to copy');
    }
    const destinations = uniqueDates.map(dateValue => {
      const destination = this.#getDayForDate(dateValue);
      const dayIndex = (parseDate(dateValue).getDay() + 6) % 7;
      const sourceDayID = SiteData.weekDays[dayIndex][0];
      const sourceDay = sourceWeek.days.getDayByID(sourceDayID);
      if (!sourceDay) {
        throw new Error('A source day is unavailable');
      }
      this.#validateRecipesAvailable(Object.values(sourceDay.meals.toJSON().collection));
      return {
        ...destination,
        sourceDay
      };
    });
    destinations.forEach(({
      day,
      sourceDay
    }) => {
      if (Object.values(sourceDay.meals.toJSON().collection).some(meal => meal.recipeIDs.length) &&
        Object.values(day.meals.toJSON().collection).some(meal => meal.isExecuted)) {
        throw new Error(`The destination day ${day.Name} contains an executed meal and cannot be replaced`);
      }
    });
    let copiedDays = 0;
    destinations.forEach(({
      day,
      sourceDay
    }) => {
      if (!Object.values(sourceDay.meals.toJSON().collection).some(meal => meal.recipeIDs.length)) {
        return;
      }
      this.#replaceDayContents(sourceDay, day);
      this.#updateDayStatus(day);
      copiedDays += 1;
    });
    this.#saveWeeks();
    return copiedDays;
  };
  copyMealPlanFromDate(weekParameter, destinationDayID, destinationMealID, sourceDate, sourceMealID) {
    const {
      week: destinationWeek,
      day: destinationDay,
      meal: destinationMeal
    } = this.#getEditableMeal(weekParameter, destinationDayID, destinationMealID);
    const source = this.#getDayForDate(sourceDate, true);
    const sourceMeal = source.day.meals.getMealByID(sourceMealID);
    if (!sourceMeal?.recipeIDs.length) {
      throw new Error('The selected source meal has no recipes to copy');
    }
    this.#validateRecipesAvailable([sourceMeal]);
    if (!destinationMeal) {
      throw new TypeError('Choose a valid destination meal');
    }
    if (
      toMondayDate(parseDate(sourceDate)) === destinationWeek.weekStartDate &&
      destinationDayID === source.dayID &&
      destinationMealID === sourceMealID
    ) {
      throw new Error('Choose a different source meal');
    }
    this.#replaceMealContents(sourceMeal, destinationMeal);
    this.#updateDayStatus(destinationDay);
    this.#saveWeeks();
    return {
      day: destinationDay.Name,
      meal: destinationMeal.Name
    };
  };
  copyDayPlanFromDate(weekParameter, destinationDayID, sourceDate) {
    const destinationWeek = getWeekForParameter(weekParameter, this);
    const destinationIndex = SiteData.weekDays.findIndex(([id]) => id === destinationDayID);
    if (destinationIndex < 0) {
      throw new TypeError('Choose a valid destination day');
    }
    const destinationDate = new Date(`${destinationWeek.weekStartDate}T00:00:00`);
    destinationDate.setDate(destinationDate.getDate() + destinationIndex);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (destinationDate < today) {
      throw new RangeError('Past days are read-only');
    }
    const destinationDay = destinationWeek.days.getDayByID(destinationDayID);
    const source = this.#getDayForDate(sourceDate, true);
    if (!Object.values(source.day.meals.toJSON().collection).some(meal => meal.recipeIDs.length)) {
      throw new Error('The selected source day has no recipes to copy');
    }
    this.#validateRecipesAvailable(Object.values(source.day.meals.toJSON().collection));
    if (
      destinationWeek.weekStartDate === source.week.weekStartDate &&
      destinationDayID === source.dayID
    ) {
      throw new Error('Choose a different source day');
    }
    this.#replaceDayContents(source.day, destinationDay);
    this.#updateDayStatus(destinationDay);
    this.#saveWeeks();
    return destinationDay.Name;
  };
  copyWeekPlanFromDate(weekParameter, sourceDate) {
    const destinationWeek = getWeekForParameter(weekParameter, this);
    const sourceWeek = this.#weeks.getWeekByID(toMondayDate(parseDate(sourceDate)));
    if (!sourceWeek) {
      throw new Error('The selected source week is unavailable');
    }
    if (sourceWeek.weekStartDate === destinationWeek.weekStartDate) {
      throw new Error('Choose a different source week');
    }
    const sourceDays = SiteData.weekDays.map(([dayID]) => sourceWeek.days.getDayByID(dayID));
    if (!sourceDays.some(day =>
        Object.values(day.meals.toJSON().collection).some(meal => meal.recipeIDs.length)
      )) {
      throw new Error('The selected source week has no recipes to copy');
    }
    sourceDays.forEach(day => this.#validateRecipesAvailable(Object.values(day.meals.toJSON().collection)));
    sourceDays.forEach((sourceDay, dayIndex) => {
      if (!this.#isDatePast(destinationWeek.weekStartDate, dayIndex) &&
        Object.values(sourceDay.meals.toJSON().collection).some(meal => meal.recipeIDs.length)) {
        const destinationDay = destinationWeek.days.getDayByID(SiteData.weekDays[dayIndex][0]);
        if (Object.values(destinationDay.meals.toJSON().collection).some(meal => meal.isExecuted)) {
          throw new Error(`The destination day ${destinationDay.Name} contains an executed meal and cannot be replaced`);
        }
      }
    });
    let copiedDays = 0;
    sourceDays.forEach((sourceDay, dayIndex) => {
      if (this.#isDatePast(destinationWeek.weekStartDate, dayIndex) ||
        !Object.values(sourceDay.meals.toJSON().collection).some(meal => meal.recipeIDs.length)) {
        return;
      }
      const destinationDay = destinationWeek.days.getDayByID(SiteData.weekDays[dayIndex][0]);
      this.#replaceDayContents(sourceDay, destinationDay);
      this.#updateDayStatus(destinationDay);
      copiedDays += 1;
    });
    this.#saveWeeks();
    return copiedDays;
  };
  #getTypicalMealServings() {
    const servings = Object.values(this.#weeks.toJSON().collection)
      .flatMap(week => Object.values(week.days.toJSON().collection))
      .flatMap(day => Object.values(day.meals.toJSON().collection))
      .filter(meal => meal.recipeIDs.length)
      .map(meal => meal.servingsRequired)
      .sort((left, right) => left - right);
    if (!servings.length) {
      return 4;
    }
    return servings[Math.floor(servings.length / 2)];
  };
  #generateMeal(day, meal) {
    const usedRecipeIDs = new Set(
      Object.values(day.meals.toJSON().collection).flatMap(existingMeal => existingMeal.recipeIDs)
    );
    const candidates = Object.values(this.#recipes.toJSON().collection)
      .filter(recipe => !usedRecipeIDs.has(String(recipe.ID)));
    if (!candidates.length) {
      return false;
    }
    const recipe = candidates[Math.floor(Math.random() * candidates.length)];
    const servingsRequired = this.#getTypicalMealServings();
    meal.servingsRequired = servingsRequired;
    meal.addRecipe(recipe, 1, servingsRequired);
    day.status = 'planned';
    return true;
  };
  generateMealPlan(weekParameter, dayID, mealID) {
    const {
      day,
      meal
    } = this.#getEditableMeal(weekParameter, dayID, mealID);
    if (!this.#generateMeal(day, meal)) {
      throw new Error('No unused recipes are available to generate this meal');
    }
    this.#saveWeeks();
    return meal.recipeIDs.length;
  };
  generateDayPlan(weekParameter, dayID) {
    const dayIndex = SiteData.weekDays.findIndex(([id]) => id === dayID);
    if (dayIndex < 0) {
      throw new TypeError('Choose a valid day');
    }
    const day = getWeekForParameter(weekParameter, this).days.getDayByID(dayID);
    if (!day) {
      throw new Error('The selected day is unavailable');
    }
    const results = Object.values(day.meals.toJSON().collection).map(meal => {
      if (meal.recipeIDs.length) {
        return {
          generated: false,
          unfilled: false
        };
      }
      const {
        day: editableDay
      } = this.#getEditableMeal(weekParameter, dayID, meal.ID);
      const generated = this.#generateMeal(editableDay, meal);
      return {
        generated,
        unfilled: !generated
      };
    });
    this.#saveWeeks();
    return {
      meals: results.filter(result => result.generated).length,
      unfilled: results.filter(result => result.unfilled).length
    };
  };
  generateWeekPlan(weekParameter) {
    const week = getWeekForParameter(weekParameter, this);
    let days = 0;
    let meals = 0;
    let unfilled = 0;
    SiteData.weekDays.forEach(([dayID], dayIndex) => {
      if (this.#isDatePast(week.weekStartDate, dayIndex)) {
        return;
      }
      let generatedForDay = false;
      const selectedDay = week.days.getDayByID(dayID);
      Object.values(selectedDay.meals.toJSON().collection).forEach(meal => {
        if (meal.recipeIDs.length) {
          return;
        }
        const {
          day
        } = this.#getEditableMeal(weekParameter, dayID, meal.ID);
        if (this.#generateMeal(day, meal)) {
          meals += 1;
          generatedForDay = true;
        } else {
          unfilled += 1;
        }
      });
      if (generatedForDay) {
        days += 1;
      }
    });
    this.#saveWeeks();
    return {
      days,
      meals,
      unfilled
    };
  };
  #isDatePast(weekStartDate, dayIndex) {
    const date = new Date(`${weekStartDate}T00:00:00`);
    date.setDate(date.getDate() + dayIndex);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };
  updateMealRecipeServings(weekParameter, dayID, mealID, recipeID, servingsProduced, servingsNeeded) {
    if (!Number.isFinite(servingsProduced) || servingsProduced <= 0) {
      throw new RangeError('Recipe yield must be greater than zero');
    }
    if (!Number.isSafeInteger(servingsNeeded) || servingsNeeded <= 0) {
      throw new RangeError('Meal servings to cover must be a positive whole number');
    }
    const {
      meal
    } = this.#getEditableMeal(weekParameter, dayID, mealID);
    if (servingsNeeded > meal.servingsRequired) {
      throw new RangeError('Meal servings covered cannot exceed expected meal servings');
    }
    const wrapper = meal.getRecipeWrapper(recipeID);
    if (!wrapper) {
      throw new Error('The selected recipe is no longer in this meal');
    }
    wrapper.servingsProduced = servingsProduced;
    wrapper.servingsNeeded = servingsNeeded;
    this.#storage.objectWrite('weeks', this.#weeks, false);
    return wrapper;
  };
  removeRecipeFromMeal(weekParameter, dayID, mealID, recipeID) {
    const {
      day,
      meal
    } = this.#getEditableMeal(weekParameter, dayID, mealID);
    if (!meal.removeRecipeByID(recipeID)) {
      throw new Error('The selected recipe is no longer in this meal');
    }
    day.status = Object.values(day.meals.toJSON().collection)
      .some(mealData => mealData.recipeIDs.length) ? 'planned' : 'empty';
    this.#storage.objectWrite('weeks', this.#weeks, false);
  };
  transferMealRecipe(
    weekParameter,
    sourceDayID,
    sourceMealID,
    recipeID,
    destinationDayID,
    destinationMealID,
    copy = false
  ) {
    if (sourceDayID === destinationDayID && sourceMealID === destinationMealID) {
      throw new Error('Choose a different destination meal');
    }
    let source;
    if (copy) {
      const sourceWeek = getWeekForParameter(weekParameter, this);
      const sourceDayIndex = SiteData.weekDays.findIndex(([id]) => id === sourceDayID);
      if (sourceDayIndex < 0 || this.#isDatePast(sourceWeek.weekStartDate, sourceDayIndex)) {
        throw new RangeError('Past days are read-only');
      }
      const sourceDay = sourceWeek.days.getDayByID(sourceDayID);
      const sourceMeal = sourceDay?.meals.getMealByID(sourceMealID);
      if (!sourceDay || !sourceMeal) {
        throw new Error('The source meal is unavailable');
      }
      source = {
        week: sourceWeek,
        day: sourceDay,
        meal: sourceMeal
      };
    } else {
      source = this.#getEditableMeal(weekParameter, sourceDayID, sourceMealID);
    }
    const destination = this.#getEditableMeal(weekParameter, destinationDayID, destinationMealID);
    const wrapper = source.meal.getRecipeWrapper(recipeID);
    if (!wrapper) {
      throw new Error('The selected recipe is no longer in this meal');
    }
    const recipe = this.#recipes.getRecipeByID(String(recipeID));
    if (!recipe) {
      throw new Error('The selected recipe is no longer available');
    }
    const servingsNeeded = Math.min(wrapper.servingsNeeded, destination.meal.servingsRequired);
    destination.meal.addRecipe(recipe, wrapper.servingsProduced, servingsNeeded);
    destination.day.status = 'planned';
    if (!copy) {
      source.meal.removeRecipeByID(recipeID);
      source.day.status = Object.values(source.day.meals.toJSON().collection)
        .some(mealData => mealData.recipeIDs.length) ? 'planned' : 'empty';
    }
    this.#storage.objectWrite('weeks', this.#weeks, false);
    return {
      servingsNeeded,
      servingsProduced: wrapper.servingsProduced,
      destinationDay: destination.day.Name,
      destinationMeal: destination.meal.Name
    };
  };
  setMealServingsRequired(weekParameter, dayID, mealID, servingsRequired) {
    if (!Number.isSafeInteger(servingsRequired) || servingsRequired <= 0) {
      throw new RangeError('Expected meal servings must be a positive whole number');
    }
    const {
      meal
    } = this.#getEditableMeal(weekParameter, dayID, mealID);
    meal.servingsRequired = servingsRequired;
    meal.recipeWrappers.forEach(wrapper => {
      if (wrapper.servingsNeeded > servingsRequired) {
        wrapper.servingsNeeded = servingsRequired;
      }
    });
    this.#storage.objectWrite('weeks', this.#weeks, false);
    return meal.servingsRequired;
  };
  async #ensureActiveWeekSuggestions(week, suggestions) {
    const {
      commonCount
    } = SiteData.recipeSuggestionConfiguration;
    const activeSuggestions = () => {
      const dismissedIDs = new Set(suggestions.dismissedRecipeIDs || []);
      const usedRecipeIDs = this.#getWeekRecipeIDs(week);
      return suggestions.recipeIDs.filter(recipeID =>
        !dismissedIDs.has(String(recipeID)) &&
        !usedRecipeIDs.has(String(recipeID)) &&
        this.#recipes.getRecipeByID(recipeID)
      );
    };
    suggestions.recipeIDs = Array.isArray(suggestions.recipeIDs) ?
      suggestions.recipeIDs.map(String) : [];
    suggestions.dismissedRecipeIDs = Array.isArray(suggestions.dismissedRecipeIDs) ?
      suggestions.dismissedRecipeIDs.map(String) : [];
    const targetCount = commonCount + 1;
    while (activeSuggestions().length < targetCount) {
      const activeIDs = new Set(activeSuggestions());
      const randomRecipeIDs = new Set(this.#getRandomSuggestionIDs(suggestions));
      const activeCommonCount = [...activeIDs]
        .filter(recipeID => !randomRecipeIDs.has(recipeID))
        .length;
      const unavailableRecipeIDs = new Set([
        ...suggestions.recipeIDs,
        ...this.#getWeekRecipeIDs(week)
      ]);
      let replacementRecipe;
      let isRandom = activeCommonCount >= commonCount;
      if (!isRandom) {
        replacementRecipe = Object.values(this.#recipes.toJSON().collection)
          .find(recipe => !unavailableRecipeIDs.has(String(recipe.ID)));
      }
      if (!replacementRecipe) {
        isRandom = true;
        replacementRecipe = await this.#fetchRandomSuggestion(unavailableRecipeIDs);
      }
      const replacementID = String(replacementRecipe.ID);
      suggestions.recipeIDs.push(replacementID);
      if (isRandom) {
        randomRecipeIDs.add(replacementID);
        suggestions.randomRecipeIDs = [...randomRecipeIDs];
      }
    }
  };
  #getRandomSuggestionIDs(suggestions) {
    if (Array.isArray(suggestions.randomRecipeIDs)) {
      return suggestions.randomRecipeIDs.map(String);
    }
    return suggestions.randomRecipeID ? [String(suggestions.randomRecipeID)] : [];
  };
  #isWeekFull(week) {
    const days = Object.values(week.days.toJSON().collection);
    return days.length === SiteData.weekDays.length && days.every(day => {
      const meals = day.meals.toJSON().collection;
      const mealList = Object.values(meals);
      return mealList.length > 0 && mealList.every(meal => meal.recipeIDs.length > 0);
    });
  };
  #getWeekRecipeIDs(week) {
    const usedRecipeIDs = new Set();
    Object.values(week.days.toJSON().collection).forEach(day => {
      Object.values(day.meals.toJSON().collection).forEach(meal => {
        meal.recipeIDs.forEach(recipeID => usedRecipeIDs.add(String(recipeID)));
      });
    });
    return usedRecipeIDs;
  };
  async #createWeekSuggestions(week) {
    const {
      commonCount,
    } = SiteData.recipeSuggestionConfiguration;
    const usedRecipeIDs = this.#getWeekRecipeIDs(week);
    const availableCommonRecipes = Object.values(this.#recipes.toJSON().collection)
      .filter(recipe => !usedRecipeIDs.has(String(recipe.ID)));
    for (let index = availableCommonRecipes.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [availableCommonRecipes[index], availableCommonRecipes[swapIndex]] = [availableCommonRecipes[swapIndex], availableCommonRecipes[index]];
    }
    const suggestedIDs = availableCommonRecipes
      .slice(0, commonCount)
      .map(recipe => String(recipe.ID));
    const randomRecipeIDs = [];
    const excludedRecipeIDs = new Set([
      ...suggestedIDs,
      ...usedRecipeIDs
    ]);
    const totalSuggestionCount = commonCount + 1;
    while (suggestedIDs.length < totalSuggestionCount) {
      const randomRecipe = await this.#fetchRandomSuggestion(excludedRecipeIDs);
      const randomRecipeID = String(randomRecipe.ID);
      suggestedIDs.push(randomRecipeID);
      randomRecipeIDs.push(randomRecipeID);
      excludedRecipeIDs.add(randomRecipeID);
    }
    return {
      recipeIDs: suggestedIDs,
      randomRecipeIDs,
      dismissedRecipeIDs: []
    };
  };
  async dismissSuggestedRecipe(weekParameter, recipeID) {
    const week = getWeekForParameter(weekParameter, this);
    const suggestions = this.#weekRecipeSuggestions[week.weekStartDate];
    const dismissedRecipeID = String(recipeID);
    const usedRecipeIDs = this.#getWeekRecipeIDs(week);
    if (
      !suggestions ||
      !suggestions.recipeIDs.includes(dismissedRecipeID) ||
      usedRecipeIDs.has(dismissedRecipeID)
    ) {
      return false;
    }
    suggestions.dismissedRecipeIDs = Array.isArray(suggestions.dismissedRecipeIDs) ?
      suggestions.dismissedRecipeIDs : [];
    if (suggestions.dismissedRecipeIDs.includes(dismissedRecipeID)) {
      return false;
    }
    suggestions.dismissedRecipeIDs.push(dismissedRecipeID);
    this.#storage.objectWrite(
      SiteData.recipeSuggestionsStorageKey,
      this.#weekRecipeSuggestions,
      false
    );

    const randomRecipeIDs = this.#getRandomSuggestionIDs(suggestions);
    const isRandomSuggestion = randomRecipeIDs.includes(dismissedRecipeID);
    const excludedRecipeIDs = new Set([
      ...suggestions.recipeIDs,
      ...usedRecipeIDs
    ]);
    let replacementRecipe;
    if (isRandomSuggestion) {
      replacementRecipe = await this.#fetchRandomSuggestion(excludedRecipeIDs);
    } else {
      replacementRecipe = Object.values(this.#recipes.toJSON().collection)
        .find(recipe => !excludedRecipeIDs.has(String(recipe.ID)));
      if (!replacementRecipe) {
        replacementRecipe = await this.#fetchRandomSuggestion(excludedRecipeIDs);
        randomRecipeIDs.push(String(replacementRecipe.ID));
      }
    }

    suggestions.recipeIDs.push(String(replacementRecipe.ID));
    if (isRandomSuggestion) {
      randomRecipeIDs.push(String(replacementRecipe.ID));
    }
    suggestions.randomRecipeIDs = randomRecipeIDs;
    delete suggestions.randomRecipeID;
    this.#storage.objectWrite(
      SiteData.recipeSuggestionsStorageKey,
      this.#weekRecipeSuggestions,
      false
    );
    return true;
  };
  async #fetchRandomSuggestion(excludedRecipeIDs) {
    const {
      maximumAttemptsPerSuggestion
    } = SiteData.recipeSuggestionConfiguration;
    for (let attempt = 0; attempt < maximumAttemptsPerSuggestion; attempt += 1) {
      const response = await this.#apis.RandomMeal();
      const meal = response?.meals?.[0];
      const recipeID = meal?.idMeal === undefined ? '' : String(meal.idMeal);
      if (!recipeID || excludedRecipeIDs.has(recipeID)) {
        continue;
      }
      this.#recipes = Recipes.importMealsDBJSON(this.#recipes, {
        meals: [meal]
      });
      this.#storage.objectWrite('recipes', this.#recipes, false);
      this.#scheduleRecipeWordResolution();
      return this.#recipes.getRecipeByID(recipeID);
    }
    throw new Error('TheMealDB did not provide a distinct replacement recipe suggestion');
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
  async searchRecipesByName(searchTerm) {
    const response = await this.#apis.searchMealsByStringQuery(searchTerm);
    const recipes = await this.importMealDBRecipes(response);
    this.#storage.objectWrite('recipes', recipes, false);
    return (response?.meals || [])
      .map(meal => recipes.getRecipeByID(meal.idMeal))
      .filter(recipe => recipe !== undefined);
  };
  async searchRecipesByIngredient(searchTerm) {
    const ingredient = searchTerm.trim().replace(/\s+/g, '_');
    const response = await this.#apis.filterMealsByIngredientQuery(ingredient);
    return (response?.meals || []).map(meal => ({
      ID: meal.idMeal,
      Name: meal.strMeal
    }));
  };
  async getRecipeCategories() {
    const response = await this.#apis.MealCategoriesList();
    return (response?.meals || [])
      .map(category => category.strCategory)
      .filter(category => typeof category === 'string' && category.trim())
      .sort((first, second) => first.localeCompare(second));
  };
  async getRecipeIngredients() {
    const response = await this.#apis.MealIngredientsList();
    return (response?.meals || [])
      .map(ingredient => ingredient.strIngredient)
      .filter(ingredient => typeof ingredient === 'string' && ingredient.trim())
      .sort((first, second) => first.localeCompare(second));
  };
  async searchRecipesByCategory(category) {
    const response = await this.#apis.filterMealsByCategoryQuery(category);
    return (response?.meals || []).map(meal => ({
      ID: meal.idMeal,
      Name: meal.strMeal
    }));
  };
  async getRecipeByID(id) {
    const storedRecipe = this.#recipes.getRecipeByID(String(id));
    if (storedRecipe) {
      return storedRecipe;
    }
    const response = await this.#apis.lookupMealByIDCharQuery(String(id));
    await this.importMealDBRecipes(response);
    this.#storage.objectWrite('recipes', this.#recipes, false);
    return this.#recipes.getRecipeByID(String(id));
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
