export class InventoryPage {
  static inventoryPageMainId = 'app';
  static inventoryPageTemplateId = 'inventory-page-template';
  static inventoryStatusDashBoardTemplateId = 'inventory-status-dashboard-template';
  static inventoryDashBoardClass = '.dashboard-panel-inventory';
  static inventoryLowStockDashBoardTemplateId = 'inventory-low-stock-dashboard-template';
  static lowStockDashBoardClass = '.dashboard-panel-low-stock';
  #inventoryPageContainer
  #inventoryPageTemplate;
  #inventoryStatusDashBoardTemplate;
  #inventoryLowStockDashBoardTemplate;
  constructor() {
    this.#inventoryPageContainer = document.getElementById(InventoryPage.inventoryPageMainId);
    this.#inventoryPageTemplate = document.getElementById(InventoryPage.inventoryPageTemplateId);
  }
  render() {
    this.#inventoryPageContainer.innerHTML = '';
    this.#inventoryPageContainer.appendChild(this.#inventoryPageTemplate.content.cloneNode(true));
  }
  mountDashboards(dashboardContainer) {
    this.renderInventoryStatusDashBoard(dashboardContainer);
    this.renderInventoryLowStockDashBoard(dashboardContainer);
  }
  renderInventoryStatusDashBoard(dashboardContainer) {
    this.#inventoryStatusDashBoardTemplate = document.getElementById(InventoryPage.inventoryStatusDashBoardTemplateId);
    const inventoryStatusDashBoardClone = this.#inventoryStatusDashBoardTemplate.content.cloneNode(true);
    const existingDashboard = dashboardContainer.querySelector(InventoryPage.inventoryDashBoardClass);
    if (existingDashboard) {
      // If it exists, replace ONLY this dashboard node in place, leaving others alone
      dashboardContainer.replaceChild(inventoryStatusDashBoardClone, existingDashboard);
    } else {
      // If it's not there yet, append it normally
      dashboardContainer.appendChild(inventoryStatusDashBoardClone);
    }
  }
  renderInventoryLowStockDashBoard(dashboardContainer) {
    this.#inventoryLowStockDashBoardTemplate = document.getElementById(InventoryPage.inventoryLowStockDashBoardTemplateId);
    const inventoryLowStockDashBoardClone = this.#inventoryLowStockDashBoardTemplate.content.cloneNode(true);
    const existingDashboard = dashboardContainer.querySelector(InventoryPage.lowStockDashBoardClass);
    if (existingDashboard) {
      // If it exists, replace ONLY this dashboard node in place, leaving others alone
      dashboardContainer.replaceChild(inventoryLowStockDashBoardClone, existingDashboard);
    } else {
      // If it's not there yet, append it normally
      dashboardContainer.appendChild(inventoryLowStockDashBoardClone);
    }
  }
}
