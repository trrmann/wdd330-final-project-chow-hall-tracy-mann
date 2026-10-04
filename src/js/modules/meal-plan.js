export class MealPlanPage {
  render() {
    return `
      <div class="meal-plan-page">
        <section class="meal-plan-intro" aria-labelledby="meal-plan-title">
          <p class="home-kicker">Your gathering</p>
          <h1 id="meal-plan-title">Meal Plan</h1>
          <p>Choose meals for your week and build a shopping list from the ingredients you need.</p>
        </section>
      </div>
    `;
  }

  mount(root) {
    root.innerHTML = this.render();
  }
}
