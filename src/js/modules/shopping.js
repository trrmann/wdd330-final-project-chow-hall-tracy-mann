export class ShoppingPage {
  render() {
    return `
      <div class="shopping-page">
        <section class="shopping-intro" aria-labelledby="shopping-title">
          <p class="home-kicker">Your gathering</p>
          <h1 id="shopping-title">Shopping</h1>
          <p>Build a shopping list from the ingredients you need.</p>
        </section>
      </div>
    `;
  }

  mount(root) {
    root.innerHTML = this.render();
  }
  ShoppingListDash() {
    return `<section class="dashboard-panel dashboard-panel-shopping" id="shopping-list" aria-labelledby="shopping-title">
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
          </section>`;
  }
}
