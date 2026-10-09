export class QuantifiedIngredients {
  static fromJSON(json) {
    const instance = new QuantifiedIngredients();
    instance.#fromJSON(json);
    return instance;
  }
  static importMealsDBJSON(original, json) {
    let instance;
    if (json === undefined) {
      instance = new QuantifiedIngredients();
      json = original;
    } else {
      if (original instanceof QuantifiedIngredients) {
        instance = original;
      } else {
        instance = original instanceof QuantifiedIngredients ? original : new QuantifiedIngredients();
      }
    }
    instance.#importMealsDBJSON(json);
    return instance;
  }
  #collection;
  #index;
  #rebuildIndex() {
    this.#index = Object.keys(this.#collection).reduce((index, key) => {
      const name = this.#collection[key].Name;
      if (name) {
        index[name] = key;
      }
      return index;
    }, {});
  }
  #toJSON() {
    return {
      collection: this.#collection,
      index: this.#index
    };
  }
  #fromJSON(json) {
    if (json && json.collection) {
      this.#collection = {};
      this.#index = {};
      Object.keys(json.collection).forEach(key => {
        const ingredientJSON = json.collection[key];
        if (!ingredientJSON || typeof ingredientJSON !== 'object' || !('ingredient' in ingredientJSON)) {
          return;
        }
        const ingredient = QuantifiedIngredient.fromJSON(ingredientJSON);
        this.#collection[key] = ingredient;
        if (ingredient.Name) {
          this.#index[ingredient.Name] = key;
        }
      });
    }
  }
  #importMealsDBJSON(json) {
    const collection = { ...this.#collection };
    Object.keys(json || {}).forEach(indexKey => {
      const dataItem = json[indexKey];
      if (dataItem && typeof dataItem.ingredient === 'string' && dataItem.ingredient.trim() !== "") {
        collection[indexKey] = QuantifiedIngredient.importMealsDBJSON(
          collection[indexKey] || new QuantifiedIngredient(),
          dataItem
        );
      }
    });
    this.#collection = collection;
    this.#rebuildIndex();
  }
  constructor() {
    this.#collection = {};
    this.#index = {};
  }
  toJSON() {
    return this.#toJSON();
  }
  getIngredientByIndex(index) {
    return this.#collection[index];
  }
  getIngredientByName(name) {
    return this.#collection[this.#index[name]];
  }
  addIngredient(index, ingredient) {
    if (!(ingredient instanceof QuantifiedIngredient)) {
      throw new TypeError('ingredient must be a QuantifiedIngredient instance');
    }
    if (index === undefined || index === null || String(index).trim() === '') {
      throw new TypeError('ingredient index must not be empty');
    }
    if (Object.prototype.hasOwnProperty.call(this.#collection, index)) {
      throw new Error(`An ingredient already exists at index "${index}"`);
    }
    this.#collection[index] = ingredient;
    this.#rebuildIndex();
    return ingredient;
  }
  removeIngredientByIndex(index) {
    const ingredient = this.#collection[index];
    if (ingredient) {
      delete this.#collection[index];
      this.#rebuildIndex();
    }
    return ingredient;
  }
  updateIngredient(index, ingredient) {
    if (!(ingredient instanceof QuantifiedIngredient)) {
      throw new TypeError('ingredient must be a QuantifiedIngredient instance');
    }
    if (index === undefined || index === null || String(index).trim() === '') {
      throw new TypeError('ingredient index must not be empty');
    }
    if (!Object.prototype.hasOwnProperty.call(this.#collection, index)) {
      throw new Error(`No ingredient exists at index "${index}"`);
    }
    this.#collection[index] = ingredient;
    this.#rebuildIndex();
    return ingredient;
  }
  clearAll() {
    this.#collection = {};
    this.#index = {};
  }
}
export class QuantifiedIngredient {
  static fromJSON(json) {
    const instance = new QuantifiedIngredient();
    instance.#fromJSON(json);
    return instance;
  }
  static importMealsDBJSON(original, json) {
    let instance;
    if (json === undefined) {
      instance = new QuantifiedIngredient();
      json = original;
    } else {
      if (original instanceof QuantifiedIngredient) {
        instance = original;
      } else {
        instance = original instanceof QuantifiedIngredient ? original : new QuantifiedIngredient();
      }
    }
    instance.#importMealsDBJSON(json);
    return instance;
  }
  #measure;
  #ingredient;
  #toJSON() {
    return {
      measure: this.#measure,
      ingredient: this.#ingredient
    };
  }
  #fromJSON(json) {
    if (json && json.measure !== undefined && json.ingredient !== undefined) {
      this.#measure = json.measure;
      this.#ingredient = json.ingredient;
    }
  }
  #importMealsDBJSON(json) {
    if (json) {
      this.#measure = json.measure ? json.measure.trim() : "";
      this.#ingredient = json.ingredient ? json.ingredient.trim() : "";
    }
  }
  constructor() {}
  toJSON() {
    return this.#toJSON();
  }
  get Measure() {
    return this.#measure;
  }
  get Name() {
    return this.#ingredient;
  }
}
