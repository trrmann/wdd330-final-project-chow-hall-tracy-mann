export class InventoryPage {
  static inventoryPageMainId = 'app';
  static inventoryPageTemplateId = 'inventory-page-template';
  static inventoryStatusDashBoardTemplateId = 'inventory-status-dashboard-template';
  static inventoryLowStockDashBoardTemplateId = 'inventory-low-stock-dashboard-template';
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
    dashboardContainer.appendChild(inventoryStatusDashBoardClone);
  }
  renderInventoryLowStockDashBoard(dashboardContainer) {
    this.#inventoryLowStockDashBoardTemplate = document.getElementById(InventoryPage.inventoryLowStockDashBoardTemplateId);
    const inventoryLowStockDashBoardClone = this.#inventoryLowStockDashBoardTemplate.content.cloneNode(true);
    dashboardContainer.appendChild(inventoryLowStockDashBoardClone);
  }
}
