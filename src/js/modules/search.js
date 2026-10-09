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
  mountDashboard(dashboardContainer, weekParameter = this.#weekParameter) {
    this.renderRecipeSuggestionsDashboard(dashboardContainer, weekParameter);
  }
  renderRecipeSuggestionsDashboard(dashboardContainer, weekParameter = this.#weekParameter) {
    this.#recipeSuggestionsDashBoardTemplate = document.getElementById(SearchPage.recipeSuggestionsDashBoardTemplateId);
    this.#recipeSuggestionTemplate = document.getElementById(SearchPage.recipeSuggestionTemplateId);
    const recipeSuggestionsDashBoardClone = this.#recipeSuggestionsDashBoardTemplate.content.cloneNode(true);
    const targetContainer = recipeSuggestionsDashBoardClone.querySelector(SearchPage.recipeSuggestionsClass);
    const recipes = Object.values(siteData.recipes.toJSON().collection)
      .sort((left, right) => left.Name.localeCompare(right.Name));
    recipes.forEach((recipe) => {
      const clone = this.#recipeSuggestionTemplate.content.cloneNode(true);
      clone.querySelector(SearchPage.recipeSuggestionClass).textContent = recipe.Name;
      clone.querySelector(SearchPage.recipeSuggestionClass).href = persistQueryParameter(clone.querySelector(SearchPage.recipeSuggestionClass).href, 'week', weekParameter);
      targetContainer.appendChild(clone);
    });
    const existingDashboard = dashboardContainer.querySelector(SearchPage.recipeSuggestionsDashBoardClass);
    if (existingDashboard) {
      // If it exists, replace ONLY this dashboard node in place, leaving others alone
      dashboardContainer.replaceChild(recipeSuggestionsDashBoardClone, existingDashboard);
    } else {
      // If it's not there yet, append it normally
      dashboardContainer.appendChild(recipeSuggestionsDashBoardClone);
    }
  }
}
