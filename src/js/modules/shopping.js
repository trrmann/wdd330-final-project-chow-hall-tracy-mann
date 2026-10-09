import {
  siteData
} from './site-data.js'

export class ShoppingPage {
  static shoppingPageMainId = 'app';
  static shoppingPageTemplateId = 'shopping-page-template';
  static shoppingListDashBoardTemplateId = 'shopping-list-dashboard-template';
  static shoppingDashBoardClass = '.dashboard-panel-shopping';
  static shoppingItemsClass = '.shopping-items';
  static itemCountNumberClass = '.item-count-number';
  static shoppingItemNameClass = '.shopping-item-name';
  static shoppingListItemTemplateId = 'shopping-list-item-template';
  static emptyShoppingListMessage = 'No shopping list data available yet.';
  #shoppingPageContainer
  #shoppingPageTemplate;
  #shoppingListDashBoardTemplate;
  constructor() {
    this.#shoppingPageContainer = document.getElementById(ShoppingPage.shoppingPageMainId);
    this.#shoppingPageTemplate = document.getElementById(ShoppingPage.shoppingPageTemplateId);
  }
  render() {
    this.#shoppingPageContainer.innerHTML = '';
    this.#shoppingPageContainer.appendChild(this.#shoppingPageTemplate.content.cloneNode(true));
  }
  mountDashboard(dashboardContainer) {
    this.renderShoppingListDashBoard(dashboardContainer);
  }
  renderShoppingListDashBoard(dashboardContainer) {
    this.#shoppingListDashBoardTemplate = document.getElementById(ShoppingPage.shoppingListDashBoardTemplateId);
    const shoppingDashBoardClone = this.#shoppingListDashBoardTemplate.content.cloneNode(true);
    const targetContainer = shoppingDashBoardClone.querySelector(ShoppingPage.shoppingItemsClass);
    const shoppingListItemTemplate = document.getElementById(ShoppingPage.shoppingListItemTemplateId);
    targetContainer.innerHTML = '';
    const shoppingList = Object.values(siteData.shoppingList.toJSON().collection);
    if (!shoppingList.length) {
      const emptyMessage = document.createElement('li');
      emptyMessage.textContent = ShoppingPage.emptyShoppingListMessage;
      targetContainer.appendChild(emptyMessage);
    }
    shoppingList.forEach(ingredient => {
      const clone = shoppingListItemTemplate.content.cloneNode(true);
      clone.querySelector(ShoppingPage.shoppingItemNameClass).textContent = [ingredient.Measure, ingredient.Name].filter(Boolean).join(' ');
      targetContainer.appendChild(clone);
    });
    const itemCountContainer = shoppingDashBoardClone.querySelector(ShoppingPage.itemCountNumberClass);
    itemCountContainer.textContent = shoppingList.length;
    const existingDashboard = dashboardContainer.querySelector(ShoppingPage.shoppingDashBoardClass);
    if (existingDashboard) {
      // If it exists, replace ONLY this dashboard node in place, leaving others alone
      dashboardContainer.replaceChild(shoppingDashBoardClone, existingDashboard);
    } else {
      // If it's not there yet, append it normally
      dashboardContainer.appendChild(shoppingDashBoardClone);
    }
  }
}
