import {
  persistQueryParameter
} from '../utils.js';
import {
  siteData
} from './site-data.js'

export class SearchPage {

  static searchPageMainId = 'app';
  static searchPageTemplateId = 'search-page-template'
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
    this.#searchPageContainer.appendChild(this.#searchPageTemplate.content.cloneNode(true));
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
      recipeLink.textContent = suggestion.recipe.Name;
      recipeLink.href = persistQueryParameter(recipeLink.href, 'week', weekParameter);
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
