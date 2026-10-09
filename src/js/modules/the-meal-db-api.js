import {
  fetchRequest
} from '../utils.js'
import {
  Cache
} from './storage.js'

/*
https://www.themealdb.com/api/json/v1/1/search.php?s=Arrabiata
https://www.themealdb.com/api/json/v1/1/search.php?f=a
https://www.themealdb.com/api/json/v1/1/lookup.php?i=52772
https://www.themealdb.com/api/json/v1/1/random.php
https://www.themealdb.com/api/json/v1/1/categories.php
https://www.themealdb.com/api/json/v1/1/list.php?c=list
https://www.themealdb.com/api/json/v1/1/list.php?a=list
https://www.themealdb.com/api/json/v1/1/list.php?i=list
https://www.themealdb.com/api/json/v1/1/filter.php?i=chicken_breast
https://www.themealdb.com/api/json/v1/1/filter.php?c=Seafood
https://www.themealdb.com/api/json/v1/1/filter.php?a=Canada
https://www.themealdb.com/api/json/v1/1/filter.php?a=Canadian
https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg
https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg/small
https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg/medium
https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg/large
https://www.themealdb.com/images/ingredients/olive_oil.png
https://www.themealdb.com/images/ingredients/olive_oil.png/small
https://www.themealdb.com/images/ingredients/olive_oil.png/medium
https://www.themealdb.com/images/ingredients/olive_oil.png/large
*/
export class TheMealDBAPI {
  static baseURL = "https://www.themealdb.com/";
  static apiPath = "api/json/v1/1/";
  static searchFunction = "search.php?";
  static searchByStringQuery = "s=";
  static searchByFirstCharQuery = "f=";
  static lookupFunction = "lookup.php?";
  static lookupByIDCharQuery = "i=";
  static randomFunction = "random.php";
  static categoriesFunction = "categories.php";
  static listFunction = "list.php?";
  static listCategoriesOption = "c=list";
  static listAreasOption = "a=list";
  static listIngredientsOption = "i=list";
  static filterFunction = "filter.php?";
  static filterByIngredientQuery = "i=";
  static filterByCategoryQuery = "c=";
  static filterByAreaQuery = "a=";
  static apiMealImagesPath = "images/media/meals/";
  static apiIngredientImagesPath = "images/ingredients/";
  static imageOptions = {
    thumbnail: "",
    small: "/small",
    medium: "/medium",
    large: "/large"
  }
  #localCache;
  async #fetch(request) {
    const response = await fetchRequest(request);
    return await response
  }
  #hasCache(key) {
    return this.#localCache.hasCache(key);
  }
  #getCache(key) {
    return this.#localCache.getCache(key);
  }
  #setCache(key, value) {
    this.#localCache.setCache(key, value);
  }
  #deleteCache(key) {
    this.#localCache.deleteCache(key);
  }
  constructor(isSessionCache = true) {
    this.#localCache = new Cache({
      isSessionCache: isSessionCache
    });
  }
  clearCache() {
    this.#localCache.clearCache();
  }
  async searchMealsByStringQuery(string, cache = true) {
    const cacheKey = `Meals-str-${string}`;
    if (!this.#hasCache(cacheKey)) {
      const request = `${TheMealDBAPI.baseURL}${TheMealDBAPI.apiPath}${TheMealDBAPI.searchFunction}${TheMealDBAPI.searchByStringQuery}${string}`;
      this.#setCache(cacheKey, await this.#fetch(request));
    }
    if (cache) {
      return this.#getCache(cacheKey);
    } else {
      const response = this.#getCache(cacheKey);
      this.#deleteCache(cacheKey);
      return response;
    }
  }
  async searchMealsByFirstCharQuery(firstChar, cache = true) {
    const cacheKey = `Meals-fc-${firstChar}`;
    if (!this.#hasCache(cacheKey)) {
      const request = `${TheMealDBAPI.baseURL}${TheMealDBAPI.apiPath}${TheMealDBAPI.searchFunction}${TheMealDBAPI.searchByFirstCharQuery}${firstChar}`;
      this.#setCache(cacheKey, await this.#fetch(request));
    }
    if (cache) {
      return this.#getCache(cacheKey);
    } else {
      const response = this.#getCache(cacheKey);
      this.#deleteCache(cacheKey);
      return response;
    }
  }
  async lookupMealByIDCharQuery(id, cache = true) {
    const cacheKey = `Meals-id-${id}`;
    if (!this.#hasCache(cacheKey)) {
      const request = `${TheMealDBAPI.baseURL}${TheMealDBAPI.apiPath}${TheMealDBAPI.lookupFunction}${TheMealDBAPI.lookupByIDCharQuery}${id}`;
      this.#setCache(cacheKey, await this.#fetch(request));
    }
    if (cache) {
      return this.#getCache(cacheKey);
    } else {
      const response = this.#getCache(cacheKey);
      this.#deleteCache(cacheKey);
      return response;
    }
  }
  async RandomMeal() {
    const request = `${TheMealDBAPI.baseURL}${TheMealDBAPI.apiPath}${TheMealDBAPI.randomFunction}`;
    return await this.#fetch(request);
  }
  async MealCategories(cache = true) {
    const cacheKey = `Categories`;
    if (!this.#hasCache(cacheKey)) {
      const request = `${TheMealDBAPI.baseURL}${TheMealDBAPI.apiPath}${TheMealDBAPI.categoriesFunction}`;
      this.#setCache(cacheKey, await this.#fetch(request));
    }
    if (cache) {
      return this.#getCache(cacheKey);
    } else {
      const response = this.#getCache(cacheKey);
      this.#deleteCache(cacheKey);
      return response;
    }
  }
  async MealCategoriesList(cache = true) {
    const cacheKey = `List-Categories`;
    if (!this.#hasCache(cacheKey)) {
      const request = `${TheMealDBAPI.baseURL}${TheMealDBAPI.apiPath}${TheMealDBAPI.listFunction}${TheMealDBAPI.listCategoriesOption}`;
      this.#setCache(cacheKey, await this.#fetch(request));
    }
    if (cache) {
      return this.#getCache(cacheKey);
    } else {
      const response = this.#getCache(cacheKey);
      this.#deleteCache(cacheKey);
      return response;
    }
  }
  async MealAreasList(cache = true) {
    const cacheKey = `List-Areas`;
    if (!this.#hasCache(cacheKey)) {
      const request = `${TheMealDBAPI.baseURL}${TheMealDBAPI.apiPath}${TheMealDBAPI.listFunction}${TheMealDBAPI.listAreasOption}`;
      this.#setCache(cacheKey, await this.#fetch(request));
    }
    if (cache) {
      return this.#getCache(cacheKey);
    } else {
      const response = this.#getCache(cacheKey);
      this.#deleteCache(cacheKey);
      return response;
    }
  }
  async MealIngredientsList(cache = true) {
    const cacheKey = `List-Ingredients`;
    if (!this.#hasCache(cacheKey)) {
      const request = `${TheMealDBAPI.baseURL}${TheMealDBAPI.apiPath}${TheMealDBAPI.listFunction}${TheMealDBAPI.listIngredientsOption}`;
      this.#setCache(cacheKey, await this.#fetch(request));
    }
    if (cache) {
      return this.#getCache(cacheKey);
    } else {
      const response = this.#getCache(cacheKey);
      this.#deleteCache(cacheKey);
      return response;
    }
  }
  async filterMealsByIngredientQuery(ingredient, cache = true) {
    const cacheKey = `Meals-Filter-Ingredient-${ingredient}`;
    if (!this.#hasCache(cacheKey)) {
      const request = `${TheMealDBAPI.baseURL}${TheMealDBAPI.apiPath}${TheMealDBAPI.filterFunction}${TheMealDBAPI.filterByIngredientQuery}${ingredient}`;
      this.#setCache(cacheKey, await this.#fetch(request));
    }
    if (cache) {
      return this.#getCache(cacheKey);
    } else {
      const response = this.#getCache(cacheKey);
      this.#deleteCache(cacheKey);
      return response;
    }
  }
  async filterMealsByCategoryQuery(category, cache = true) {
    const cacheKey = `Meals-Filter-Category-${category}`;
    if (!this.#hasCache(cacheKey)) {
      const request = `${TheMealDBAPI.baseURL}${TheMealDBAPI.apiPath}${TheMealDBAPI.filterFunction}${TheMealDBAPI.filterByCategoryQuery}${category}`;
      this.#setCache(cacheKey, await this.#fetch(request));
    }
    if (cache) {
      return this.#getCache(cacheKey);
    } else {
      const response = this.#getCache(cacheKey);
      this.#deleteCache(cacheKey);
      return response;
    }
  }
  async filterMealsByAreaQuery(area, cache = true) {
    const cacheKey = `Meals-Filter-Area-${area}`;
    if (!this.#hasCache(cacheKey)) {
      const request = `${TheMealDBAPI.baseURL}${TheMealDBAPI.apiPath}${TheMealDBAPI.filterFunction}${TheMealDBAPI.filterByAreaQuery}${area}`;
      this.#setCache(cacheKey, await this.#fetch(request));
    }
    if (cache) {
      return this.#getCache(cacheKey);
    } else {
      const response = this.#getCache(cacheKey);
      this.#deleteCache(cacheKey);
      return response;
    }
  }
  mealThumbnailImageURL(imageFileName, cache = true) {
    const cacheKey = `Meal-URL-Thumbnail-${imageFileName}`;
    if (!this.#hasCache(cacheKey)) {
      this.#setCache(cacheKey, `${TheMealDBAPI.baseURL}${TheMealDBAPI.apiMealImagesPath}${imageFileName}${TheMealDBAPI.imageOptions['thumbnail']}`);
    }
    if (cache) {
      return this.#getCache(cacheKey);
    } else {
      const response = this.#getCache(cacheKey);
      this.#deleteCache(cacheKey);
      return response;
    }
  }
  mealSmallImageURL(imageFileName, cache = true) {
    const cacheKey = `Meal-URL-Small-${imageFileName}`;
    if (!this.#hasCache(cacheKey)) {
      this.#setCache(cacheKey, `{TheMealDBAPI.baseURL}${TheMealDBAPI.apiMealImagesPath}${imageFileName}${TheMealDBAPI.imageOptions['small']}`);
    }
    if (cache) {
      return this.#getCache(cacheKey);
    } else {
      const response = this.#getCache(cacheKey);
      this.#deleteCache(cacheKey);
      return response;
    }
  }
  mealMediumImageURL(imageFileName, cache = true) {
    const cacheKey = `Meal-URL-Medium-${imageFileName}`;
    if (!this.#hasCache(cacheKey)) {
      this.#setCache(cacheKey, `{TheMealDBAPI.baseURL}${TheMealDBAPI.apiMealImagesPath}${imageFileName}${TheMealDBAPI.imageOptions['medium']}`);
    }
    if (cache) {
      return this.#getCache(cacheKey);
    } else {
      const response = this.#getCache(cacheKey);
      this.#deleteCache(cacheKey);
      return response;
    }
  }
  mealLargeImageURL(imageFileName, cache = true) {
    const cacheKey = `Meal-URL-Large-${imageFileName}`;
    if (!this.#hasCache(cacheKey)) {
      this.#setCache(cacheKey, `${TheMealDBAPI.baseURL}${TheMealDBAPI.apiMealImagesPath}${imageFileName}${TheMealDBAPI.imageOptions['large']}`);
    }
    if (cache) {
      return this.#getCache(cacheKey);
    } else {
      const response = this.#getCache(cacheKey);
      this.#deleteCache(cacheKey);
      return response;
    }
  }
  ingredientThumbnailImageURL(imageFileName, cache = true) {
    const cacheKey = `Ingredient-URL-Thumbnail-${imageFileName}`;
    if (!this.#hasCache(cacheKey)) {
      this.#setCache(cacheKey, `${TheMealDBAPI.baseURL}${TheMealDBAPI.apiIngredientImagesPath}${imageFileName}${TheMealDBAPI.imageOptions['thumbnail']}`);
    }
    if (cache) {
      return this.#getCache(cacheKey);
    } else {
      const response = this.#getCache(cacheKey);
      this.#deleteCache(cacheKey);
      return response;
    }
  }
  ingredientSmallImageURL(imageFileName, cache = true) {
    const cacheKey = `Ingredient-URL-Small-${imageFileName}`;
    if (!this.#hasCache(cacheKey)) {
      this.#setCache(cacheKey, `{TheMealDBAPI.baseURL}${TheMealDBAPI.apiIngredientImagesPath}${imageFileName}${TheMealDBAPI.imageOptions['small']}`);
    }
    if (cache) {
      return this.#getCache(cacheKey);
    } else {
      const response = this.#getCache(cacheKey);
      this.#deleteCache(cacheKey);
      return response;
    }
  }
  ingredientMediumImageURL(imageFileName, cache = true) {
    const cacheKey = `Ingredient-URL-Medium-${imageFileName}`;
    if (!this.#hasCache(cacheKey)) {
      this.#setCache(cacheKey, `${TheMealDBAPI.baseURL}${TheMealDBAPI.apiIngredientImagesPath}${imageFileName}${TheMealDBAPI.imageOptions['medium']}`);
    }
    if (cache) {
      return this.#getCache(cacheKey);
    } else {
      const response = this.#getCache(cacheKey);
      this.#deleteCache(cacheKey);
      return response;
    }
  }
  ingredientLargeImageURL(imageFileName, cache = true) {
    const cacheKey = `Ingredient-URL-Large-${imageFileName}`;
    if (!this.#hasCache(cacheKey)) {
      this.#setCache(cacheKey, `${TheMealDBAPI.baseURL}${TheMealDBAPI.apiIngredientImagesPath}${imageFileName}${TheMealDBAPI.imageOptions['large']}`);
    }
    if (cache) {
      return this.#getCache(cacheKey);
    } else {
      const response = this.#getCache(cacheKey);
      this.#deleteCache(cacheKey);
      return response;
    }
  }
}
