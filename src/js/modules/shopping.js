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
    this.#renderShoppingList();
  }
  #renderShoppingList() {
    const root = this.#shoppingPageContainer;
    const list = root.querySelector('.shopping-list-items');
    const message = root.querySelector('.shopping-list-message');
    const shoppingList = Object.values(siteData.shoppingList.toJSON().collection);
    if (!shoppingList.length) {
      const emptyMessage = document.createElement('li');
      emptyMessage.textContent = 'No shopping-list items.';
      list.appendChild(emptyMessage);
      return;
    }
    shoppingList.forEach(ingredient => {
      const row = document.createElement('li');
      const label = document.createElement('span');
      label.textContent = `${ingredient.Name}: ${ingredient.Quantity ?? 'Unquantified'} ${ingredient.Unit || ''}`.trim();
      row.appendChild(label);
      if (Number.isFinite(ingredient.Quantity) && ingredient.Quantity > 0) {
        const purchaseForm = document.createElement('form');
        purchaseForm.className = 'shopping-purchase-form';
        const purchasedLabel = document.createElement('label');
        const purchasedLabelText = document.createElement('span');
        purchasedLabelText.textContent = `Quantity purchased (${ingredient.Unit || 'each'})`;
        const purchasedQuantity = document.createElement('input');
        purchasedQuantity.type = 'number';
        purchasedQuantity.min = '0.000001';
        purchasedQuantity.step = 'any';
        purchasedQuantity.required = true;
        purchasedQuantity.value = String(ingredient.Quantity);
        purchasedLabel.append(purchasedLabelText, purchasedQuantity);
        const purchased = document.createElement('button');
        purchased.type = 'submit';
        purchased.textContent = 'Record purchase';
        purchaseForm.append(purchasedLabel, purchased);
        purchaseForm.addEventListener('submit', event => {
          event.preventDefault();
          try {
            const result = siteData.purchaseShoppingListItem(
              ingredient.Name,
              Number(purchasedQuantity.value),
              ingredient.Unit || null
            );
            const statusMessage = result.remaining > 0 ?
              `Recorded ${result.purchased} ${result.unit} of ${ingredient.Name}; ${result.remaining} ${result.unit} still needed.` :
              `Recorded ${result.purchased} ${result.unit} of ${ingredient.Name}; the shopping-list item is complete.`;
            this.render();
            this.#shoppingPageContainer.querySelector('.shopping-list-message').textContent = statusMessage;
          } catch (error) {
            message.textContent = `Could not record purchase: ${error.message}`;
          }
        });
        row.appendChild(purchaseForm);
      }
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'negative-action';
      remove.textContent = 'Remove';
      remove.addEventListener('click', () => {
        try {
          siteData.removeShoppingListItem(ingredient.Name, ingredient.Unit || null);
          const statusMessage = `${ingredient.Name} removed from the shopping list.`;
          this.render();
          this.#shoppingPageContainer.querySelector('.shopping-list-message').textContent = statusMessage;
        } catch (error) {
          message.textContent = `Could not remove shopping-list item: ${error.message}`;
        }
      });
      row.appendChild(remove);
      list.appendChild(row);
    });
  }
  mountDashboard(dashboardContainer) {
    this.renderShoppingListDashBoard(dashboardContainer);
    dashboardContainer.addEventListener('pantry-data-updated', () => {
      this.renderShoppingListDashBoard(dashboardContainer);
    });
  }
  renderShoppingListDashBoard(dashboardContainer) {
    this.#shoppingListDashBoardTemplate = document.getElementById(ShoppingPage.shoppingListDashBoardTemplateId);
    const shoppingDashBoardClone = this.#shoppingListDashBoardTemplate.content.cloneNode(true);
    const dashboard = shoppingDashBoardClone.querySelector(ShoppingPage.shoppingDashBoardClass);
    const targetContainer = shoppingDashBoardClone.querySelector(ShoppingPage.shoppingItemsClass);
    const shoppingListItemTemplate = document.getElementById(ShoppingPage.shoppingListItemTemplateId);
    targetContainer.innerHTML = '';
    const shoppingCollection = siteData.shoppingList.toJSON().collection;
    const shoppingList = Object.entries(shoppingCollection);
    if (!shoppingList.length) {
      const emptyMessage = document.createElement('li');
      emptyMessage.textContent = ShoppingPage.emptyShoppingListMessage;
      targetContainer.appendChild(emptyMessage);
    }
    shoppingList.forEach(([key, ingredient]) => {
      const clone = shoppingListItemTemplate.content.cloneNode(true);
      const checkbox = clone.querySelector('.shopping-item-select');
      const hasQuantity = Number.isFinite(ingredient.Quantity) && ingredient.Quantity > 0;
      checkbox.value = key;
      checkbox.disabled = !hasQuantity;
      checkbox.title = hasQuantity ? 'Select this item to record the listed amount as purchased' :
        'Add a numeric amount before recording this item as purchased';
      clone.querySelector(ShoppingPage.shoppingItemNameClass).textContent = hasQuantity ?
        `${ingredient.Quantity} ${ingredient.Unit || 'each'} ${ingredient.Name}` : [ingredient.Measure, ingredient.Name].filter(Boolean).join(' ');
      targetContainer.appendChild(clone);
    });
    const itemCountContainer = shoppingDashBoardClone.querySelector(ShoppingPage.itemCountNumberClass);
    itemCountContainer.textContent = shoppingList.length;
    const purchaseButton = dashboard.querySelector('.shopping-dashboard-purchase');
    purchaseButton.hidden = shoppingList.length === 0;
    dashboard.addEventListener('change', event => {
      if (!event.target.matches('.shopping-item-select')) return;
      purchaseButton.disabled = !dashboard.querySelector('.shopping-item-select:checked');
    });
    purchaseButton.addEventListener('click', () => {
      const selectedItems = [...dashboard.querySelectorAll('.shopping-item-select:checked')];
      const purchasedNames = [];
      const failures = [];
      selectedItems.forEach(checkbox => {
        const ingredient = shoppingCollection[checkbox.value];
        if (!ingredient || !Number.isFinite(ingredient.Quantity) || ingredient.Quantity <= 0) {
          failures.push(`${ingredient?.Name || 'An item'}: a valid amount is required`);
          return;
        }
        try {
          siteData.purchaseShoppingListItem(
            ingredient.Name,
            ingredient.Quantity,
            ingredient.Unit || null
          );
          purchasedNames.push(ingredient.Name);
        } catch (error) {
          failures.push(`${ingredient.Name}: ${error.message}`);
        }
      });
      const message = [
        purchasedNames.length ?
        `Recorded purchase for ${purchasedNames.join(', ')} and added the listed amounts to inventory.` : '',
        failures.length ? `Could not purchase ${failures.join('; ')}.` : ''
      ].filter(Boolean).join(' ');
      this.renderShoppingListDashBoard(dashboardContainer);
      dashboardContainer.querySelector('.shopping-dashboard-message').textContent = message;
      dashboardContainer.dispatchEvent(new CustomEvent('pantry-data-updated'));
    });
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
