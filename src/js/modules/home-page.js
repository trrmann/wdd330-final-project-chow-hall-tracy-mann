import {
  MealPlanPage
} from './meal-plan.js'
import {
  InventoryPage
} from './inventory.js'
import {
  ShoppingPage
} from './shopping.js'
import {
  SearchPage
} from './search.js'
import {
  persistQueryParameter
} from '../utils.js';
export class HomePage {
  static homePageMainId = 'app';
  static homePageTemplateId = 'home-page-template';
  static primaryActionClass = '.primary-action';
  static homePageDashBoardClass = '.home-dashboard';
  #homePageContainer;
  #homePageTemplate;
  #homePagePrimaryActionContainer;
  #homePageDashboardContainer;
  #mealPlanPage;
  #inventoryPage;
  #shoppingPage;
  #searchPage;
  #weekParameter;
  constructor(parms) {
    this.#homePageContainer = document.getElementById(HomePage.homePageMainId);
    this.#homePagePrimaryActionContainer = document.querySelector(HomePage.primaryActionClass);
    this.#homePageTemplate = document.getElementById(HomePage.homePageTemplateId);
    this.#weekParameter = parms.week;
    this.#mealPlanPage = new MealPlanPage(parms);
    this.#inventoryPage = new InventoryPage(parms);
    this.#shoppingPage = new ShoppingPage(parms);
    this.#searchPage = new SearchPage(parms);
  }
  async render() {
    const homePageContent = this.#homePageTemplate.content.cloneNode(true);
    this.#homePagePrimaryActionContainer = homePageContent.querySelector(HomePage.primaryActionClass);
    this.#homePagePrimaryActionContainer.href = persistQueryParameter(this.#homePagePrimaryActionContainer.href, 'week', this.#weekParameter);
    this.#homePageDashboardContainer = homePageContent.querySelector(HomePage.homePageDashBoardClass);
    this.#mealPlanPage.mountDashboard(this.#homePageDashboardContainer, this.#weekParameter);
    this.#inventoryPage.mountDashboards(this.#homePageDashboardContainer, this.#weekParameter);
    this.#shoppingPage.mountDashboard(this.#homePageDashboardContainer);
    this.#homePageContainer.innerHTML = '';
    this.#homePageContainer.appendChild(homePageContent);
    await this.#searchPage.mountDashboard(this.#homePageDashboardContainer, this.#weekParameter);
  }
}
