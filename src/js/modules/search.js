import { persistQueryParameter } from '../utils.js';

const recipeLists = {
  current: ['Southern Fried Chicken', 'Salisbury Steak'],
  next: ['Southern Fried Chicken', 'Salisbury Steak', 'Chicken Fried Steak', 'Chicken and Dumplings']
};
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
    recipeLists[weekParameter].forEach((recipe) => {
      const clone = this.#recipeSuggestionTemplate.content.cloneNode(true);
      clone.querySelector(SearchPage.recipeSuggestionClass).textContent = recipe;
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
