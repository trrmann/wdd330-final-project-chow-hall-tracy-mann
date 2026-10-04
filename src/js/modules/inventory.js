export class InventoryPage {
  render() {
    return `
      <div class="inventory-page">
        <section class="inventory-intro" aria-labelledby="inventory-title">
          <p class="home-kicker">Your gathering</p>
          <h1 id="inventory-title">Inventory</h1>
          <p>Manage your inventory and keep track of your supplies.</p>
        </section>
      </div>
    `;
  }

  mount(root) {
    root.innerHTML = this.render();
  }
  InventoryStatusDash() {
    return `
          <section class="dashboard-panel dashboard-panel-inventory" id="inventory-status" aria-labelledby="inventory-title">
            <div class="panel-heading">
              <div>
                <p class="panel-kicker">Pantry</p>
                <h2 id="inventory-title">Inventory Status</h2>
              </div>
              <a class="panel-link" href="/Inventory/">Review list</a>
            </div>
            <div class="inventory-reading">
              <span class="inventory-reading-value">68%</span>
              <span>in stock</span>
            </div>
            <progress class="inventory-progress" value="68" max="100" aria-label="Pantry inventory, 68 percent in stock">68%</progress>
          </section>`
  }
  InventoryLowStockDash() {
    return `
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
          </section>`
  }
}
