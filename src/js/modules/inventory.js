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
}
