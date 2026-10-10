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
  #executedAt;
  #recipeWrappers;
  #validateMealServings(servings) {
    if (!Number.isSafeInteger(servings) || servings <= 0) {
      throw new TypeError('meal servings must be a positive whole number');
    }
  };
  #validateServings(servings) {
    if (typeof servings !== 'number' || !Number.isFinite(servings) || servings <= 0) {
      throw new TypeError('servings must be a finite number greater than zero');
    }
  };
  #toJSON() {
    return {
      id: this.#ID,
      name: this.#Name,
      servingsRequired: this.#servingsRequired,
      executedAt: this.#executedAt,
      recipeIDs: this.recipeIDs,
      recipeWrappers: this.#recipeWrappers.map(wrapper => wrapper.toJSON())
    };
  };
  #fromJSON(json) {
    if (json && json.id !== undefined && json.name !== undefined) {
      this.#ID = json.id;
      this.#Name = json.name;
      this.#executedAt = typeof json.executedAt === 'string' ? json.executedAt : null;
      const storedMealServings = Number(json.servingsRequired ?? 1);
      this.#servingsRequired = Number.isSafeInteger(storedMealServings) && storedMealServings > 0 ?
        storedMealServings :
        Math.max(1, Math.round(storedMealServings) || 1);
      this.#validateMealServings(this.#servingsRequired);
      const legacyRecipeIDs = Array.isArray(json.recipeIDs) ? json.recipeIDs.map(String) :
        Object.keys(json.recipes?.collection || {});
      if (Array.isArray(json.recipeWrappers)) {
        this.#recipeWrappers = json.recipeWrappers.map(wrapper => RecipeMealWrapper.fromJSON(wrapper));
      } else {
        const legacyServings = json.servingsByRecipeID || {};
        this.#recipeWrappers = [...new Set(legacyRecipeIDs)].map(recipeID =>
          new RecipeMealWrapper({
            recipeID,
            servingsProduced: legacyServings[recipeID] ?? 1,
            servingsNeeded: Math.max(
              1,
              Math.min(Math.round(Number(legacyServings[recipeID]) || 1), this.#servingsRequired)
            )
          })
        );
      }
    }
  };
  constructor({
    id = null,
    name = '',
    servingsRequired = 1,
    executedAt = null,
    recipes = [],
    servingsByRecipeID = {},
    recipeWrappers = null
  } = {}) {
    this.#ID = id;
    this.#Name = name;
    this.#executedAt = executedAt;
    this.#validateMealServings(servingsRequired);
    this.#servingsRequired = servingsRequired;
    const recipeIDs = Array.isArray(recipes) ? [...new Set(recipes.map(String))] :
      Object.keys(recipes?.collection || {});
    this.#recipeWrappers = Array.isArray(recipeWrappers) ?
      recipeWrappers.map(wrapper => RecipeMealWrapper.fromJSON(wrapper)) :
      recipeIDs.map(recipeID => new RecipeMealWrapper({
        recipeID,
        servingsProduced: servingsByRecipeID[recipeID] ?? 1,
        servingsNeeded: Math.max(
          1,
          Math.min(Math.round(Number(servingsByRecipeID[recipeID]) || 1), servingsRequired)
        )
      }));
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
  set Name(name) {
    if (typeof name !== 'string' || !name.trim()) {
      throw new TypeError('meal name must not be empty');
    }
    this.#Name = name.trim();
  };
  get isExecuted() {
    return this.#executedAt !== null;
  };
  get executedAt() {
    return this.#executedAt;
  };
  markExecuted(executedAt = new Date().toISOString()) {
    if (this.isExecuted) {
      throw new Error('This meal has already been executed');
    }
    this.#executedAt = executedAt;
  };
  get servingsRequired() {
    return this.#servingsRequired;
  };
  set servingsRequired(servings) {
    this.#validateMealServings(servings);
    this.#servingsRequired = servings;
  };
  get recipes() {
    return this.recipeIDs;
  };
  get recipeIDs() {
    return this.#recipeWrappers.map(wrapper => wrapper.recipeID);
  };
  get recipeWrappers() {
    return [...this.#recipeWrappers];
  };
  addRecipe(recipe, servingsProduced = 1, servingsNeeded = 1) {
    this.#validateServings(servingsProduced);
    this.#validateMealServings(servingsNeeded);
    const recipeID = typeof recipe === 'object' && recipe !== null ? recipe.ID : recipe;
    if (recipeID === undefined || recipeID === null || String(recipeID).trim() === '') {
      throw new TypeError('recipe must have an ID');
    }
    const normalizedID = String(recipeID);
    if (this.#recipeWrappers.some(wrapper => wrapper.recipeID === normalizedID)) {
      throw new Error(`Recipe "${normalizedID}" is already in this meal`);
    }
    this.#recipeWrappers.push(new RecipeMealWrapper({
      recipeID: normalizedID,
      servingsProduced,
      servingsNeeded
    }));
    return normalizedID;
  };
  removeRecipeByID(id) {
    const recipeID = String(id);
    const index = this.#recipeWrappers.findIndex(wrapper => wrapper.recipeID === recipeID);
    if (index !== -1) {
      this.#recipeWrappers.splice(index, 1);
      return recipeID;
    }
    return undefined;
  };
  updateRecipe(recipe, servings) {
    if (servings !== undefined) {
      this.#validateServings(servings);
    }
    const recipeID = String(typeof recipe === 'object' && recipe !== null ? recipe.ID : recipe);
    const wrapper = this.#recipeWrappers.find(item => item.recipeID === recipeID);
    if (!wrapper) {
      throw new Error(`No recipe exists with ID "${recipeID}" in this meal`);
    }
    if (servings !== undefined) {
      wrapper.servingsProduced = servings;
    }
    return recipeID;
  };
  getRecipeServings(recipeID) {
    return this.getRecipeWrapper(recipeID)?.servingsProduced;
  };
  getRecipeWrapper(recipeID) {
    return this.#recipeWrappers.find(wrapper => wrapper.recipeID === String(recipeID));
  };
  setRecipeServings(recipeID, servings) {
    this.#validateServings(servings);
    recipeID = String(recipeID);
    const wrapper = this.#recipeWrappers.find(item => item.recipeID === recipeID);
    if (!wrapper) {
      throw new Error(`No recipe exists with ID "${recipeID}"`);
    }
    wrapper.servingsProduced = servings;
    return servings;
  };
  clearRecipes() {
    this.#recipeWrappers = [];
  };
};

