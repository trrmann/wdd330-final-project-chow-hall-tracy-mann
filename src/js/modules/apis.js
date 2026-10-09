import {
  Cache
} from './storage.js'
import {
  TheMealDBAPI
} from './the-meal-db-api.js'
import {
  DictionaryAPI
} from './dictionary-api.js'
import {
  RestCountries
} from './rest-countries-api.js'

export class APIs {
  #localCache;
  #theMealDB;
  #restCountries;
  #dictionaryAPI;
  constructor(isSessionCache = true) {
    this.#localCache = new Cache({
      isSessionCache: isSessionCache
    });
    this.#theMealDB = new TheMealDBAPI();
    this.#restCountries = new RestCountries();
    this.#dictionaryAPI = new DictionaryAPI();
  }
  hasCache(key) {
    return this.#localCache.hasCache(key);
  }
  getCache(key) {
    return this.#localCache.getCache(key);
  }
  setCache(key, value) {
    this.#localCache.setCache(key, value);
  }
  deleteCache(key) {
    this.#localCache.deleteCache(key);
  }
  clearCache() {
    this.#localCache.clearCache();
  }
  async lookupDictionaryEntryByString(string, cache = true) {
    const cacheKey = `Dictionary-Entry-${string}`;
    if (!this.hasCache(cacheKey)) {
      this.setCache(cacheKey, await this.#dictionaryAPI.lookupEntryByString(string, !cache));
    }
    if (cache) {
      return this.getCache(cacheKey);
    } else {
      const response = this.getCache(cacheKey);
      this.deleteCache(cacheKey);
      return response;
    }
  }
  async searchMealsByStringQuery(string, cache = true) {
    const cacheKey = `Meal-String-${string}`;
    if (!this.hasCache(cacheKey)) {
      this.setCache(cacheKey, await this.#theMealDB.searchMealsByStringQuery(string, !cache));
    }
    if (cache) {
      return this.getCache(cacheKey);
    } else {
      const response = this.getCache(cacheKey);
      this.deleteCache(cacheKey);
      return response;
    }
  }
  async searchMealsByFirstCharQuery(firstChar, cache = true) {
    const cacheKey = `Meal-First-${firstChar}`;
    if (!this.hasCache(cacheKey)) {
      this.setCache(cacheKey, await this.#theMealDB.searchMealsByFirstCharQuery(firstChar, !cache));
    }
    if (cache) {
      return this.getCache(cacheKey);
    } else {
      const response = this.getCache(cacheKey);
      this.deleteCache(cacheKey);
      return response;
    }
  }
  async lookupMealByIDCharQuery(id, cache = true) {
    const cacheKey = `Meal-ID-${id}`;
    if (!this.hasCache(cacheKey)) {
      this.setCache(cacheKey, await this.#theMealDB.lookupMealByIDCharQuery(id, !cache));
    }
    if (cache) {
      return this.getCache(cacheKey);
    } else {
      const response = this.getCache(cacheKey);
      this.deleteCache(cacheKey);
      return response;
    }
  }
  async RandomMeal() {
    return await this.#theMealDB.RandomMeal();
  }
  async MealCategories(cache = true) {
    const cacheKey = `MealCategories`;
    if (!this.hasCache(cacheKey)) {
      this.setCache(cacheKey, await this.#theMealDB.MealCategories(!cache));
    }
    if (cache) {
      return this.getCache(cacheKey);
    } else {
      const response = this.getCache(cacheKey);
      this.deleteCache(cacheKey);
      return response;
    }
  }
  async MealCategoriesList(cache = true) {
    const cacheKey = `MealCategoriesList`;
    if (!this.hasCache(cacheKey)) {
      this.setCache(cacheKey, await this.#theMealDB.MealCategoriesList(!cache));
    }
    if (cache) {
      return this.getCache(cacheKey);
    } else {
      const response = this.getCache(cacheKey);
      this.deleteCache(cacheKey);
      return response;
    }
  }
  async MealAreasList(cache = true) {
    const cacheKey = `MealAreasList`;
    if (!this.hasCache(cacheKey)) {
      this.setCache(cacheKey, await this.#theMealDB.MealAreasList(!cache));
    }
    if (cache) {
      return this.getCache(cacheKey);
    } else {
      const response = this.getCache(cacheKey);
      this.deleteCache(cacheKey);
      return response;
    }
  }
  async MealIngredientsList(cache = true) {
    const cacheKey = `MealIngredientsList`;
    if (!this.hasCache(cacheKey)) {
      this.setCache(cacheKey, await this.#theMealDB.MealIngredientsList(!cache));
    }
    if (cache) {
      return this.getCache(cacheKey);
    } else {
      const response = this.getCache(cacheKey);
      this.deleteCache(cacheKey);
      return response;
    }
  }
  async filterMealsByIngredientQuery(ingredient, cache = true) {
    const cacheKey = `Meal-Filter-Ingredient-${ingredient}`;
    if (!this.hasCache(cacheKey)) {
      this.setCache(cacheKey, await this.#theMealDB.filterMealsByIngredientQuery(ingredient, !cache));
    }
    if (cache) {
      return this.getCache(cacheKey);
    } else {
      const response = this.getCache(cacheKey);
      this.deleteCache(cacheKey);
      return response;
    }
  }
  async filterMealsByCategoryQuery(category, cache = true) {
    const cacheKey = `Meal-Filter-Category-${category}`;
    if (!this.hasCache(cacheKey)) {
      this.setCache(cacheKey, await this.#theMealDB.filterMealsByCategoryQuery(category, !cache));
    }
    if (cache) {
      return this.getCache(cacheKey);
    } else {
      const response = this.getCache(cacheKey);
      this.deleteCache(cacheKey);
      return response;
    }
  }
  async filterMealsByAreaQuery(area, cache = true) {
    const cacheKey = `Meal-Filter-Area-${area}`;
    if (!this.hasCache(cacheKey)) {
      this.setCache(cacheKey, await this.#theMealDB.filterMealsByAreaQuery(area, !cache));
    }
    if (cache) {
      return this.getCache(cacheKey);
    } else {
      const response = this.getCache(cacheKey);
      this.deleteCache(cacheKey);
      return response;
    }
  }
  mealThumbnailImageURL(imageFileName, cache = true) {
    const cacheKey = `Meal-ImageURL-Thumbnail-${imageFileName}`;
    if (!this.hasCache(cacheKey)) {
      this.setCache(cacheKey, this.#theMealDB.mealThumbnailImageURL(imageFileName, !cache));
    }
    if (cache) {
      return this.getCache(cacheKey);
    } else {
      const response = this.getCache(cacheKey);
      this.deleteCache(cacheKey);
      return response;
    }
  }
  mealSmallImageURL(imageFileName, cache = true) {
    const cacheKey = `Meal-ImageURL-Small-${imageFileName}`;
    if (!this.hasCache(cacheKey)) {
      this.setCache(cacheKey, this.#theMealDB.mealSmallImageURL(imageFileName, !cache));
    }
    if (cache) {
      return this.getCache(cacheKey);
    } else {
      const response = this.getCache(cacheKey);
      this.deleteCache(cacheKey);
      return response;
    }
  }
  mealMediumImageURL(imageFileName, cache = true) {
    const cacheKey = `Meal-ImageURL-Medium-${imageFileName}`;
    if (!this.hasCache(cacheKey)) {
      this.setCache(cacheKey, this.#theMealDB.mealMediumImageURL(imageFileName, !cache));
    }
    if (cache) {
      return this.getCache(cacheKey);
    } else {
      const response = this.getCache(cacheKey);
      this.deleteCache(cacheKey);
      return response;
    }
  }
  mealLargeImageURL(imageFileName, cache = true) {
    const cacheKey = `Meal-ImageURL-Large-${imageFileName}`;
    if (!this.hasCache(cacheKey)) {
      this.setCache(cacheKey, this.#theMealDB.mealLargeImageURL(imageFileName, !cache));
    }
    if (cache) {
      return this.getCache(cacheKey);
    } else {
      const response = this.getCache(cacheKey);
      this.deleteCache(cacheKey);
      return response;
    }
  }
  ingredientThumbnailImageURL(imageFileName, cache = true) {
    const cacheKey = `Ingredient-ImageURL-Thumbnail-${imageFileName}`;
    if (!this.hasCache(cacheKey)) {
      this.setCache(cacheKey, this.#theMealDB.ingredientThumbnailImageURL(imageFileName, !cache));
    }
    if (cache) {
      return this.getCache(cacheKey);
    } else {
      const response = this.getCache(cacheKey);
      this.deleteCache(cacheKey);
      return response;
    }
  }
  ingredientSmallImageURL(imageFileName, cache = true) {
    const cacheKey = `Ingredient-ImageURL-Small-${imageFileName}`;
    if (!this.hasCache(cacheKey)) {
      this.setCache(cacheKey, this.#theMealDB.ingredientSmallImageURL(imageFileName, !cache));
    }
    if (cache) {
      return this.getCache(cacheKey);
    } else {
      const response = this.getCache(cacheKey);
      this.deleteCache(cacheKey);
      return response;
    }
  }
  ingredientMediumImageURL(imageFileName, cache = true) {
    const cacheKey = `Ingredient-ImageURL-Medium-${imageFileName}`;
    if (!this.hasCache(cacheKey)) {
      this.setCache(cacheKey, this.#theMealDB.ingredientMediumImageURL(imageFileName, !cache));
    }
    if (cache) {
      return this.getCache(cacheKey);
    } else {
      const response = this.getCache(cacheKey);
      this.deleteCache(cacheKey);
      return response;
    }
  }
  ingredientLargeImageURL(imageFileName, cache = true) {
    const cacheKey = `Ingredient-ImageURL-Large-${imageFileName}`;
    if (!this.hasCache(cacheKey)) {
      this.setCache(cacheKey, this.#theMealDB.ingredientLargeImageURL(imageFileName, !cache));
    }
    if (cache) {
      return this.getCache(cacheKey);
    } else {
      const response = this.getCache(cacheKey);
      this.deleteCache(cacheKey);
      return response;
    }
  }
  async search25CountriesWithNoOffsetByStringQuery(string, cache = true) {
    const cacheKey = `Countries-String-${string}`;
    if (!this.hasCache(cacheKey)) {
      this.setCache(cacheKey, await this.#restCountries.search25CountriesWithNoOffsetByStringQuery(string, !cache));
    }
    if (cache) {
      return this.getCache(cacheKey);
    } else {
      const response = this.getCache(cacheKey);
      this.deleteCache(cacheKey);
      return response;
    }
  }
  async convertCurrency(from, to, amount, cache = true) {
    const cacheKey = `Currency-Convert-${from}-${to}-${amount}`;
    if (!this.hasCache(cacheKey)) {
      this.setCache(cacheKey, await this.#restCountries.convertCurrency(from, to, amount, !cache));
    }
    if (cache) {
      return this.getCache(cacheKey);
    } else {
      const response = this.getCache(cacheKey);
      this.deleteCache(cacheKey);
      return response;
    }
  }
  async currencySymbols(cache = true) {
    const cacheKey = `CurrencySymbols`;
    if (!this.hasCache(cacheKey)) {
      this.setCache(cacheKey, await this.#restCountries.currencySymbols(!cache));
    }
    if (cache) {
      return this.getCache(cacheKey);
    } else {
      const response = this.getCache(cacheKey);
      this.deleteCache(cacheKey);
      return response;
    }
  }
}
