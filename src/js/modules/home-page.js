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
export class HomePage {
  static homePageMainId = 'app';
  static homePageTemplateId = 'home-page-template';
  static homePageDashBoardClass = '.home-dashboard';
  #homePageContainer;
  #homePageTemplate;
  #homePageDashboardContainer;
  #mealPlanPage;
  #inventoryPage;
  #shoppingPage;
  #searchPage;
  constructor() {
    this.#homePageContainer = document.getElementById(HomePage.homePageMainId);
    this.#homePageTemplate = document.getElementById(HomePage.homePageTemplateId);
    this.#mealPlanPage = new MealPlanPage();
    this.#inventoryPage = new InventoryPage();
    this.#shoppingPage = new ShoppingPage();
    this.#searchPage = new SearchPage();
  }
  render() {
    const homePageContent = this.#homePageTemplate.content.cloneNode(true);
    this.#homePageDashboardContainer = homePageContent.querySelector(HomePage.homePageDashBoardClass);
    this.#mealPlanPage.mountDashboard(this.#homePageDashboardContainer);
    this.#inventoryPage.mountDashboards(this.#homePageDashboardContainer);
    this.#shoppingPage.mountDashboard(this.#homePageDashboardContainer);
    this.#searchPage.mountDashboard(this.#homePageDashboardContainer);
    this.#homePageContainer.innerHTML = '';
    this.#homePageContainer.appendChild(homePageContent);
  }
}
