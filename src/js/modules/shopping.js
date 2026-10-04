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
}
