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
  render() {
    const weekDash = new MealPlanPage().WeekDash();
    const inventoryStatusDash = new InventoryPage().InventoryStatusDash();
    const inventoryLowStockDash = new InventoryPage().InventoryLowStockDash();
    const shoppingListDash = new ShoppingPage().ShoppingListDash();
    const recipeSuggestionsDash = new SearchPage().RecipeSuggestionsDash();
    return `
      <div class="home-page">
        <section class="home-intro" aria-labelledby="home-title">
          <div>
            <p class="home-kicker">Meal planning for gatherings</p>
            <h1 id="home-title">Chow Hall</h1>
            <p>Plan a meal, keep track of your pantry, and know what to pick up.</p>
          </div>
          <a class="primary-action" href="/MealPlan/">Plan a meal</a>
        </section>
        <div class="home-dashboard">
            ${weekDash}
            ${inventoryStatusDash}
            ${shoppingListDash}
            ${inventoryLowStockDash}
            ${recipeSuggestionsDash}
        </div>
      </div>
    `;
  }

  mount(root) {
    root.innerHTML = this.render();
  }
}