export class RecipeMealWrapper {
  static fromJSON(json) {
    return new RecipeMealWrapper(json);
  };
  #recipeID;
  #servingsProduced;
  #servingsNeeded;
  constructor({
    recipeID,
    servingsProduced = 1,
    servingsNeeded = 1
  } = {}) {
    if (recipeID === undefined || recipeID === null || String(recipeID).trim() === '') {
      throw new TypeError('recipe wrapper requires a recipe ID');
    }
    this.#recipeID = String(recipeID);
    this.servingsProduced = servingsProduced;
    this.servingsNeeded = servingsNeeded;
  };
  toJSON() {
    return {
      recipeID: this.#recipeID,
      servingsProduced: this.#servingsProduced,
      servingsNeeded: this.#servingsNeeded
    };
  };
  get recipeID() {
    return this.#recipeID;
  };
  get servingsProduced() {
    return this.#servingsProduced;
  };
  set servingsProduced(servings) {
    if (typeof servings !== 'number' || !Number.isFinite(servings) || servings <= 0) {
      throw new TypeError('recipe servings produced must be greater than zero');
    }
    this.#servingsProduced = servings;
  };
  get servingsNeeded() {
    return this.#servingsNeeded;
  };
  set servingsNeeded(servings) {
    if (!Number.isSafeInteger(servings) || servings <= 0) {
      throw new TypeError('recipe servings needed must be a positive whole number');
    }
    this.#servingsNeeded = servings;
  };
  get recipeBatches() {
    return this.#servingsNeeded / this.#servingsProduced;
  };
  get ingredientMultiplier() {
    return this.recipeBatches;
  };
};
