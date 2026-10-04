import {
  persistQueryParameter
} from '../utils.js';

const weekDays = [
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
  'Sun'
];
const weekDayStatuses = {
  current: {
    Mon: 'planned',
    Tue: 'planned',
    Wed: 'planned',
    Thu: 'planned',
    Fri: 'review',
    Sat: 'review',
    Sun: 'suggestion'
  },
  next: {
    Mon: 'planned',
    Tue: 'planned',
    Wed: 'review',
    Thu: 'suggestion',
    Fri: 'suggestion',
    Sat: 'empty',
    Sun: 'empty'
  }
};

export class MealPlanPage {
  static mealPlanPageMainId = 'app';
  static mealPlanPageTemplateId = 'meal-plan-page-template'
  static mealPlanDashBoardTemplateId = 'weekly-meal-plan-template';
  static mealPlanDashBoardClass = '.dashboard-panel-week';
  static mealPlanDayTemplateId = 'meal-plan-day-template';
  static mealPlanDashBoardPanelLinkClass = '.panel-link';
  static weekStripClass = '.week-strip';
  static weekStripLabelClass = '.week-strip-label';
  static weekStripStatusClass = '.week-strip-status';
  static weekStripStatusClassPrefix = 'week-strip-status-';
  #mealPlanPageContainer;
  #mealPlanPageTemplate;
  #mealPlanDashBoardTemplate;
  #mealPlanDayTemplate;
  #weekParameter;
  constructor(parms) {
    this.#mealPlanPageContainer = document.getElementById(MealPlanPage.mealPlanPageMainId);
    this.#mealPlanPageTemplate = document.getElementById(MealPlanPage.mealPlanPageTemplateId);
    this.#weekParameter = parms.week;
  }
  render() {
    this.#mealPlanPageContainer.innerHTML = '';
    this.#mealPlanPageContainer.appendChild(this.#mealPlanPageTemplate.content.cloneNode(true));
  }
  mountDashboard(dashboardContainer, weekParameter = this.#weekParameter) {
    this.renderWeekDashBoard(dashboardContainer, weekParameter);
  }
  renderWeekDashBoard(dashboardContainer, weekParameter = this.#weekParameter) {
    this.#mealPlanDashBoardTemplate = document.getElementById(MealPlanPage.mealPlanDashBoardTemplateId);
    this.#mealPlanDayTemplate = document.getElementById(MealPlanPage.mealPlanDayTemplateId);
    const weekDashBoardClone = this.#mealPlanDashBoardTemplate.content.cloneNode(true);
    const weekPanelLink = weekDashBoardClone.querySelector(MealPlanPage.mealPlanDashBoardPanelLinkClass);
    weekPanelLink.href = persistQueryParameter(weekPanelLink.href, 'week', weekParameter);
    const targetContainer = weekDashBoardClone.querySelector(MealPlanPage.weekStripClass);
    weekDays.forEach((day) => {
      const clone = this.#mealPlanDayTemplate.content.cloneNode(true);
      clone.querySelector(MealPlanPage.weekStripLabelClass).textContent = day;
      const statusSpan = clone.querySelector(MealPlanPage.weekStripStatusClass);
      statusSpan.classList.add(`${MealPlanPage.weekStripStatusClassPrefix}${ weekDayStatuses[weekParameter][day]}`);
      statusSpan.setAttribute('aria-label', weekDayStatuses[weekParameter][day]);
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
