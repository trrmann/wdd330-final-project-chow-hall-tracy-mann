import {
  getWeekDays,
  getWeekForParameter,
  persistQueryParameter
} from '../utils.js';
import {
  updateHeaderWeekParameters
} from '../site-shell.js';
import {
  siteData
} from './site-data.js'

export class MealPlanPage {
  static mealPlanPageMainId = 'app';
  static mealPlanPageTemplateId = 'meal-plan-page-template'
  static mealPlanDashBoardTemplateId = 'weekly-meal-plan-template';
  static mealPlanDashBoardClass = '.dashboard-panel-week';
  static mealPlanDayTemplateId = 'meal-plan-day-template';
  static mealPlanDashBoardPanelLinkClass = '.panel-link';
  static mealPlanDashBoardPanelKickerClass = '.panel-kicker';
  static mealPlanDashBoardPanelKickerAnchorClass = '.panel-kicker-anchor'
  static weekStripClass = '.week-strip';
  static weekStripLabelClass = '.week-strip-label';
  static weekStripStatusClass = '.week-strip-status';
  static weekStripStatusClassPrefix = 'week-strip-status-';
  static mealPlanPageIntroClass = '.page-intro';
  static weekNavLabelClass = '.week-nav-label';
  static weekNavRangeClass = '.week-nav-range';
  static weekNavPanelClass = '.week-nav-panel';
  static weekNavButtonClass = '.week-nav-button';
  static weekNavCurrentResetButtonClass = '.week-current-reset-button';
  static folderTabsContainerClass = '.folder-tabs';
  static folderTabAttentionIndicatorClass = 'tab-attention-indicator';
  static folderTabTemplateId = 'folder-tab-template';
  static folderTabClass = '.folder-tab';
  static folderPanelClass = '.folder-panel';
  static activeTabClass = 'is-active';
  static dailyMealsListClass = '.daily-meals-list';
  static dailyMealSlotTemplateId = 'daily-meal-slot-template';
  static dailyMealSlotClass = '.daily-meal-slot';
  static dailyMealSlotLabelClass = '.meal-slot-label';
  static weekNavIsHiddenClass = 'is-hidden';
  static weekNavHasOffsetClass = 'has-offset';
  #mealPlanPageContainer;
  #mealPlanPageTemplate;
  #mealPlanDashBoardTemplate;
  #mealPlanDayTemplate;
  #weekParameter;
  #weekOffset;
  #selectedDay;
  #folderTabTemplate;
  #dailyMealsListContainer;
  #dailyMealSlotTemplate;
  constructor(parms) {
    this.#mealPlanPageContainer = document.getElementById(MealPlanPage.mealPlanPageMainId);
    this.#mealPlanPageTemplate = document.getElementById(MealPlanPage.mealPlanPageTemplateId);
    this.#folderTabTemplate = document.getElementById(MealPlanPage.folderTabTemplateId);
    this.#dailyMealSlotTemplate = document.getElementById(MealPlanPage.dailyMealSlotTemplateId);
    this.#weekParameter = parms.week;
    this.#selectedDay = new URLSearchParams(window.location.search).get('day') || 'Mon';
    this.#weekOffset = 0;
    this.#parseInitialWeekOffset();
  }
  get selectedDay() {
    return this.#selectedDay;
  }
  async render() {
    this.#mealPlanPageContainer.innerHTML = '';
    const pageContentClone = this.#mealPlanPageTemplate.content.cloneNode(true);
    this.#renderWeekNavigationData(pageContentClone);
    const tabsContainer = pageContentClone.querySelector(MealPlanPage.folderTabsContainerClass);
    const activeWeek = getWeekForParameter(this.#weekParameter, siteData);
    getWeekDays(activeWeek).forEach((day) => {
      const tabClone = this.#folderTabTemplate.content.cloneNode(true);
      const tabElement = tabClone.querySelector(MealPlanPage.folderTabClass);
      const activeStatus = day.status || 'empty';
      if (activeStatus === 'planned') {
        tabElement.classList.remove(MealPlanPage.folderTabAttentionIndicatorClass);
      } else {
        tabElement.classList.add(MealPlanPage.folderTabAttentionIndicatorClass);
      }
      tabElement.textContent = day.ID;
      tabElement.dataset.day = day.ID;
      if (day.ID === this.#selectedDay) {
        tabElement.classList.add(MealPlanPage.activeTabClass);
        tabElement.setAttribute('aria-selected', 'true');
      } else {
        tabElement.setAttribute('aria-selected', 'false');
      }
      tabsContainer.appendChild(tabClone);
    });
    this.updatePanelContent(pageContentClone, this.#weekParameter, this.#selectedDay);
    this.#mealPlanPageContainer.appendChild(pageContentClone);
    this.initFolderEvents(this.#mealPlanPageContainer);
    this.#initWeekNavigationEvents(this.#mealPlanPageContainer);
  }
  initFolderEvents(renderedFragment) {
    const tabsContainer = renderedFragment.querySelector(MealPlanPage.folderTabsContainerClass);
    if (!tabsContainer) return;

    tabsContainer.addEventListener('click', (event) => {
      const clickedTab = event.target.closest(MealPlanPage.folderTabClass);
      if (!clickedTab || clickedTab.classList.contains(MealPlanPage.activeTabClass)) return;
      this.#selectedDay = clickedTab.dataset.day;
      this.#updateUrlParameter('day', this.#selectedDay);
      this.#switchActiveTab(tabsContainer, clickedTab);
      this.updatePanelContent(this.#mealPlanPageContainer, this.#weekParameter, this.#selectedDay);
    });
  }
  #renderWeekNavigationData(container) {
    const labelContainer = container.querySelector(MealPlanPage.weekNavLabelClass);
    const resetButtonContainer = container.querySelector(MealPlanPage.weekNavCurrentResetButtonClass);
    const rangeContainer = container.querySelector(MealPlanPage.weekNavRangeClass);
    const week = siteData.getWeekByOffset(this.#weekOffset);
    const namedOffset = siteData.weekNamedOffsets[week.Name];
    if (namedOffset) {
      labelContainer.textContent = `${namedOffset.name} Week`;
      resetButtonContainer.classList.toggle(MealPlanPage.weekNavIsHiddenClass, namedOffset.resetHidden);
      resetButtonContainer.classList.toggle(MealPlanPage.weekNavHasOffsetClass, namedOffset.isOffset);
    } else {
      labelContainer.textContent = this.#weekOffset > 0 ? `Week +${this.#weekOffset}` : `Week ${this.#weekOffset}`;
      resetButtonContainer.classList.remove(MealPlanPage.weekNavIsHiddenClass);
      resetButtonContainer.classList.add(MealPlanPage.weekNavHasOffsetClass);
    }
    const monday = new Date(`${week.weekStartDate}T00:00:00`);
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    const formatter = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    rangeContainer.textContent = `${formatter.format(monday)} – ${formatter.format(sunday)}`;
  }
  #initWeekNavigationEvents(renderedFragment) {
    const navPanelContainer = renderedFragment.querySelector(MealPlanPage.weekNavPanelClass);
    const resetButtonContainer = renderedFragment.querySelector(MealPlanPage.weekNavCurrentResetButtonClass);
    if (!navPanelContainer) return;
    const foundItem = Object.values(siteData.weekNamedOffsets).find(item => item.offset === this.#weekOffset);
    const resultKey = foundItem ? foundItem.param : siteData.weekNamedOffsets.current.param;
    const isPreviousWeekAllowed = siteData.weekNamedOffsets[resultKey].allowPreviousWeek;
    const isNextWeekAllowed = siteData.weekNamedOffsets[resultKey].allowNextWeek;
    const prevButton = navPanelContainer.querySelector(`${MealPlanPage.weekNavButtonClass}[data-nav-dir="-1"]`);
    const nextButton = navPanelContainer.querySelector(`${MealPlanPage.weekNavButtonClass}[data-nav-dir="1"]`);
    if (prevButton) {
      prevButton.style.visibility = isPreviousWeekAllowed ? 'visible' : 'hidden';
    }
    if (nextButton) {
      nextButton.style.visibility = isNextWeekAllowed ? 'visible' : 'hidden';
    }
    navPanelContainer.addEventListener('click', (event) => {
      const buttonElement = event.target.closest(MealPlanPage.weekNavButtonClass);
      if (!buttonElement) return;
      const directionalStep = parseInt(buttonElement.dataset.navDir, 10);
      if (directionalStep < 0 && !isPreviousWeekAllowed) return;
      if (directionalStep > 0 && !isNextWeekAllowed) return;
      this.#weekOffset += directionalStep;
      let weekParamValue = String(this.#weekOffset);
      Object.keys(siteData.weekNamedOffsets).forEach((namedOffset) => {
        if (this.#weekOffset === siteData.weekNamedOffsets[namedOffset].offset) {
          weekParamValue = siteData.weekNamedOffsets[namedOffset].param;
        }
      });
      this.#updateUrlParameter('week', weekParamValue);
      this.#weekParameter = weekParamValue;
      updateHeaderWeekParameters(weekParamValue);
      this.render();
    });
    if (resetButtonContainer) {
      resetButtonContainer.addEventListener('click', () => {
        if (this.#weekOffset === 0) return;
        this.#weekOffset = 0;
        this.#weekParameter = siteData.weekNamedOffsets.current.param;
        this.#updateUrlParameter('week', siteData.weekNamedOffsets.current.param);
        this.render();
      });
    }
  }
  #parseInitialWeekOffset() {
    if (!this.#weekParameter) {
      this.#weekParameter = siteData.weekNamedOffsets.current.param;
    }
    const isNamedOffset = Object.values(siteData.weekNamedOffsets).some(item => item.param === this.#weekParameter);
    if (isNamedOffset) {
      this.#weekOffset = siteData.weekNamedOffsets[this.#weekParameter].offset;
    } else {
      const parsed = parseInt(this.#weekParameter, 10);
      this.#weekOffset = isNaN(parsed) ? 0 : parsed;
    }
  }
  #updateUrlParameter(key, value) {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    // Rewrites address string silently without triggering a structural page refresh
    window.history.replaceState({}, '', url.pathname + url.search);
  }
  #switchActiveTab(tabsContainer, newActiveTab) {
    const currentActive = tabsContainer.querySelector(`.${MealPlanPage.activeTabClass}`);
    if (currentActive) {
      currentActive.classList.remove(MealPlanPage.activeTabClass);
      currentActive.setAttribute('aria-selected', 'false');
    }
    newActiveTab.classList.add(MealPlanPage.activeTabClass);
    newActiveTab.setAttribute('aria-selected', 'true');
  }

  updatePanelContent(rootContainer, weekParameter, day) {
    const panel = rootContainer.querySelector(MealPlanPage.folderPanelClass);
    const heading = panel.querySelector('h3');
    this.#dailyMealsListContainer = rootContainer.querySelector(MealPlanPage.dailyMealsListClass);
    this.#dailyMealsListContainer.innerHTML = '';
    const activeDay = getWeekForParameter(weekParameter, siteData).days.getDayByID(day);
    const activeStatus = activeDay?.status || 'empty';
    const activeMeals = activeDay?.meals.toJSON().collection || {};
    heading.textContent = `${activeDay?.Name || day}'s Meal Plan:  (${activeStatus})`;
    Object.values(activeMeals).forEach(meal => {
      if (!meal.recipeIDs.length) {
        return;
      }
      const mealDetails = meal.recipeIDs.map(recipeID => {
        const recipe = siteData.recipes.getRecipeByID(recipeID) ||
          siteData.recipes.getRecipeByName(recipeID);
        const recipeName = recipe?.Name || recipeID;
        return `${meal.getRecipeServings(recipeID)} servings of ${recipeName}`;
      });
      const mealSlotClone = this.#dailyMealSlotTemplate.content.cloneNode(true);
      const dailyMealSlot = mealSlotClone.querySelector(MealPlanPage.dailyMealSlotClass);
      const dailyMealSlotLabel = dailyMealSlot.querySelector(MealPlanPage.dailyMealSlotLabelClass);
      const description = dailyMealSlot.querySelector('p');
      description.textContent = `${meal.Name} is ${mealDetails}.`;
      dailyMealSlotLabel.innerText = "";
      this.#dailyMealsListContainer.appendChild(mealSlotClone);
    });
  }
  mountDashboard(dashboardContainer, weekParameter = this.#weekParameter) {
    this.renderWeekDashBoard(dashboardContainer, weekParameter);
  }
  renderWeekDashBoard(dashboardContainer, weekParameter = this.#weekParameter) {
    this.#mealPlanDashBoardTemplate = document.getElementById(MealPlanPage.mealPlanDashBoardTemplateId);
    this.#mealPlanDayTemplate = document.getElementById(MealPlanPage.mealPlanDayTemplateId);
    const weekDashBoardClone = this.#mealPlanDashBoardTemplate.content.cloneNode(true);
    const weekKicker = weekDashBoardClone.querySelector(MealPlanPage.mealPlanDashBoardPanelKickerClass);
    const weekKickerAnchor = weekDashBoardClone.querySelector(MealPlanPage.mealPlanDashBoardPanelKickerAnchorClass);
    let isWeekParameterNamedDashboardOffset = false;
    Object.keys(siteData.weekNamedOffsets).forEach((namedOffset) => {
      const offset = siteData.weekNamedOffsets[namedOffset];
      if (weekParameter === offset['param']) {
        weekKicker.textContent = siteData.weekNamedOffsets[namedOffset].dashboardDisplay;
        weekKickerAnchor.href = persistQueryParameter(weekKickerAnchor.href, 'week', siteData.weekNamedOffsets[namedOffset].nextDashboardKey);
        weekKickerAnchor.title = siteData.weekNamedOffsets[namedOffset].dashboardTitle;
        isWeekParameterNamedDashboardOffset = true;
      }
    });
    if (!isWeekParameterNamedDashboardOffset) {
      weekKicker.textContent = `Other Week`;
      weekKickerAnchor.href = persistQueryParameter(weekKickerAnchor.href, 'week', siteData.weekNamedOffsets.current.param);
      weekKickerAnchor.title = 'Click to change to the current week!';
    }
    const weekPanelLink = weekDashBoardClone.querySelector(MealPlanPage.mealPlanDashBoardPanelLinkClass);
    weekPanelLink.href = persistQueryParameter(weekPanelLink.href, 'week', weekParameter);
    const targetContainer = weekDashBoardClone.querySelector(MealPlanPage.weekStripClass);
    const selectedWeek = getWeekForParameter(weekParameter, siteData);
    getWeekDays(selectedWeek).forEach(day => {
      const clone = this.#mealPlanDayTemplate.content.cloneNode(true);
      clone.querySelector(MealPlanPage.weekStripLabelClass).textContent = day.ID;
      const statusSpan = clone.querySelector(MealPlanPage.weekStripStatusClass);
      const status = day.status || 'empty';
      statusSpan.classList.add(`${MealPlanPage.weekStripStatusClassPrefix}${status}`);
      statusSpan.setAttribute('aria-label', status);
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
