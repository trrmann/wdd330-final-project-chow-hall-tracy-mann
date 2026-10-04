const weekDays = [{
    label: 'Mon',
    status: 'planned'
  },
  {
    label: 'Tue',
    status: 'planned'
  },
  {
    label: 'Wed',
    status: 'planned'
  },
  {
    label: 'Thu',
    status: 'review'
  },
  {
    label: 'Fri',
    status: 'empty'
  },
  {
    label: 'Sat',
    status: 'empty'
  },
  {
    label: 'Sun',
    status: 'suggestion'
  },
];

const recipes = ['Southern Fried Chicken', 'Salisbury Steak'];

export class HomePage {
  render() {
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
          <section class="dashboard-panel dashboard-panel-week" id="weekly-meal-plan" aria-labelledby="week-title">
            <div class="panel-heading">
              <div>
                <p class="panel-kicker">This week</p>
                <h2 id="week-title">Weekly Meal Plan</h2>
              </div>
              <a class="panel-link" href="/MealPlan/">Open meal plan</a>
            </div>
            <ol class="week-strip">
              ${weekDays.map((day) => `
                <li class="week-strip-day">
                  <span class="week-strip-label">${day.label}</span>
                  <span class="week-strip-status week-strip-status-${day.status}" role="img" aria-label="${day.status}"></span>
                </li>
              `).join('')}
            </ol>
          </section>

          <section class="dashboard-panel dashboard-panel-inventory" id="inventory-status" aria-labelledby="inventory-title">
            <div class="panel-heading">
              <div>
                <p class="panel-kicker">Pantry</p>
                <h2 id="inventory-title">Inventory Status</h2>
              </div>
              <a class="panel-link" href="/#shopping-list">Review list</a>
            </div>
            <div class="inventory-reading">
              <span class="inventory-reading-value">68%</span>
              <span>in stock</span>
            </div>
            <progress class="inventory-progress" value="68" max="100" aria-label="Pantry inventory, 68 percent in stock">68%</progress>
          </section>

          <section class="dashboard-panel dashboard-panel-shopping" id="shopping-list" aria-labelledby="shopping-title">
            <div class="panel-heading">
              <div>
                <p class="panel-kicker">To pick up</p>
                <h2 id="shopping-title">Shopping List</h2>
              </div>
              <span class="item-count">3 items</span>
            </div>
            <ul class="shopping-items">
              <li><label><input type="checkbox" /> Chicken</label></li>
              <li><label><input type="checkbox" /> Rice</label></li>
              <li><label><input type="checkbox" /> Milk</label></li>
            </ul>
          </section>

          <section class="dashboard-panel dashboard-panel-low-stock" aria-labelledby="low-stock-title">
            <div class="panel-heading">
              <div>
                <p class="panel-kicker">Restock soon</p>
                <h2 id="low-stock-title">Low Stock</h2>
              </div>
            </div>
            <ul class="low-stock-items">
              <li>Lard</li>
              <li>Ground Beef</li>
            </ul>
          </section>

          <section class="dashboard-panel dashboard-panel-recipes" id="recipe-search" aria-labelledby="recipe-title">
            <div class="panel-heading">
              <div>
                <p class="panel-kicker">A few ideas</p>
                <h2 id="recipe-title">Recipe Suggestions</h2>
              </div>
            </div>
            <ul class="recipe-suggestions" data-recipe-list>
              ${recipes.map((recipe) => `<li><a href="/MealPlan/">${recipe}</a></li>`).join('')}
            </ul>
          </section>
        </div>
      </div>
    `;
  }

  mount(root) {
    root.innerHTML = this.render();
  }
}
