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
  static lowStockDashboardTemplateId = 'low-stock-dashboard-template';
  static lowStockDashboardClass = '.dashboard-panel-low-stock';
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
    this.#renderInventoryManagement();
  }
  #renderInventoryManagement() {
    const root = this.#inventoryPageContainer;
    const stockList = root.querySelector('.inventory-stock-list');
    const form = root.querySelector('.inventory-item-form');
    const nameInput = root.querySelector('.inventory-name');
    const quantityInput = root.querySelector('.inventory-quantity');
    const unitInput = root.querySelector('.inventory-unit');
    const message = root.querySelector('.inventory-message');
    const renderRows = () => {
      stockList.replaceChildren();
      const inventory = Object.values(siteData.inventory.toJSON().collection);
      if (!inventory.length) {
        stockList.append(this.#emptyListItem('No stock has been recorded.'));
      }
      inventory.forEach(item => {
        const row = document.createElement('li');
        const label = document.createElement('span');
        label.textContent = `${item.Name}: ${item.Quantity ?? 'Unquantified'} ${item.Unit || item.Measure || ''}`.trim();
        const edit = document.createElement('button');
        edit.type = 'button';
        edit.textContent = 'Edit';
        edit.addEventListener('click', () => {
          nameInput.value = item.Name;
          quantityInput.value = Number.isFinite(item.Quantity) ? String(item.Quantity) : '';
          unitInput.value = item.Unit || '';
          nameInput.focus();
        });
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'negative-action';
        remove.textContent = 'Remove';
        remove.addEventListener('click', () => {
          try {
            siteData.removeInventoryItem(item.Name);
            message.textContent = `${item.Name} removed from stock.`;
            renderRows();
          } catch (error) {
            message.textContent = `Could not remove stock: ${error.message}`;
          }
        });
        row.append(label, edit, remove);
        stockList.append(row);
      });
    };
    form.addEventListener('submit', event => {
      event.preventDefault();
      try {
        siteData.setInventoryItem(
          nameInput.value,
          Number(quantityInput.value),
          unitInput.value
        );
        message.textContent = `Saved ${nameInput.value.trim()} stock.`;
        form.reset();
        renderRows();
      } catch (error) {
        message.textContent = `Could not save stock: ${error.message}`;
      }
    });
    renderRows();
    this.#renderIngredientUnitConversions(root);
  }
  #renderIngredientUnitConversions(root) {
    const form = root.querySelector('.ingredient-unit-conversion-form');
    const ingredientInput = root.querySelector('.conversion-ingredient');
    const fromQuantityInput = root.querySelector('.conversion-from-quantity');
    const fromUnitInput = root.querySelector('.conversion-from-unit');
    const toQuantityInput = root.querySelector('.conversion-to-quantity');
    const toUnitInput = root.querySelector('.conversion-to-unit');
    const conversionList = root.querySelector('.ingredient-unit-conversion-list');
    const message = root.querySelector('.unit-conversion-message');
    const renderConversions = () => {
      conversionList.replaceChildren();
      const conversions = siteData.ingredientUnitConversions;
      if (!conversions.length) {
        const item = document.createElement('li');
        item.textContent = 'No ingredient unit translations have been saved.';
        conversionList.append(item);
      }
      conversions.forEach(conversion => {
        const item = document.createElement('li');
        const label = document.createElement('span');
        label.textContent =
          `${conversion.ingredient}: ${conversion.fromQuantity} ${conversion.fromUnit} = ${conversion.toQuantity} ${conversion.toUnit}`;
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'negative-action';
        remove.textContent = 'Remove';
        remove.addEventListener('click', () => {
          try {
            siteData.removeIngredientUnitConversion(conversion.id);
            message.textContent = `Removed the ${conversion.ingredient} unit translation.`;
            renderConversions();
          } catch (error) {
            message.textContent = `Could not remove translation: ${error.message}`;
          }
        });
        item.append(label, remove);
        conversionList.append(item);
      });
    };
    form.addEventListener('submit', event => {
      event.preventDefault();
      try {
        const conversion = siteData.setIngredientUnitConversion(
          ingredientInput.value,
          Number(fromQuantityInput.value),
          fromUnitInput.value,
          Number(toQuantityInput.value),
          toUnitInput.value
        );
        message.textContent =
          `Saved ${conversion.ingredient}: ${conversion.fromQuantity} ${conversion.fromUnit} = ${conversion.toQuantity} ${conversion.toUnit}.`;
        form.reset();
        renderConversions();
      } catch (error) {
        message.textContent = `Could not save translation: ${error.message}`;
      }
    });
    renderConversions();
  }
  #emptyListItem(text) {
    const item = document.createElement('li');
    item.textContent = text;
    return item;
  }
  mountDashboards(dashboardContainer, weekParameter = this.#weekParameter) {
    this.renderInventoryStatusDashBoard(dashboardContainer, weekParameter);
    this.renderLowStockDashboard(dashboardContainer, weekParameter);
    dashboardContainer.addEventListener('pantry-data-updated', () => {
      this.renderInventoryStatusDashBoard(dashboardContainer, weekParameter);
      this.renderLowStockDashboard(dashboardContainer, weekParameter);
    });
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
      clone.querySelector(InventoryPage.inventoryItemNameClass).textContent = Number.isFinite(ingredient.Quantity) ?
        `${ingredient.Quantity} ${ingredient.Unit || ''} ${ingredient.Name}`.trim() : [ingredient.Measure, ingredient.Name].filter(Boolean).join(' ');
      targetContainer.appendChild(clone);
    });
    const existingDashboard = dashboardContainer.querySelector(InventoryPage.inventoryDashBoardClass);
    if (existingDashboard) {
      dashboardContainer.replaceChild(inventoryStatusDashBoardClone, existingDashboard);
    } else {
      dashboardContainer.appendChild(inventoryStatusDashBoardClone);
    }
  }
  renderLowStockDashboard(dashboardContainer, weekParameter = this.#weekParameter) {
    const template = document.getElementById(InventoryPage.lowStockDashboardTemplateId);
    const clone = template.content.cloneNode(true);
    const panel = clone.querySelector(InventoryPage.lowStockDashboardClass);
    const list = panel.querySelector('.low-stock-items');
    const message = panel.querySelector('.low-stock-message');
    const shortages = siteData.getPlannedIngredientShortages(weekParameter);
    if (!shortages.length) {
      const item = document.createElement('li');
      item.textContent = 'No uncovered ingredient shortages for planned meals.';
      list.appendChild(item);
    }
    shortages.forEach(shortage => {
      const item = document.createElement('li');
      item.className = 'low-stock-entry';
      const label = document.createElement('span');
      label.textContent =
        `${shortage.name}: ${shortage.missing.toLocaleString()} ${shortage.unit} still needed`;
      const addButton = document.createElement('button');
      addButton.type = 'button';
      addButton.textContent = 'Add';
      addButton.setAttribute('aria-label', `Add ${shortage.name} to shopping list`);
      addButton.addEventListener('click', () => {
        try {
          siteData.addMealShortagesToShoppingList([shortage]);
          dashboardContainer.dispatchEvent(new CustomEvent('pantry-data-updated'));
        } catch (error) {
          message.textContent = `Could not add ${shortage.name}: ${error.message}`;
        }
      });
      item.append(label, addButton);
      list.appendChild(item);
    });
    const existingDashboard = dashboardContainer.querySelector(InventoryPage.lowStockDashboardClass);
    if (existingDashboard) {
      dashboardContainer.replaceChild(clone, existingDashboard);
    } else {
      dashboardContainer.appendChild(clone);
    }
  }
}
