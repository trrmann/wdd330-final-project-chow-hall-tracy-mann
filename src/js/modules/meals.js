import {
  Recipes
} from './recipes'

export class Meals {
  static fromJSON(json) {
    const instance = new Meals();
    instance.#fromJSON(json);
    return instance;
  };
  #collection;
  #index;
  #rebuildIndex() {
    this.#index = Object.keys(this.#collection).reduce((index, mealID) => {
      const name = this.#collection[mealID].Name;
      if (name) {
        index[name] = mealID;
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
    if (json && json.collection) {
      this.#collection = Object.keys(json.collection).reduce((collection, key) => {
        collection[key] = Meal.fromJSON(json.collection[key]);
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
  getMealByID(id) {
    return this.#collection[id];
  };
  getMealByName(name) {
    return this.#collection[this.#index[name]];
  };
  addMeal(meal) {
    if (!(meal instanceof Meal)) {
      throw new TypeError('meal must be a Meal instance');
    }
    if (meal.ID === undefined || meal.ID === null || String(meal.ID).trim() === '') {
      throw new TypeError('meal must have an ID');
    }
    if (Object.prototype.hasOwnProperty.call(this.#collection, meal.ID)) {
      throw new Error(`A meal with ID "${meal.ID}" already exists`);
    }
    this.#collection[meal.ID] = meal;
    this.#rebuildIndex();
    return meal;
  };
  removeMealByID(id) {
    const meal = this.#collection[id];
    if (meal) {
      delete this.#collection[id];
      this.#rebuildIndex();
    }
    return meal;
  };
  updateMeal(meal) {
    if (!(meal instanceof Meal)) {
      throw new TypeError('meal must be a Meal instance');
    }
    if (meal.ID === undefined || meal.ID === null || String(meal.ID).trim() === '') {
      throw new TypeError('meal must have an ID');
    }
    if (!Object.prototype.hasOwnProperty.call(this.#collection, meal.ID)) {
      throw new Error(`No meal exists with ID "${meal.ID}"`);
    }
    this.#collection[meal.ID] = meal;
    this.#rebuildIndex();
    return meal;
  };
  clearAll() {
    this.#collection = {};
    this.#index = {};
  };
};

export class Meal {
  static fromJSON(json) {
    const instance = new Meal();
    instance.#fromJSON(json);
    return instance;
  };
  #ID;
  #Name;
  #servingsRequired;
  #recipes;
  #servingsByRecipeID;
  #syncRecipeServings() {
    const recipeIDs = Object.keys(this.#recipes.toJSON().collection);
    this.#servingsByRecipeID = recipeIDs.reduce((servings, recipeID) => {
      const recipeServings = this.#servingsByRecipeID[recipeID] ?? 1;
      this.#validateServings(recipeServings);
      servings[recipeID] = recipeServings;
      return servings;
    }, {});
  };
  #validateServings(servings) {
    if (typeof servings !== 'number' || !Number.isFinite(servings) || servings <= 0) {
      throw new TypeError('servings must be a finite number greater than zero');
    }
  };
  #toJSON() {
    this.#syncRecipeServings();
    return {
      id: this.#ID,
      name: this.#Name,
      servingsRequired: this.#servingsRequired,
      recipes: this.#recipes.toJSON(),
      servingsByRecipeID: this.#servingsByRecipeID
    };
  };
  #fromJSON(json) {
    if (json && json.id !== undefined && json.name !== undefined) {
      this.#ID = json.id;
      this.#Name = json.name;
      this.#servingsRequired = json.servingsRequired ?? 1;
      this.#validateServings(this.#servingsRequired);
      this.#recipes = json.recipes instanceof Recipes
        ? json.recipes
        : Recipes.fromJSON(json.recipes || {});
      this.#servingsByRecipeID = json.servingsByRecipeID || {};
      this.#syncRecipeServings();
    }
  };
  constructor({
    id = null,
    name = '',
    servingsRequired = 1,
    recipes = new Recipes(),
    servingsByRecipeID = {}
  } = {}) {
    this.#ID = id;
    this.#Name = name;
    this.#validateServings(servingsRequired);
    this.#servingsRequired = servingsRequired;
    this.#recipes = recipes instanceof Recipes ? recipes : Recipes.fromJSON(recipes);
    this.#servingsByRecipeID = { ...servingsByRecipeID };
    this.#syncRecipeServings();
  };
  toJSON() {
    return this.#toJSON();
  };
  get ID() {
    return this.#ID;
  };
  get Name() {
    return this.#Name;
  };
  get servingsRequired() {
    return this.#servingsRequired;
  };
  set servingsRequired(servings) {
    this.#validateServings(servings);
    this.#servingsRequired = servings;
  };
  get recipes() {
    return this.#recipes;
  };
  get servingsByRecipeID() {
    this.#syncRecipeServings();
    return { ...this.#servingsByRecipeID };
  };
  addRecipe(recipe, servings = 1) {
    this.#validateServings(servings);
    const addedRecipe = this.#recipes.addRecipe(recipe);
    this.#servingsByRecipeID[recipe.ID] = servings;
    return addedRecipe;
  };
  removeRecipeByID(id) {
    const removedRecipe = this.#recipes.removeRecipeByID(id);
    if (removedRecipe) {
      delete this.#servingsByRecipeID[id];
    }
    return removedRecipe;
  };
  updateRecipe(recipe, servings) {
    if (servings !== undefined) {
      this.#validateServings(servings);
    }
    const updatedRecipe = this.#recipes.updateRecipe(recipe);
    if (servings !== undefined) {
      this.#servingsByRecipeID[recipe.ID] = servings;
    }
    return updatedRecipe;
  };
  getRecipeServings(recipeID) {
    if (!this.#recipes.getRecipeByID(recipeID)) {
      return undefined;
    }
    this.#syncRecipeServings();
    return this.#servingsByRecipeID[recipeID];
  };
  setRecipeServings(recipeID, servings) {
    this.#validateServings(servings);
    if (!this.#recipes.getRecipeByID(recipeID)) {
      throw new Error(`No recipe exists with ID "${recipeID}"`);
    }
    this.#servingsByRecipeID[recipeID] = servings;
    return servings;
  };
  clearRecipes() {
    this.#recipes.clearAll();
    this.#servingsByRecipeID = {};
  };
};
