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
  #recipeIDs;
  #servingsByRecipeID;
  #syncRecipeServings() {
    this.#servingsByRecipeID = this.#recipeIDs.reduce((servings, recipeID) => {
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
      recipeIDs: this.#recipeIDs,
      servingsByRecipeID: this.#servingsByRecipeID
    };
  };
  #fromJSON(json) {
    if (json && json.id !== undefined && json.name !== undefined) {
      this.#ID = json.id;
      this.#Name = json.name;
      this.#servingsRequired = json.servingsRequired ?? 1;
      this.#validateServings(this.#servingsRequired);
      this.#recipeIDs = Array.isArray(json.recipeIDs) ? [...new Set(json.recipeIDs.map(String))] :
        Object.keys(json.recipes?.collection || {});
      if (!this.#recipeIDs.length && json.recipes?.collection) {
        this.#recipeIDs = Object.keys(json.recipes.collection);
      }
      this.#servingsByRecipeID = json.servingsByRecipeID || {};
      this.#syncRecipeServings();
    }
  };
  constructor({
    id = null,
    name = '',
    servingsRequired = 1,
    recipes = [],
    servingsByRecipeID = {}
  } = {}) {
    this.#ID = id;
    this.#Name = name;
    this.#validateServings(servingsRequired);
    this.#servingsRequired = servingsRequired;
    this.#recipeIDs = Array.isArray(recipes) ? [...new Set(recipes.map(String))] :
      Object.keys(recipes?.collection || {});
    this.#servingsByRecipeID = {
      ...servingsByRecipeID
    };
    Object.keys(this.#servingsByRecipeID).forEach(recipeID => {
      if (!this.#recipeIDs.includes(recipeID)) {
        this.#recipeIDs.push(recipeID);
      }
    });
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
    return [...this.#recipeIDs];
  };
  get recipeIDs() {
    return [...this.#recipeIDs];
  };
  get servingsByRecipeID() {
    this.#syncRecipeServings();
    return {
      ...this.#servingsByRecipeID
    };
  };
  addRecipe(recipe, servings = 1) {
    this.#validateServings(servings);
    const recipeID = typeof recipe === 'object' && recipe !== null ? recipe.ID : recipe;
    if (recipeID === undefined || recipeID === null || String(recipeID).trim() === '') {
      throw new TypeError('recipe must have an ID');
    }
    const normalizedID = String(recipeID);
    if (this.#recipeIDs.includes(normalizedID)) {
      throw new Error(`Recipe "${normalizedID}" is already in this meal`);
    }
    this.#recipeIDs.push(normalizedID);
    this.#servingsByRecipeID[normalizedID] = servings;
    return normalizedID;
  };
  removeRecipeByID(id) {
    const recipeID = String(id);
    const index = this.#recipeIDs.indexOf(recipeID);
    if (index !== -1) {
      this.#recipeIDs.splice(index, 1);
      delete this.#servingsByRecipeID[recipeID];
      return recipeID;
    }
    return undefined;
  };
  updateRecipe(recipe, servings) {
    if (servings !== undefined) {
      this.#validateServings(servings);
    }
    const recipeID = String(typeof recipe === 'object' && recipe !== null ? recipe.ID : recipe);
    if (!this.#recipeIDs.includes(recipeID)) {
      throw new Error(`No recipe exists with ID "${recipeID}" in this meal`);
    }
    if (servings !== undefined) {
      this.#servingsByRecipeID[recipeID] = servings;
    }
    return recipeID;
  };
  getRecipeServings(recipeID) {
    recipeID = String(recipeID);
    if (!this.#recipeIDs.includes(recipeID)) {
      return undefined;
    }
    this.#syncRecipeServings();
    return this.#servingsByRecipeID[recipeID];
  };
  setRecipeServings(recipeID, servings) {
    this.#validateServings(servings);
    recipeID = String(recipeID);
    if (!this.#recipeIDs.includes(recipeID)) {
      throw new Error(`No recipe exists with ID "${recipeID}"`);
    }
    this.#servingsByRecipeID[recipeID] = servings;
    return servings;
  };
  clearRecipes() {
    this.#recipeIDs = [];
    this.#servingsByRecipeID = {};
  };
};
