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
  WeekDash() {
    return `
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
    `;
  }
}
