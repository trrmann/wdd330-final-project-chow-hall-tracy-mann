import {
  persistQueryParameter
} from '../utils.js';
import {
  SiteData,
  siteData
} from './site-data.js'

export class SearchPage {

  static searchPageMainId = 'app';
  static searchPageTemplateId = 'search-page-template'
  static recipeSearchFormClass = '.recipe-search-form';
  static recipeSearchModeClass = '#recipe-search-mode';
  static recipeSearchInputClass = '#recipe-query';
  static recipeIngredientOptionsClass = '#recipe-ingredient-options';
  static recipeSearchCategoryClass = '#recipe-category';
  static recipeSearchMessageClass = '.recipe-search-message';
  static recipeSearchResultsClass = '.recipe-search-results';
  static recipeAssignmentClass = '.recipe-assignment';
  static recipeAssignmentNameClass = '.recipe-assignment-name';
  static recipeAssignmentFormClass = '.recipe-assignment-form';
  static recipeAssignmentDayClass = '#assignment-day';
  static recipeAssignmentMealClass = '#assignment-meal';
  static recipeAssignmentExpectedServingsClass = '#assignment-expected-servings';
  static recipeAssignmentMealServingsSliderClass = '#assignment-meal-servings';
  static recipeAssignmentRecipeYieldClass = '#assignment-recipe-yield';
  static recipeAssignmentCoverageClass = '.recipe-assignment-coverage';
  static recipeAssignmentMessageClass = '.recipe-assignment-message';
  static recipeAssignmentSubmitClass = '.recipe-assignment-form button[type="submit"]';
  static recipeAssignmentAcknowledgeClass = '.recipe-assignment-acknowledge';
  static recipeSuggestionsDashBoardTemplateId = 'recipe-suggestions-dashboard-template';
  static recipeSuggestionsDashBoardClass = '.dashboard-panel-recipes';
  static recipeSuggestionTemplateId = 'recipe-suggestion-template';
  static recipeSuggestionsClass = '.recipe-suggestions';
  static recipeSuggestionClass = '.recipe-suggestion';
  static recipeSuggestionDismissClass = '.recipe-suggestion-dismiss';
  static recipeSuggestionEmptyClass = '.recipe-suggestions-empty';
  static recipeSuggestionErrorClass = '.recipe-suggestion-error';

