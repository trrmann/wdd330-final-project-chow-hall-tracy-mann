export class ShoppingPage {
  static shoppingPageMainId = 'app';
  static shoppingPageTemplateId = 'shopping-page-template';
  static shoppingListDashBoardTemplateId = 'shopping-list-dashboard-template';
  static shoppingDashBoardClass = '.dashboard-panel-shopping';
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
