import {
  persistQueryParameter
} from '../utils.js';
import {
  siteData
} from './site-data.js'

export class InventoryPage {
  static inventoryPageMainId = 'app';
  static inventoryPageTemplateId = 'inventory-page-template';
  static inventoryStatusDashBoardTemplateId = 'inventory-status-dashboard-template';
  static inventoryDashBoardClass = '.dashboard-panel-inventory';
  static inventoryDashBoardPanelLinkClass = '.panel-link';
  static inventoryItemsClass = '.inventory-items';
  static inventoryItemTemplateId = 'inventory-item-template';
  static inventoryItemNameClass = '.inventory-item-name';
  #inventoryPageContainer
  #inventoryPageTemplate;
  #inventoryStatusDashBoardTemplate;
  #weekParameter;
  constructor(parms) {
    this.#inventoryPageContainer = document.getElementById(InventoryPage.inventoryPageMainId);
    this.#inventoryPageTemplate = document.getElementById(InventoryPage.inventoryPageTemplateId);
    this.#weekParameter = parms.week;
  }
  render() {
    this.#inventoryPageContainer.innerHTML = '';
    this.#inventoryPageContainer.appendChild(this.#inventoryPageTemplate.content.cloneNode(true));
  }
  mountDashboards(dashboardContainer, weekParameter = this.#weekParameter) {
    this.renderInventoryStatusDashBoard(dashboardContainer, weekParameter);
  }
  renderInventoryStatusDashBoard(dashboardContainer, weekParameter = this.#weekParameter) {
    this.#inventoryStatusDashBoardTemplate = document.getElementById(InventoryPage.inventoryStatusDashBoardTemplateId);
    const inventoryStatusDashBoardClone = this.#inventoryStatusDashBoardTemplate.content.cloneNode(true);
    const inventoryStatusPanelLink = inventoryStatusDashBoardClone.querySelector(InventoryPage.inventoryDashBoardPanelLinkClass);
    inventoryStatusPanelLink.href = persistQueryParameter(inventoryStatusPanelLink.href, 'week', weekParameter);
    const targetContainer = inventoryStatusDashBoardClone.querySelector(InventoryPage.inventoryItemsClass);
    const inventoryItemTemplate = document.getElementById(InventoryPage.inventoryItemTemplateId);
    const ingredients = Object.values(siteData.inventory.toJSON().collection);
    if (!ingredients.length) {
      const emptyMessage = document.createElement('li');
      emptyMessage.textContent = 'No inventory data available yet.';
      targetContainer.appendChild(emptyMessage);
    }
    ingredients.forEach(ingredient => {
      const clone = inventoryItemTemplate.content.cloneNode(true);
      clone.querySelector(InventoryPage.inventoryItemNameClass).textContent = [ingredient.Measure, ingredient.Name].filter(Boolean).join(' ');
      targetContainer.appendChild(clone);
    });
    const existingDashboard = dashboardContainer.querySelector(InventoryPage.inventoryDashBoardClass);
    if (existingDashboard) {
      dashboardContainer.replaceChild(inventoryStatusDashBoardClone, existingDashboard);
    } else {
      dashboardContainer.appendChild(inventoryStatusDashBoardClone);
    }
  }
}