  #searchPageContainer;
  #searchPageTemplate;
  #recipeSuggestionsDashBoardTemplate;
  #recipeSuggestionTemplate;
  #weekParameter;
  constructor(parms) {
    this.#searchPageContainer = document.getElementById(SearchPage.searchPageMainId);
    this.#searchPageTemplate = document.getElementById(SearchPage.searchPageTemplateId);
    this.#weekParameter = parms.week;
  }
  render() {
    this.#searchPageContainer.innerHTML = '';
    const page = this.#searchPageTemplate.content.cloneNode(true);
    this.#searchPageContainer.appendChild(page);
    this.#renderRecipeAssignment();
    this.#renderRecipeSearch();
  }
  #renderRecipeSearch() {
    const params = new URLSearchParams(window.location.search);
    const searchForm = this.#searchPageContainer.querySelector(SearchPage.recipeSearchFormClass);
    const searchMode = this.#searchPageContainer.querySelector(SearchPage.recipeSearchModeClass);
    const searchInput = this.#searchPageContainer.querySelector(SearchPage.recipeSearchInputClass);
    const ingredientOptions = this.#searchPageContainer.querySelector(
      SearchPage.recipeIngredientOptionsClass
    );
    const categorySelect = this.#searchPageContainer.querySelector(SearchPage.recipeSearchCategoryClass);
    const searchMessage = this.#searchPageContainer.querySelector(SearchPage.recipeSearchMessageClass);
    const resultsList = this.#searchPageContainer.querySelector(SearchPage.recipeSearchResultsClass);
    const query = params.get('query') || '';
    const requestedMode = params.get('searchMode');
    const mode = ['ingredient', 'category'].includes(requestedMode) ? requestedMode : 'name';
    searchMode.value = mode;
    const searchInputLabel = searchForm.querySelector(`label[for="${searchInput.id}"]`);

    const renderResults = recipes => {
      resultsList.replaceChildren();
      if (!recipes.length) {
        searchMessage.textContent = 'No recipes found. Try another name.';
        return;
      }
      searchMessage.textContent = `${recipes.length} recipe${recipes.length === 1 ? '' : 's'} found.`;
      recipes.forEach(recipe => {
        const item = document.createElement('li');
        item.className = 'recipe-search-result';
        const name = document.createElement('span');
        name.textContent = recipe.Name;
        const selectLink = document.createElement('a');
        const selectionURL = new URL(window.location.href);
        selectionURL.searchParams.set('recipe', recipe.ID);
        selectionURL.searchParams.delete('assigned');
        selectionURL.searchParams.delete('expectedServings');
        selectionURL.searchParams.delete('mealServings');
        selectionURL.searchParams.delete('recipeYield');
        const daySelect = this.#searchPageContainer.querySelector(SearchPage.recipeAssignmentDayClass);
        const mealSelect = this.#searchPageContainer.querySelector(SearchPage.recipeAssignmentMealClass);
        const expectedServingsInput = this.#searchPageContainer.querySelector(
          SearchPage.recipeAssignmentExpectedServingsClass
        );
        const mealServingsSlider = this.#searchPageContainer.querySelector(
          SearchPage.recipeAssignmentMealServingsSliderClass
        );
        const recipeYieldInput = this.#searchPageContainer.querySelector(
          SearchPage.recipeAssignmentRecipeYieldClass
        );
        if (daySelect.value) {
          selectionURL.searchParams.set('day', daySelect.value);
        }
        if (mealSelect.value) {
          selectionURL.searchParams.set('meal', mealSelect.value);
        }
        if (expectedServingsInput.value) {
          selectionURL.searchParams.set('expectedServings', expectedServingsInput.value);
        }
        if (mealServingsSlider.value) {
          selectionURL.searchParams.set('mealServings', mealServingsSlider.value);
        }
        if (recipeYieldInput.value) {
          selectionURL.searchParams.set('recipeYield', recipeYieldInput.value);
        }
        selectLink.href = `${selectionURL.pathname}${selectionURL.search}`;
        selectLink.className = 'recipe-search-select';
        selectLink.textContent = 'Select recipe';
        item.append(name, selectLink);
        resultsList.appendChild(item);
      });
    };
    const loadIngredients = async () => {
      try {
        const ingredients = await siteData.getRecipeIngredients();
        ingredientOptions.replaceChildren();
        ingredients.forEach(ingredient => {
          const option = document.createElement('option');
          option.value = ingredient;
          ingredientOptions.appendChild(option);
        });
      } catch (error) {
        searchMessage.textContent = `Could not load known ingredients: ${error.message}`;
      }
    };
    const searchRecipes = async searchTerm => {
      const trimmedTerm = searchTerm.trim();
      if (!trimmedTerm) {
        searchMessage.textContent = 'Enter a recipe name to search.';
        resultsList.replaceChildren();
        return;
      }
      searchMessage.textContent = 'Searching recipes...';
      resultsList.replaceChildren();
      try {
        const results = searchMode.value === 'ingredient' ?
          await siteData.searchRecipesByIngredient(trimmedTerm) :
          searchMode.value === 'category' ?
          await siteData.searchRecipesByCategory(trimmedTerm) :
          await siteData.searchRecipesByName(trimmedTerm);
        renderResults(results);
      } catch (error) {
        searchMessage.textContent = `Could not search recipes: ${error.message}`;
      }
    };
    const updateSearchMode = () => {
      const isIngredientSearch = searchMode.value === 'ingredient';
      const isCategorySearch = searchMode.value === 'category';
      searchInputLabel.textContent = isCategorySearch ?
        'Category' :
        isIngredientSearch ? 'Ingredient' : 'Recipe name';
      searchInputLabel.htmlFor = isCategorySearch ? categorySelect.id : searchInput.id;
      searchInput.hidden = isCategorySearch;
      searchInput.required = !isCategorySearch;
      categorySelect.hidden = !isCategorySearch;
      categorySelect.required = isCategorySearch;
      if (!isCategorySearch) {
        searchInput.placeholder = isIngredientSearch ? 'e.g. chicken breast' : 'e.g. Arrabiata';
      }
      if (isIngredientSearch) {
        searchInput.setAttribute('list', 'recipe-ingredient-options');
      } else {
        searchInput.removeAttribute('list');
      }
      searchMessage.textContent = isCategorySearch ?
        'Choose a category to find recipes.' :
        isIngredientSearch ?
        'Search by ingredient to find recipes.' :
        'Search by recipe name to choose a meal.';
      resultsList.replaceChildren();
    };
    const loadCategories = async () => {
      const selectedCategory = new URLSearchParams(window.location.search).get('query') || '';
      try {
        const categories = await siteData.getRecipeCategories();
        categorySelect.replaceChildren();
        categories.forEach(category => {
          const option = document.createElement('option');
          option.value = category;
          option.textContent = category;
          categorySelect.appendChild(option);
        });
        if (selectedCategory && categories.includes(selectedCategory)) {
          categorySelect.value = selectedCategory;
        }
        if (searchMode.value === 'category' && categories.length === 0) {
          searchMessage.textContent = 'No recipe categories are available.';
          return;
        }
        if (searchMode.value === 'category' && selectedCategory) {
          await searchRecipes(categorySelect.value || selectedCategory);
        }
      } catch (error) {
        searchMessage.textContent = `Could not load recipe categories: ${error.message}`;
      }
    };
    searchMode.addEventListener('change', () => {
      updateSearchMode();
      const searchURL = new URL(window.location.href);
      searchURL.searchParams.set('searchMode', searchMode.value);
      searchURL.searchParams.delete('query');
      searchURL.searchParams.delete('recipe');
      window.history.replaceState({}, '', `${searchURL.pathname}${searchURL.search}`);
      if (searchMode.value === 'category') {
        loadCategories();
      } else if (searchMode.value === 'ingredient') {
        loadIngredients();
      }
    });
    categorySelect.addEventListener('change', () => {
      const searchURL = new URL(window.location.href);
      searchURL.searchParams.set('query', categorySelect.value);
      searchURL.searchParams.set('searchMode', 'category');
      searchURL.searchParams.delete('recipe');
      window.history.replaceState({}, '', `${searchURL.pathname}${searchURL.search}`);
      searchRecipes(categorySelect.value);
    });
    searchForm.addEventListener('submit', event => {
      event.preventDefault();
      const searchURL = new URL(window.location.href);
      const searchTerm = searchMode.value === 'category' ?
        categorySelect.value :
        searchInput.value.trim();
      searchURL.searchParams.set('query', searchTerm);
      searchURL.searchParams.set('searchMode', searchMode.value);
      searchURL.searchParams.delete('recipe');
      searchURL.searchParams.delete('assigned');
      searchURL.searchParams.delete('expectedServings');
      searchURL.searchParams.delete('mealServings');
      searchURL.searchParams.delete('recipeYield');
      window.history.replaceState({}, '', `${searchURL.pathname}${searchURL.search}`);
      searchRecipes(searchTerm);
    });
    updateSearchMode();
    searchInput.value = mode === 'category' ? '' : query;
    searchInput.placeholder = mode === 'ingredient' ? 'e.g. chicken breast' : 'e.g. Arrabiata';
    searchInput.setAttribute('list', 'recipe-ingredient-options');
    if (mode === 'category') {
      loadCategories();
    } else if (mode === 'ingredient') {
      loadIngredients();
    } else if (query) {
      searchRecipes(query);
    }
  }
  async #renderRecipeAssignment() {
    const params = new URLSearchParams(window.location.search);
    const recipeID = params.get('recipe');
    if (!recipeID && !params.has('day')) {
      return;
    }
    const assignment = this.#searchPageContainer.querySelector(SearchPage.recipeAssignmentClass);
    assignment.hidden = false;
    let recipe;
    try {
      recipe = recipeID ? await siteData.getRecipeByID(recipeID) : undefined;
    } catch (error) {
      this.#showAssignmentMessage(`Could not load the selected recipe: ${error.message}`, true);
      return;
    }
    if (recipeID && !recipe) {
      this.#showAssignmentMessage('The selected recipe could not be found.', true);
      return;
    }
    const recipeNameLink = this.#searchPageContainer.querySelector(SearchPage.recipeAssignmentNameClass);
    if (recipe) {
      recipeNameLink.textContent = recipe.Name;
    } else {
      recipeNameLink.hidden = true;
    }
    const daySelect = this.#searchPageContainer.querySelector(SearchPage.recipeAssignmentDayClass);
    const mealSelect = this.#searchPageContainer.querySelector(SearchPage.recipeAssignmentMealClass);
    const expectedServingsInput = this.#searchPageContainer.querySelector(
      SearchPage.recipeAssignmentExpectedServingsClass
    );
    const mealServingsSlider = this.#searchPageContainer.querySelector(
      SearchPage.recipeAssignmentMealServingsSliderClass
    );
    const recipeYieldInput = this.#searchPageContainer.querySelector(
      SearchPage.recipeAssignmentRecipeYieldClass
    );
    const coverageNotice = this.#searchPageContainer.querySelector(
      SearchPage.recipeAssignmentCoverageClass
    );
    const week = siteData.getWeekByOffset(this.#getWeekOffset());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const requestedDay = params.get('day');
    const requestedMeal = params.get('meal');
    const replacementID = params.get('replace');
    const assignmentHeading = this.#searchPageContainer.querySelector('#recipe-assignment-title');
    const assignmentSubmit = this.#searchPageContainer.querySelector(SearchPage.recipeAssignmentSubmitClass);
    if (replacementID) {
      assignmentHeading.textContent = 'Replace planned recipe';
      assignmentSubmit.textContent = 'Replace recipe';
      daySelect.disabled = true;
      mealSelect.disabled = true;
    }
    SiteData.weekDays.forEach(([dayID, dayName], dayIndex) => {
      const dayDate = new Date(`${week.weekStartDate}T00:00:00`);
      dayDate.setDate(dayDate.getDate() + dayIndex);
      if (dayDate < today) {
        return;
      }
      const option = document.createElement('option');
      option.value = dayID;
      option.textContent = dayName;
      option.selected = dayID === requestedDay;
      daySelect.appendChild(option);
    });
    const populateMealOptions = (dayID, preferredMealID) => {
      const day = week.days.getDayByID(dayID);
      const meals = Object.values(day?.meals.toJSON().collection || {});
      mealSelect.replaceChildren();
      meals.forEach(meal => {
        const option = document.createElement('option');
        option.value = meal.ID;
        option.textContent = meal.Name;
        mealSelect.appendChild(option);
      });
      const preferredMeal = meals.find(meal =>
        String(meal.ID) === preferredMealID || meal.Name === preferredMealID
      );
      if (preferredMeal) {
        mealSelect.value = String(preferredMeal.ID);
      }
    };
    populateMealOptions(daySelect.value, requestedMeal);
    if (!daySelect.options.length) {
      this.#showAssignmentMessage('There are no future meal-planning days available in this week.', true);
      this.#searchPageContainer.querySelector(SearchPage.recipeAssignmentFormClass).hidden = true;
      return;
    }
    let restoreAssignmentState = params.has('mealServings');
    const updateSelectedMeal = () => {
      const day = week.days.getDayByID(daySelect.value);
      const meal = day?.meals.getMealByID(mealSelect.value);
      const savedExpectedServings = meal?.servingsRequired;
      if (meal?.isExecuted) {
        this.#showAssignmentMessage('Executed meals are locked and cannot receive recipe changes.', true);
        assignmentSubmit.disabled = true;
      } else {
        assignmentSubmit.disabled = !recipe;
      }
      expectedServingsInput.value = String(
        Number.isSafeInteger(savedExpectedServings) && savedExpectedServings > 0 ?
        savedExpectedServings :
        1
      );
      mealServingsSlider.max = expectedServingsInput.value;
      mealServingsSlider.value = expectedServingsInput.value;
      if (restoreAssignmentState) {
        const restoredExpectedServings = Number(params.get('expectedServings'));
        if (Number.isSafeInteger(restoredExpectedServings) && restoredExpectedServings > 0) {
          expectedServingsInput.value = String(restoredExpectedServings);
          mealServingsSlider.max = String(restoredExpectedServings);
          mealServingsSlider.value = String(Math.min(
            restoredExpectedServings,
            Math.max(1, Number(params.get('mealServings')) || restoredExpectedServings)
          ));
        }
        const restoredRecipeYield = Number(params.get('recipeYield'));
        if (Number.isFinite(restoredRecipeYield) && restoredRecipeYield > 0) {
          recipeYieldInput.value = String(restoredRecipeYield);
        }
        restoreAssignmentState = false;
      }
      updateAssignmentSummary();
    };
    const updateAssignmentSummary = () => {
      const expectedServings = Number(expectedServingsInput.value);
      if (!Number.isSafeInteger(expectedServings) || expectedServings <= 0) {
        coverageNotice.textContent = 'Enter a valid number of expected meal servings.';
        return;
      }
      mealServingsSlider.max = String(expectedServings);
      if (Number(mealServingsSlider.value) > expectedServings) {
        mealServingsSlider.value = String(expectedServings);
      }
      const mealServings = Number(mealServingsSlider.value);
      const recipeYield = Number(recipeYieldInput.value);
      if (!Number.isFinite(recipeYield) || recipeYield <= 0) {
        coverageNotice.textContent = 'Enter the servings produced by one recipe.';
        return;
      }
      const ingredientMultiplier = mealServings / recipeYield;
      const coverage = mealServings / expectedServings * 100;
      const formattedMultiplier = ingredientMultiplier.toLocaleString(
        undefined, {
          maximumFractionDigits: 2
        }
      );
      const batchLabel = ingredientMultiplier === 1 ?
        '1 batch of this recipe' :
        `${formattedMultiplier} batches of this recipe`;
      coverageNotice.textContent =
        `${mealServings} of ${expectedServings} meal servings (${coverage.toLocaleString(undefined, { maximumFractionDigits: 1 })}%); use ${batchLabel} (ingredient multiplier ${formattedMultiplier}; ${recipeYield} servings per batch).`;
    };
    const updateRecipeDetailsLink = () => {
      if (!recipe) {
        return;
      }
      const searchURL = new URL(window.location.href);
      searchURL.searchParams.set('day', daySelect.value);
      searchURL.searchParams.set('meal', mealSelect.value);
      searchURL.searchParams.set('expectedServings', expectedServingsInput.value);
      searchURL.searchParams.set('mealServings', mealServingsSlider.value);
      searchURL.searchParams.set('recipeYield', recipeYieldInput.value);
      const submitButton = this.#searchPageContainer.querySelector(
        SearchPage.recipeAssignmentSubmitClass
      );
      if (submitButton.disabled) {
        searchURL.searchParams.set('assigned', '1');
      }
      const recipeURL = new URL('/Recipe/', window.location.origin);
      recipeURL.searchParams.set('week', this.#weekParameter);
      recipeURL.searchParams.set('recipe', recipeID);
      recipeURL.searchParams.set('returnTo', `${searchURL.pathname}${searchURL.search}`);
      recipeNameLink.href = `${recipeURL.pathname}${recipeURL.search}`;
    };
    daySelect.addEventListener('change', () => {
      populateMealOptions(daySelect.value, null);
      updateSelectedMeal();
    });
    mealSelect.addEventListener('change', updateSelectedMeal);
    expectedServingsInput.addEventListener('input', () => {
      const expectedServings = Number(expectedServingsInput.value);
      if (Number.isSafeInteger(expectedServings) && expectedServings > 0) {
        mealServingsSlider.max = String(expectedServings);
        mealServingsSlider.value = String(expectedServings);
      }
      updateAssignmentSummary();
      updateRecipeDetailsLink();
    });
    expectedServingsInput.addEventListener('change', () => {
      const expectedServings = Number(expectedServingsInput.value);
      if (!Number.isSafeInteger(expectedServings) || expectedServings <= 0) {
        return;
      }
      try {
        siteData.setMealServingsRequired(
          this.#weekParameter,
          daySelect.value,
          mealSelect.value,
          expectedServings
        );
      } catch (error) {
        this.#showAssignmentMessage(error.message, true);
      }
    });
    daySelect.addEventListener('change', updateRecipeDetailsLink);
    mealSelect.addEventListener('change', updateRecipeDetailsLink);
    mealServingsSlider.addEventListener('input', () => {
      updateAssignmentSummary();
      updateRecipeDetailsLink();
    });
    recipeYieldInput.addEventListener('input', () => {
      updateAssignmentSummary();
      updateRecipeDetailsLink();
    });
    updateSelectedMeal();
    updateRecipeDetailsLink();
    const form = this.#searchPageContainer.querySelector(SearchPage.recipeAssignmentFormClass);
    const submitButton = form.querySelector(SearchPage.recipeAssignmentSubmitClass);
    submitButton.disabled = !recipe || Boolean(week.days.getDayByID(daySelect.value)
      ?.meals.getMealByID(mealSelect.value)?.isExecuted);
    if (!recipe) {
      this.#showAssignmentMessage('Search for and select a recipe before adding it to the meal plan.');
    }
    const acknowledgeButton = this.#searchPageContainer.querySelector(
      SearchPage.recipeAssignmentAcknowledgeClass
    );
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!recipe) {
        this.#showAssignmentMessage('Search for and select a recipe before adding it to the meal plan.', true);
        return;
      }
      try {
        const result = siteData.assignRecipeToMeal(
          this.#weekParameter,
          daySelect.value,
          mealSelect.value,
          recipeID,
          Number(recipeYieldInput.value),
          Number(mealServingsSlider.value),
          Number(expectedServingsInput.value),
          replacementID
        );
        this.#showAssignmentMessage(
          `${result.recipe} ${replacementID ? 'replaced the selected recipe in' : 'added to'} ${result.meal} on ${result.day}: use ${result.ingredientMultiplier === 1 ? '1 batch of this recipe' : `${result.ingredientMultiplier.toLocaleString(undefined, { maximumFractionDigits: 2 })} batches of this recipe`} to cover ${result.mealServings} of ${result.expectedServings} meal servings.`
        );
        submitButton.disabled = true;
        acknowledgeButton.hidden = false;
        updateRecipeDetailsLink();
      } catch (error) {
        this.#showAssignmentMessage(error.message, true);
      }
    });
    acknowledgeButton.addEventListener('click', () => {
      const returnTo = new URLSearchParams(window.location.search).get('returnTo');
      let returnURL;
      if (returnTo) {
        const requestedURL = new URL(returnTo, window.location.origin);
        if (requestedURL.origin === window.location.origin) {
          returnURL = requestedURL.href;
        }
      }
      if (!returnURL && document.referrer) {
        const referrer = new URL(document.referrer);
        if (referrer.origin === window.location.origin) {
          returnURL = referrer.href;
        }
      }
      window.location.assign(returnURL || new URL('/?week=current', window.location.origin).href);
    });
    if (params.get('assigned') === '1') {
      submitButton.disabled = true;
      acknowledgeButton.hidden = false;
      this.#showAssignmentMessage(replacementID ?
        'This recipe has already replaced the selected recipe.' :
        'This recipe has already been added to the meal plan.');
      updateRecipeDetailsLink();
    }
  }
  #getWeekOffset() {
    const configuredWeek = Object.values(siteData.weekNamedOffsets)
      .find(configuration => configuration.param === this.#weekParameter);
    if (configuredWeek) {
      return configuredWeek.offset;
    }
    const offset = Number.parseInt(this.#weekParameter, 10);
    return Number.isNaN(offset) ? 0 : offset;
  }
  #showAssignmentMessage(message, isError = false) {
    const notice = this.#searchPageContainer.querySelector(SearchPage.recipeAssignmentMessageClass);
    notice.textContent = message;
    notice.classList.toggle('is-error', isError);
  }
  async mountDashboard(dashboardContainer, weekParameter = this.#weekParameter) {
    await this.renderRecipeSuggestionsDashboard(dashboardContainer, weekParameter);
  }
  async renderRecipeSuggestionsDashboard(
    dashboardContainer,
    weekParameter = this.#weekParameter,
    errorMessage = ''
  ) {
    this.#recipeSuggestionsDashBoardTemplate = document.getElementById(SearchPage.recipeSuggestionsDashBoardTemplateId);
    this.#recipeSuggestionTemplate = document.getElementById(SearchPage.recipeSuggestionTemplateId);
    const recipeSuggestionsDashBoardClone = this.#recipeSuggestionsDashBoardTemplate.content.cloneNode(true);
    const targetContainer = recipeSuggestionsDashBoardClone.querySelector(SearchPage.recipeSuggestionsClass);
    let suggestedRecipes = [];
    try {
      suggestedRecipes = await siteData.getSuggestedRecipesForWeek(weekParameter);
    } catch (error) {
      errorMessage = error.message;
    }
    suggestedRecipes.forEach((suggestion) => {
      const clone = this.#recipeSuggestionTemplate.content.cloneNode(true);
      const recipeLink = clone.querySelector(SearchPage.recipeSuggestionClass);
      const recipeURL = new URL(persistQueryParameter(
        persistQueryParameter(recipeLink.href, 'week', weekParameter),
        'recipe',
        suggestion.recipe.ID
      ), window.location.origin);
      const returnURL = new URL('/', window.location.origin);
      returnURL.searchParams.set('week', weekParameter);
      recipeURL.searchParams.set('returnTo', `${returnURL.pathname}${returnURL.search}`);
      recipeLink.textContent = suggestion.recipe.Name;
      recipeLink.href = `${recipeURL.pathname}${recipeURL.search}`;
      const deployLink = clone.querySelector('.recipe-suggestion-deploy');
      const deployURL = new URL(persistQueryParameter(
        persistQueryParameter(deployLink.href, 'week', weekParameter),
        'recipe',
        suggestion.recipe.ID
      ), window.location.origin);
      deployURL.searchParams.set('returnTo', `${returnURL.pathname}${returnURL.search}`);
      deployLink.href = `${deployURL.pathname}${deployURL.search}`;
      clone.querySelector(SearchPage.recipeSuggestionDismissClass).dataset.recipeId = suggestion.recipe.ID;
      targetContainer.appendChild(clone);
    });
    if (errorMessage) {
      const errorNotice = document.createElement('li');
      errorNotice.className = SearchPage.recipeSuggestionErrorClass.slice(1);
      errorNotice.setAttribute('role', 'alert');
      errorNotice.textContent = `Could not update recipe suggestions: ${errorMessage}`;
      targetContainer.appendChild(errorNotice);
    }
    if (!suggestedRecipes.length && !errorMessage) {
      const emptyMessage = document.createElement('li');
      emptyMessage.className = SearchPage.recipeSuggestionEmptyClass.slice(1);
      emptyMessage.textContent = 'No recipe suggestions are available for this week.';
      targetContainer.appendChild(emptyMessage);
    }
    targetContainer.addEventListener('click', async event => {
      const dismissButton = event.target.closest(SearchPage.recipeSuggestionDismissClass);
      if (!dismissButton) {
        return;
      }
      event.preventDefault();
      dismissButton.disabled = true;
      try {
        await siteData.dismissSuggestedRecipe(weekParameter, dismissButton.dataset.recipeId);
        await this.renderRecipeSuggestionsDashboard(dashboardContainer, weekParameter);
      } catch (error) {
        await this.renderRecipeSuggestionsDashboard(
          dashboardContainer,
          weekParameter,
          error.message
        );
      }
    });
    const existingDashboard = dashboardContainer.querySelector(SearchPage.recipeSuggestionsDashBoardClass);
    if (existingDashboard) {
      dashboardContainer.replaceChild(recipeSuggestionsDashBoardClone, existingDashboard);
    } else {
      dashboardContainer.appendChild(recipeSuggestionsDashBoardClone);
    }
  }
}
