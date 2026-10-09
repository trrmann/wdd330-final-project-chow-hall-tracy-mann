import {
  Recipes
} from './recipes'
export class Meals {

}
export class Meal {
  #recipes;
  constructor() {
    this.#recipes = new Recipes();
  }
  get recipes() {
    return this.#recipes
  }
}
