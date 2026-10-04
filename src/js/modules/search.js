const recipes = ['Southern Fried Chicken', 'Salisbury Steak'];

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

  RecipeSuggestionsDash() {
    return `
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
    `;
  }
}
