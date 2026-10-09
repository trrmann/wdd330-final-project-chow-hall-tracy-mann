import {
  fetchRequest
} from '../utils.js'
import {
  Cache
} from './storage.js'
import {
  APIRequestQueue,
  apiRequestQueue
} from './api-request-queue.js'

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
  static get baseURL() {
    return APIRequestQueue.providers.themealdb.baseURL;
  }
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
      isSessionCache: isSessionCache,
      namespace: 'themealdb'
    });
  }
  async #cachedRequest(cacheKey, request, cache = true) {
    const response = await apiRequestQueue.run({
      api: 'themealdb',
      cache: this.#localCache,
      cacheKey,
      request: () => fetchRequest(request)
    });
    if (!cache) {
      this.#deleteCache(cacheKey);
    }
    return response;
  }
  clearCache() {
    this.#localCache.clearCache();
  }
  async searchMealsByStringQuery(string, cache = true) {
    const cacheKey = `Meals-str-${string}`;
    const request = `${TheMealDBAPI.baseURL}${TheMealDBAPI.apiPath}${TheMealDBAPI.searchFunction}${TheMealDBAPI.searchByStringQuery}${string}`;
    return this.#cachedRequest(cacheKey, request, cache);
  }
  async searchMealsByFirstCharQuery(firstChar, cache = true) {
    const cacheKey = `Meals-fc-${firstChar}`;
    const request = `${TheMealDBAPI.baseURL}${TheMealDBAPI.apiPath}${TheMealDBAPI.searchFunction}${TheMealDBAPI.searchByFirstCharQuery}${firstChar}`;
    return this.#cachedRequest(cacheKey, request, cache);
  }
  async lookupMealByIDCharQuery(id, cache = true) {
    const cacheKey = `Meals-id-${id}`;
    const request = `${TheMealDBAPI.baseURL}${TheMealDBAPI.apiPath}${TheMealDBAPI.lookupFunction}${TheMealDBAPI.lookupByIDCharQuery}${id}`;
    return this.#cachedRequest(cacheKey, request, cache);
  }
  RandomMeal() {
    const request = `${TheMealDBAPI.baseURL}${TheMealDBAPI.apiPath}${TheMealDBAPI.randomFunction}`;
    return apiRequestQueue.run({
      api: 'themealdb',
      request: () => fetchRequest(request)
    });
  }
  async MealCategories(cache = true) {
    const cacheKey = `Categories`;
    const request = `${TheMealDBAPI.baseURL}${TheMealDBAPI.apiPath}${TheMealDBAPI.categoriesFunction}`;
    return this.#cachedRequest(cacheKey, request, cache);
  }
  async MealCategoriesList(cache = true) {
    const cacheKey = `List-Categories`;
    const request = `${TheMealDBAPI.baseURL}${TheMealDBAPI.apiPath}${TheMealDBAPI.listFunction}${TheMealDBAPI.listCategoriesOption}`;
    return this.#cachedRequest(cacheKey, request, cache);
  }
  async MealAreasList(cache = true) {
    const cacheKey = `List-Areas`;
    const request = `${TheMealDBAPI.baseURL}${TheMealDBAPI.apiPath}${TheMealDBAPI.listFunction}${TheMealDBAPI.listAreasOption}`;
    return this.#cachedRequest(cacheKey, request, cache);
  }
  async MealIngredientsList(cache = true) {
    const cacheKey = `List-Ingredients`;
    const request = `${TheMealDBAPI.baseURL}${TheMealDBAPI.apiPath}${TheMealDBAPI.listFunction}${TheMealDBAPI.listIngredientsOption}`;
    return this.#cachedRequest(cacheKey, request, cache);
  }
  async filterMealsByIngredientQuery(ingredient, cache = true) {
    const cacheKey = `Meals-Filter-Ingredient-${ingredient}`;
    const request = `${TheMealDBAPI.baseURL}${TheMealDBAPI.apiPath}${TheMealDBAPI.filterFunction}${TheMealDBAPI.filterByIngredientQuery}${ingredient}`;
    return this.#cachedRequest(cacheKey, request, cache);
  }
  async filterMealsByCategoryQuery(category, cache = true) {
    const cacheKey = `Meals-Filter-Category-${category}`;
    const request = `${TheMealDBAPI.baseURL}${TheMealDBAPI.apiPath}${TheMealDBAPI.filterFunction}${TheMealDBAPI.filterByCategoryQuery}${category}`;
    return this.#cachedRequest(cacheKey, request, cache);
  }
  async filterMealsByAreaQuery(area, cache = true) {
    const cacheKey = `Meals-Filter-Area-${area}`;
    const request = `${TheMealDBAPI.baseURL}${TheMealDBAPI.apiPath}${TheMealDBAPI.filterFunction}${TheMealDBAPI.filterByAreaQuery}${area}`;
    return this.#cachedRequest(cacheKey, request, cache);
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
