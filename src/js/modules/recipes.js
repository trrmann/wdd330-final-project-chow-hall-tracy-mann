import {
  QuantifiedIngredients
} from './ingredients'

export class Recipes {
  static fromJSON(json) {
    const instance = new Recipes();
    instance.#fromJSON(json);
    return instance;
  };
  static importMealsDBJSON(original, json) {
    let instance;
    if (json === undefined) {
      if (Recipes.debug) {
        console.log('Recipes - static importMealsDBJSON - 2');
      };
      instance = new Recipes();
      json = original;
    } else {
      if (original instanceof Recipes) {
        instance = original;
      } else {
        instance = original instanceof Recipes ? original : new Recipes();
      };
    };
    instance.#importMealsDBJSON(json);
    return instance;
  };
  #collection;
  #index;
  #rebuildIndex() {
    this.#index = Object.keys(this.#collection).reduce((index, recipeID) => {
      index[this.#collection[recipeID].Name] = recipeID;
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
    if (json && json.collection && json.index) {
      this.#collection = Object.keys(json.collection).reduce((acc, key) => {
        acc[key] = Recipe.fromJSON(json.collection[key]);
        this.#index[acc[key].Name] = key;
        return acc;
      }, this.#collection);
    };
  };
  #importMealsDBJSON(json) {
    (json.meals || []).forEach(recipeData => {
      const existingRecipe = this.#collection[recipeData.idMeal];
      this.#collection[recipeData.idMeal] = Recipe.importMealsDBJSON(
        existingRecipe || new Recipe(),
        recipeData
      );
    });
    this.#rebuildIndex();
  };
  constructor() {
    this.#collection = {};
    this.#index = {};
  };
  toJSON() {
    return this.#toJSON();
  };
  getRecipeByID(id) {
    return this.#collection[id];
  };
  getRecipeByName(name) {
    return this.#collection[this.#index[name]];
  };
  addRecipe(recipe) {
    if (!(recipe instanceof Recipe)) {
      throw new TypeError('recipe must be a Recipe instance');
    }
    if (recipe.ID === undefined || recipe.ID === null || String(recipe.ID).trim() === '') {
      throw new TypeError('recipe must have an ID');
    }
    if (Object.prototype.hasOwnProperty.call(this.#collection, recipe.ID)) {
      throw new Error(`A recipe with ID "${recipe.ID}" already exists`);
    }
    this.#collection[recipe.ID] = recipe;
    this.#rebuildIndex();
    return recipe;
  };
  removeRecipeByID(id) {
    const recipe = this.#collection[id];
    if (recipe) {
      delete this.#collection[id];
      this.#rebuildIndex();
    }
    return recipe;
  };
  updateRecipe(recipe) {
    if (!(recipe instanceof Recipe)) {
      throw new TypeError('recipe must be a Recipe instance');
    }
    if (recipe.ID === undefined || recipe.ID === null || String(recipe.ID).trim() === '') {
      throw new TypeError('recipe must have an ID');
    }
    if (!Object.prototype.hasOwnProperty.call(this.#collection, recipe.ID)) {
      throw new Error(`No recipe exists with ID "${recipe.ID}"`);
    }
    this.#collection[recipe.ID] = recipe;
    this.#rebuildIndex();
    return recipe;
  };
  clearAll() {
    this.#collection = {};
    this.#index = {};
  };
};
export class Recipe {
  static fromJSON(json) {
    const instance = new Recipe();
    instance.#fromJSON(json);
    return instance;
  };
  static importMealsDBJSON(original, json) {
    let instance;
    if (json === undefined) {
      instance = new Recipe();
      json = original;
    } else {
      if (original instanceof Recipe) {
        instance = original;
      } else {
        instance = original instanceof Recipe ? original : new Recipe();
      };
    };
    instance.#importMealsDBJSON(json);
    return instance;
  };
  #DateModified;
  #ID;
  #Area;
  #Category;
  #Country;
  #CreativeCommonsConfirmed;
  #ImageSource;
  #Instructions;
  #Ingredients;
  #Name;
  #MealAlternate;
  #ThumbnailURL;
  #Source;
  #Tags;
  #Youtube;
  #toJSON() {
    return {
      dateModified: this.#DateModified, //: "2026-06-23 18:33:50"
      id: this.#ID, //: "53457"
      area: this.#Area, //: null
      category: this.#Category, //: "Beef"
      country: this.#Country, //: "Barbados"
      creativeCommonsConfirmed: this.#CreativeCommonsConfirmed, //: null
      imageSource: this.#ImageSource, //: null
      ingredients: this.#Ingredients ? this.#Ingredients.toJSON() : null,
      //this.#Ingredients['1'].importMealsDB(json.strMeasure1, json.strIngredient1); //: "2", "Pigs Trotters"
      //this.#Ingredients['2'].importMealsDB(json.strMeasure2, json.strIngredient2); //: "2 Lbs", "Oxtail"
      //this.#Ingredients['3'].importMealsDB(json.strMeasure3, json.strIngredient3); //: "Splash", "Lime juice"
      //this.#Ingredients['4'].importMealsDB(json.strMeasure4, json.strIngredient4); //: "3 cloves", "Garlic"
      //this.#Ingredients['5'].importMealsDB(json.strMeasure5, json.strIngredient5); //: "2", "Scotch Bonnet"
      //this.#Ingredients['6'].importMealsDB(json.strMeasure6, json.strIngredient6); //: "1 large", "Onion"
      //this.#Ingredients['7'].importMealsDB(json.strMeasure7, json.strIngredient7); //: "1", "Cinnamon Stick"
      //this.#Ingredients['8'].importMealsDB(json.strMeasure8, json.strIngredient8); //: "2", "Cloves"
      //this.#Ingredients['9'].importMealsDB(json.strMeasure9, json.strIngredient9); //: "Pinch", "Sugar"
      //this.#Ingredients['10'].importMealsDB(json.strMeasure10, json.strIngredient10); //: "Pinch", "Salt"
      //this.#Ingredients['11'].importMealsDB(json.strMeasure11, json.strIngredient11); //: "Sprinkling", "Basil"
      //this.#Ingredients['12'].importMealsDB(json.strMeasure12, json.strIngredient12); //: "Sprinkling", "Thyme"
      //this.#Ingredients['13'].importMealsDB(json.strMeasure13, json.strIngredient13); //: "2 Lbs", "Beef"
      //this.#Ingredients['14'].importMealsDB(json.strMeasure14, json.strIngredient14); //: "", ""
      //this.#Ingredients['15'].importMealsDB(json.strMeasure15, json.strIngredient15); //: "", ""
      //this.#Ingredients['16'].importMealsDB(json.strMeasure16, json.strIngredient16); //: "", ""
      //this.#Ingredients['17'].importMealsDB(json.strMeasure17, json.strIngredient17); //: "", ""
      //this.#Ingredients['18'].importMealsDB(json.strMeasure18, json.strIngredient18); //: "", ""
      //this.#Ingredients['19'].importMealsDB(json.strMeasure19, json.strIngredient19); //: "", ""
      //this.#Ingredients['20'].importMealsDB(json.strMeasure20, json.strIngredient20); //: "", ""      
      instructions: this.#Instructions, //: "Wash the stewing steak and place it in the mixing bowl with the lemon or lime juice.\r\nSet that to one side; while you slice the garlic into tiny slices, slice the onion. Chop the basil and thyme.\r\nNow you need to be very careful when you slice the scotch bonnet peppers; you want these in fine pieces, which you can either do with a long knife trying not to touch the pepper, or you can wear rubber gloves to cut it up. Wash your hands straight afterward and do not touch your eyes; these peppers really burn your hands and eyes if they make contact with the skin!\r\nNow rinse the lime or lemon juice off the stewing steak. And cut the meat into cubes.\r\nAlso, chop the pig’s trotters and the oxtail into cubes.\r\nFill the large saucepan with water and bring to a boil.\r\nAdd the pig’s trotters.\r\nWhen the pig’s trotters have boiled, drain the excess water, and now add the stewing steak and cover with fresh hot water.\r\nNow add your chopped garlic, onion, and peppers.\r\nNow add the cinnamon stick, cloves, basil, and thyme and a pinch of salt and sugar to taste.\r\nNow simmer until the meat is tender. The flavor of this dish comes out over a few days and therefore gets tastier each time you reheat it; make sure you always reheat the entire pot to boiling point."
      name: this.#Name, //: "Barbados Pepperpot"
      mealAlternate: this.#MealAlternate, //: null
      thumbnailURL: this.#ThumbnailURL, //: "https://www.themealdb.com/images/media/meals/5tf8j11782236249.jpg"
      source: this.#Source, //: "https://www.totallybarbados.com/articles/barbados-recipes/barbados-pepperpot/"
      tags: this.#Tags, //: null
      youtube: this.#Youtube //: "https://www.youtube.com/watch?v=9L2nQEBRPdg"
    };
  };
  #fromJSON(json) {
    if (json &&
      /*json.dateModified &&*/
      json.id &&
      /*json.area &&
      json.category &&
      json.country &&
      json.creativeCommonsConfirmed &&
      json.imageSource &&
      json.ingredients &&
      json.instructions &&*/
      json.name
      /*&&
                 json.mealAlternate &&
                 json.thumbnailURL &&
                 json.source &&
                 json.tags &&
                 json.youtube*/
    ) {
      this.#DateModified = json.dateModified;
      this.#ID = json.id;
      this.#Area = json.area;
      this.#Category = json.category;
      this.#Country = json.country;
      this.#CreativeCommonsConfirmed = json.creativeCommonsConfirmed;
      this.#ImageSource = json.imageSource;
      this.#Ingredients = json.ingredients instanceof QuantifiedIngredients
        ? json.ingredients
        : QuantifiedIngredients.fromJSON(json.ingredients);
      this.#Instructions = json.instructions;
      this.#Name = json.name;
      this.#MealAlternate = json.mealAlternate;
      this.#ThumbnailURL = json.thumbnailURL;
      this.#Source = json.source;
      this.#Tags = json.tags;
      this.#Youtube = json.youtube;
    };
  };
  #importMealsDBJSON(json) {
    console.log('recipe importMealsDBJSON');
    console.log(json);
    console.log('start recipe importMealsDBJSON');
    console.log(this);
    const ingredients = Array.from({
      length: 20
    }, (_, idx) => idx + 1).reduce((acc, num) => {
      acc[num] = {
        measure: json[`strMeasure${num}`],
        ingredient: json[`strIngredient${num}`]
      };
      return acc;
    }, {});
    const quantifiedIngredients = QuantifiedIngredients.importMealsDBJSON(new QuantifiedIngredients(), ingredients);
    console.log('recipe importMealsDBJSON pre call fromJSON');
    console.log(ingredients);
    console.log(quantifiedIngredients);
    this.#fromJSON({
      dateModified: json.dateModified || null,
      id: json.idMeal,
      area: json.strArea || null,
      category: json.strCategory || null,
      country: json.strCountry || null,
      creativeCommonsConfirmed: json.strCreativeCommonsConfirmed || null,
      imageSource: json.strImageSource || null,
      instructions: json.strInstructions,
      ingredients: quantifiedIngredients,
      name: json.strMeal,
      mealAlternate: json.strMealAlternate || null,
      thumbnailURL: json.strMealThumb || null,
      source: json.strSource || null,
      tags: json.strTags || null,
      youtube: json.strYoutube || null
    });
    console.log('end recipe importMealsDBJSON');
    console.log(this);
  };
  constructor() {
    console.log('recipe constructor');
    this.#Ingredients = new QuantifiedIngredients();
  };
  toJSON() {
    return this.#toJSON();
  };
  get DateModified() {
    return this.#DateModified;
  };
  get ID() {
    return this.#ID;
  };
  get Area() {
    return this.#Area;
  };
  get Category() {
    return this.#Category;
  };
  get Country() {
    return this.#Country;
  };
  get CreativeCommonsConfirmed() {
    return this.#CreativeCommonsConfirmed;
  };
  get ImageSource() {
    return this.#ImageSource;
  };
  get Instructions() {
    return this.#Instructions;
  };
  get QuantifiedIngredient() {
    return this.#Ingredients;
  };
  get Name() {
    return this.#Name;
  };
  get MealAlternate() {
    return this.#MealAlternate;
  };
  get ThumbnailURL() {
    return this.#ThumbnailURL;
  };
  get Source() {
    return this.#Source;
  };
  get Tags() {
    return this.#Tags;
  };
  get Youtube() {
    return this.#Youtube;
  };
};
