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
  static mealPlanPageMainId = 'app';
  static mealPlanPageTemplateId = 'meal-plan-page-template'
  static mealPlanDashBoardTemplateId = 'weekly-meal-plan-template';
  static mealPlanDashBoardClass = '.dashboard-panel-week';
  static mealPlanDayTemplateId = 'meal-plan-day-template';
  static weekStripClass = '.week-strip';
  static weekStripLabelClass = '.week-strip-label';
  static weekStripStatusClass = '.week-strip-status';
  static weekStripStatusClassPrefix = 'week-strip-status-';
  #mealPlanPageContainer;
  #mealPlanPageTemplate;
  #mealPlanDashBoardTemplate;
  #mealPlanDayTemplate;
  constructor() {
    this.#mealPlanPageContainer = document.getElementById(MealPlanPage.mealPlanPageMainId);
    this.#mealPlanPageTemplate = document.getElementById(MealPlanPage.mealPlanPageTemplateId);
  }
  render() {
    this.#mealPlanPageContainer.innerHTML = '';
    this.#mealPlanPageContainer.appendChild(this.#mealPlanPageTemplate.content.cloneNode(true));
  }
  mountDashboard(dashboardContainer) {
    this.renderWeekDashBoard(dashboardContainer);
  }
  renderWeekDashBoard(dashboardContainer) {
    this.#mealPlanDashBoardTemplate = document.getElementById(MealPlanPage.mealPlanDashBoardTemplateId);
    this.#mealPlanDayTemplate = document.getElementById(MealPlanPage.mealPlanDayTemplateId);
    const weekDashBoardClone = this.#mealPlanDashBoardTemplate.content.cloneNode(true);
    const targetContainer = weekDashBoardClone.querySelector(MealPlanPage.weekStripClass);
    weekDays.forEach((day) => {
      const clone = this.#mealPlanDayTemplate.content.cloneNode(true);
      clone.querySelector(MealPlanPage.weekStripLabelClass).textContent = day.label;
      const statusSpan = clone.querySelector(MealPlanPage.weekStripStatusClass);
      statusSpan.classList.add(`${MealPlanPage.weekStripStatusClassPrefix}${day.status}`);
      statusSpan.setAttribute('aria-label', day.status);
      targetContainer.appendChild(clone);
    });
    const existingDashboard = dashboardContainer.querySelector(MealPlanPage.mealPlanDashBoardClass);
    if (existingDashboard) {
      // If it exists, replace ONLY this dashboard node in place, leaving others alone
      dashboardContainer.replaceChild(weekDashBoardClone, existingDashboard);
    } else {
      // If it's not there yet, append it normally
      dashboardContainer.appendChild(weekDashBoardClone);
    }
  }
}
