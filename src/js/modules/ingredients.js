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
    console.log('quantifiedingredients importmealsdbjson static');
    console.log(json);
    instance.#importMealsDBJSON(json);
    console.log('quantifiedingredients importmealsdbjson static end');
    console.log(instance);
    return instance;
  }
  #collection;
  #index;
  #toJSON() {
    return {
      collection: this.#collection,
      index: this.#index
    };
  }
  #fromJSON(json) {
    console.log('quantifiedIngredients fromJSON')
    console.log(json);
    if (json && json.collection) {
      this.#collection = Object.keys(json.collection).reduce((acc, key) => {
        acc[key] = QuantifiedIngredient.fromJSON(json.collection[key]);
        acc[json.collection[key].ingredient] = key;
        return acc;
      }, {});
    }
  }
  #importMealsDBJSON(json) {
    console.log('quantifiedIngredients importMealsDBJSON')
    console.log(json);
    this.#collection = Object.keys(json || {}).reduce((acc, indexKey) => {
      const dataItem = json[indexKey];
      if (dataItem && dataItem.ingredient && dataItem.ingredient.trim() !== "") {
        acc[indexKey] = QuantifiedIngredient.importMealsDBJSON(new QuantifiedIngredient(), dataItem);
        //this.#index[dataItem.ingredient.trim()] = indexKey;
      }
      return acc;
    }, {});
    console.log('quantifiedIngredients importMealsDBJSON end')
    console.log(this);
  }
  constructor() {
    console.log('QuantifiedIngredients constructor')
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
    console.log('quantifiedIngredient fromJSON')
    console.log(json);
    if (json && json.measure !== undefined && json.ingredient !== undefined) {
      this.#measure = json.measure;
      this.#ingredient = json.ingredient;
    }
  }
  #importMealsDBJSON(json) {
    console.log('quantifiedIngredient importMealsDBJSON')
    console.log(json);
    if (json) {
      this.#measure = json.measure ? json.measure.trim() : "";
      this.#ingredient = json.ingredient ? json.ingredient.trim() : "";
    }
  }
  constructor() {
    console.log('QuantifiedIngredient constructor')
  }
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
