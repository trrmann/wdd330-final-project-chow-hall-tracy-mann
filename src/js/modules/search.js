export class SearchPage {
  render() {
    return `
      <div class="search-page">
        <section class="search-intro" aria-labelledby="search-title">
          <p class="home-kicker">Your gathering</p>
          <h1 id="search-title">Search</h1>
          <p>Find recipes and ingredients for your meals.</p>
        </section>
      </div>
    `;
  }

  mount(root) {
    root.innerHTML = this.render();
  }
}
