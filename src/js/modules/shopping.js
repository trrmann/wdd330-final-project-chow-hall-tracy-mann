const shoppingLists = {
  current: ['Chicken', 'Rice', 'Milk'],
  next: ['Chicken', 'Rice', 'Milk', 'Ground Beef', 'Lard', 'Eggs', 'Flour', 'Sugar', 'Salt']
};
export class ShoppingPage {
  static shoppingPageMainId = 'app';
  static shoppingPageTemplateId = 'shopping-page-template';
  static shoppingListDashBoardTemplateId = 'shopping-list-dashboard-template';
  static shoppingDashBoardClass = '.dashboard-panel-shopping';
  static shoppingItemsClass = '.shopping-items';
  static itemCountNumberClass = '.item-count-number';
  static shoppingItemNameClass = '.shopping-item-name';
  static shoppingListItemTemplateId = 'shopping-list-item-template';
  #shoppingPageContainer
  #shoppingPageTemplate;
  #shoppingListDashBoardTemplate;
  #weekParameter;
  constructor(parms) {
    this.#shoppingPageContainer = document.getElementById(ShoppingPage.shoppingPageMainId);
    this.#shoppingPageTemplate = document.getElementById(ShoppingPage.shoppingPageTemplateId);
    this.#weekParameter = parms.week;
  }
  render() {
    this.#shoppingPageContainer.innerHTML = '';
    this.#shoppingPageContainer.appendChild(this.#shoppingPageTemplate.content.cloneNode(true));
  }
  mountDashboard(dashboardContainer, weekParameter = this.#weekParameter) {
    this.renderShoppingListDashBoard(dashboardContainer, weekParameter);
  }
  renderShoppingListDashBoard(dashboardContainer, weekParameter = this.#weekParameter) {
    this.#shoppingListDashBoardTemplate = document.getElementById(ShoppingPage.shoppingListDashBoardTemplateId);
    const shoppingDashBoardClone = this.#shoppingListDashBoardTemplate.content.cloneNode(true);
    const targetContainer = shoppingDashBoardClone.querySelector(ShoppingPage.shoppingItemsClass);
    const shoppingListItemTemplate = document.getElementById(ShoppingPage.shoppingListItemTemplateId);
    targetContainer.innerHTML = '';
    const shoppingList = shoppingLists[weekParameter] || [];
    shoppingList.forEach((item) => {
      const clone = shoppingListItemTemplate.content.cloneNode(true);
      clone.querySelector(ShoppingPage.shoppingItemNameClass).textContent = item;
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
