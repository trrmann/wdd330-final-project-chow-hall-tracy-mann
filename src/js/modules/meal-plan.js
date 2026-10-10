import {
  getWeekDays,
  getWeekForParameter,
  persistQueryParameter
} from '../utils.js';
import {
  updateHeaderWeekParameters
} from '../site-shell.js';
import {
  SiteData,
  siteData
} from './site-data.js'
import {
  appendRecipeOriginFlag
} from '../recipe-origin.js'

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
  static pastDayNoticeClass = '.past-day-notice';
  static pastDayEmptyNoteClass = '.past-day-empty-note';
  static dailyMealStatusClass = '.meal-plan-day-status';
  static activeTabClass = 'is-active';
  static dailyMealsListClass = '.daily-meals-list';
  static dailyMealSlotTemplateId = 'daily-meal-slot-template';
  static dailyMealSlotClass = '.daily-meal-slot';
  static dailyMealSlotLabelClass = '.meal-slot-label';
  static dailyMealSlotSummaryClass = '.meal-slot-summary';
  static dailyMealSlotRecipesClass = '.meal-slot-recipes';
  static dailyMealSlotEmptyClass = '.meal-slot-empty';
  static dailyMealSlotServingsClass = '.meal-servings-required';
  static dailyMealSlotMessageClass = '.meal-servings-message';
  static dailyMealSlotAddRecipeClass = '.meal-slot-add-recipe';
  static mealSlotRecipeTemplateId = 'meal-slot-recipe-template';
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
  #mealSlotRecipeTemplate;
  #weekCopyDates = new Set();
  #weekCopyOpen = false;
  constructor(parms) {
    this.#mealPlanPageContainer = document.getElementById(MealPlanPage.mealPlanPageMainId);
    this.#mealPlanPageTemplate = document.getElementById(MealPlanPage.mealPlanPageTemplateId);
    this.#folderTabTemplate = document.getElementById(MealPlanPage.folderTabTemplateId);
    this.#dailyMealSlotTemplate = document.getElementById(MealPlanPage.dailyMealSlotTemplateId);
    this.#mealSlotRecipeTemplate = document.getElementById(MealPlanPage.mealSlotRecipeTemplateId);
    this.#weekParameter = parms.week;
    this.#weekOffset = 0;
    this.#parseInitialWeekOffset();
    const requestedDay = new URLSearchParams(window.location.search).get('day');
    const weekDayIDs = getWeekDays(getWeekForParameter(this.#weekParameter, siteData))
      .map(day => day.ID);
    this.#selectedDay = requestedDay || (
      this.#weekOffset === 0 ?
      weekDayIDs[(new Date().getDay() + 6) % 7] :
      weekDayIDs[0]
    );
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
    getWeekDays(activeWeek).forEach((day, dayIndex) => {
      const tabClone = this.#folderTabTemplate.content.cloneNode(true);
      const tabElement = tabClone.querySelector(MealPlanPage.folderTabClass);
      const isPastDay = this.#isPastDay(activeWeek.weekStartDate, dayIndex);
      const activeStatus = day.status || 'empty';
      if (isPastDay) {
        tabElement.classList.add('is-past-day');
        tabElement.title = 'Past day: meal planning is closed';
        tabElement.setAttribute('aria-label', `${day.Name}, past day. Meal planning is closed.`);
      }
      if (!isPastDay && activeStatus !== 'planned') {
        tabElement.classList.add(MealPlanPage.folderTabAttentionIndicatorClass);
      } else {
        tabElement.classList.remove(MealPlanPage.folderTabAttentionIndicatorClass);
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
    this.#initWeekCopyControls(this.#mealPlanPageContainer);
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
  #initWeekCopyControls(renderedFragment) {
    const controls = renderedFragment.querySelector('.week-copy-controls');
    const details = controls.querySelector('.week-copy-details');
    const dateInput = controls.querySelector('.week-copy-date');
    const sourceDateInput = controls.querySelector('.week-copy-source-date');
    const dateList = controls.querySelector('.week-copy-date-list');
    const applyButton = controls.querySelector('.week-copy-apply');
    const message = controls.querySelector('.week-copy-message');
    const week = getWeekForParameter(this.#weekParameter, siteData);
    const hasRecipes = Object.values(week.days.toJSON().collection).some(day =>
      Object.values(day.meals.toJSON().collection).some(meal => meal.recipeIDs.length)
    );
    const hasEditableDays = Array.from({
        length: SiteData.weekDays.length
      }, (_, index) =>
      !this.#isPastDay(week.weekStartDate, index)
    ).some(Boolean);
    const hasEditableEmptyMeals = SiteData.weekDays.some(([dayID], dayIndex) =>
      !this.#isPastDay(week.weekStartDate, dayIndex) &&
      Object.values(week.days.getDayByID(dayID)?.meals.toJSON().collection || {})
      .some(meal => !meal.recipeIDs.length)
    );
    controls.querySelector('.week-copy-from-controls').hidden = hasRecipes || !hasEditableDays;
    details.hidden = !hasRecipes;
    controls.querySelector('.week-generate').disabled = !hasEditableEmptyMeals;
    details.open = this.#weekCopyOpen;
    const today = new Date();
    dateInput.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const renderDates = () => {
      dateList.innerHTML = '';
      [...this.#weekCopyDates].sort().forEach(date => {
        const item = document.createElement('li');
        const label = document.createElement('span');
        const removeButton = document.createElement('button');
        label.textContent = date;
        removeButton.type = 'button';
        removeButton.className = 'week-copy-remove-date';
        removeButton.dataset.date = date;
        removeButton.textContent = 'Remove';
        item.append(label, removeButton);
        dateList.appendChild(item);
      });
      applyButton.disabled = this.#weekCopyDates.size === 0;
    };
    renderDates();
    details.addEventListener('toggle', () => {
      this.#weekCopyOpen = details.open;
      message.textContent = '';
    });
    controls.querySelector('.week-generate').addEventListener('click', () => {
      try {
        const result = siteData.generateWeekPlan(this.#weekParameter);
        this.render();
        this.#mealPlanPageContainer.querySelector('.week-generate-message').textContent =
          `Generated ${result.meals} meal${result.meals === 1 ? '' : 's'} across ${result.days} day${result.days === 1 ? '' : 's'}. Existing meals were kept; past days were skipped.${result.unfilled ? ` ${result.unfilled} empty meal slot${result.unfilled === 1 ? ' was' : 's were'} left empty because no unused recipes were available.` : ''}`;
      } catch (error) {
        controls.querySelector('.week-generate-message').textContent =
          `Could not generate week: ${error.message}`;
      }
    });
    controls.querySelector('.week-copy-from').addEventListener('click', () => {
      if (!sourceDateInput.value) {
        controls.querySelector('.week-generate-message').textContent = 'Choose the Monday date of the source week.';
        return;
      }
      if (!window.confirm(`Copy the week beginning ${sourceDateInput.value} into this week? Existing destination plans will be replaced.`)) {
        return;
      }
      try {
        const count = siteData.copyWeekPlanFromDate(this.#weekParameter, sourceDateInput.value);
        this.render();
        this.#mealPlanPageContainer.querySelector('.week-generate-message').textContent =
          `Copied ${count} day${count === 1 ? '' : 's'} from the selected week. Past destination days were skipped.`;
      } catch (error) {
        controls.querySelector('.week-generate-message').textContent =
          `Could not copy week: ${error.message}`;
      }
    });
    controls.querySelector('.week-copy-add-date').addEventListener('click', () => {
      if (!dateInput.value) {
        message.textContent = 'Choose a destination date first.';
        return;
      }
      this.#weekCopyDates.add(dateInput.value);
      dateInput.value = '';
      message.textContent = '';
      renderDates();
    });
    dateList.addEventListener('click', event => {
      const removeButton = event.target.closest('.week-copy-remove-date');
      if (!removeButton) return;
      this.#weekCopyDates.delete(removeButton.dataset.date);
      renderDates();
    });
    controls.querySelector('.week-copy-cancel').addEventListener('click', () => {
      this.#weekCopyDates.clear();
      this.#weekCopyOpen = false;
      this.render();
    });
    applyButton.addEventListener('click', () => {
      if (!this.#weekCopyDates.size) {
        message.textContent = 'Add at least one destination date.';
        return;
      }
      if (!window.confirm('Copy this week to the selected dates? Existing meal plans on those dates will be replaced.')) {
        return;
      }
      try {
        const count = siteData.copyWeekPlanToDates(this.#weekParameter, [...this.#weekCopyDates]);
        this.#weekCopyDates.clear();
        this.#weekCopyOpen = true;
        this.render();
        this.#mealPlanPageContainer.querySelector('.week-copy-message').textContent =
          `Copied the week plan to ${count} selected date${count === 1 ? '' : 's'}.`;
      } catch (error) {
        message.textContent = `Could not copy week: ${error.message}`;
      }
    });
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

  #isPastDay(weekStartDate, dayIndex) {
    const dayDate = new Date(`${weekStartDate}T00:00:00`);
    dayDate.setDate(dayDate.getDate() + dayIndex);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dayDate < today;
  }

  #updateRecipeCoverageSummary(recipeItem, meal) {
    const servingsNeeded = Number(recipeItem.querySelector('.recipe-servings-needed').value);
    const servingsProduced = Number(recipeItem.querySelector('.recipe-servings-produced').value);
    const percentage = servingsNeeded / meal.servingsRequired * 100;
    const batches = servingsProduced > 0 ? servingsNeeded / servingsProduced : 0;
    recipeItem.querySelector('.recipe-meal-share-summary').textContent =
      `${servingsNeeded} of ${meal.servingsRequired} meal servings (${percentage.toFixed(0)}%) · ${batches.toLocaleString(undefined, { maximumFractionDigits: 2 })} batch${batches === 1 ? '' : 'es'}`;
  }

  #renderExecutionCheck(mealSlot, check) {
    const status = mealSlot.querySelector('.meal-execution-status');
    const message = mealSlot.querySelector('.meal-execution-message');
    const unresolvedList = mealSlot.querySelector('.meal-ingredient-resolution-list');
    const shortageList = mealSlot.querySelector('.meal-execution-shortages');
    const shoppingButton = mealSlot.querySelector('.meal-shortages-shopping');
    const executeButton = mealSlot.querySelector('.meal-slot-execute');
    unresolvedList.replaceChildren(...check.unresolved.map(unresolved => {
      const item = document.createElement('li');
      const description = document.createElement('p');
      description.textContent =
        `${unresolved.name} in ${unresolved.recipeName}: "${unresolved.measure || 'no amount provided'}" needs a numeric amount and recognized unit.`;
      const form = document.createElement('form');
      form.className = 'meal-amount-resolution-form';
      form.dataset.recipeId = unresolved.recipeID;
      form.dataset.ingredientKey = unresolved.ingredientKey;
      const quantityLabel = document.createElement('label');
      const quantityText = document.createElement('span');
      quantityText.textContent = 'Amount';
      const quantityInput = document.createElement('input');
      quantityInput.type = 'number';
      quantityInput.min = '0.000001';
      quantityInput.step = 'any';
      quantityInput.required = true;
      quantityInput.setAttribute('aria-label', `Amount for ${unresolved.name}`);
      quantityLabel.append(quantityText, quantityInput);
      const unitLabel = document.createElement('label');
      const unitText = document.createElement('span');
      unitText.textContent = 'Unit';
      const unitInput = document.createElement('input');
      unitInput.type = 'text';
      unitInput.required = true;
      unitInput.maxLength = 40;
      unitInput.placeholder = 'e.g. g, cup, each';
      unitInput.setAttribute('aria-label', `Unit for ${unresolved.name}`);
      unitLabel.append(unitText, unitInput);
      const saveButton = document.createElement('button');
      saveButton.type = 'submit';
      saveButton.textContent = 'Save amount';
      form.append(quantityLabel, unitLabel, saveButton);
      item.append(description, form);
      return item;
    }));
    shortageList.replaceChildren(...check.shortages.map(shortage => {
      const item = document.createElement('li');
      item.textContent =
        `${shortage.name}: ${shortage.available.toLocaleString()} ${shortage.unit} available; ${shortage.required.toLocaleString()} required (${shortage.missing.toLocaleString()} missing).`;
      return item;
    }));
    const hasUnresolved = check.unresolved.length > 0;
    const hasShortages = check.shortages.length > 0;
    status.hidden = !hasUnresolved && !hasShortages;
    shoppingButton.hidden = hasUnresolved || !hasShortages;
    executeButton.textContent = hasUnresolved ?
      '⚠ Resolve amounts' :
      hasShortages ? '⚠ Check inventory' : 'Execute meal';
    if (hasUnresolved) {
      message.textContent =
        'Some recipe amounts or units could not be safely read. Enter a numeric amount and recognized unit for each item; your corrections are saved to the recipe and reused in future plans.';
    } else if (hasShortages) {
      message.textContent =
        'Inventory is short. Add the deficit to the shopping list or reduce recipe servings, then check again.';
      shoppingButton.dataset.shortages = JSON.stringify(check.shortages);
    } else {
      message.textContent = '';
    }
  }

  updatePanelContent(rootContainer, weekParameter, day) {
    const panel = rootContainer.querySelector(MealPlanPage.folderPanelClass);
    const heading = panel.querySelector('h3');
    const dayStatus = panel.querySelector(MealPlanPage.dailyMealStatusClass);
    const pastDayNotice = panel.querySelector(MealPlanPage.pastDayNoticeClass);
    const pastDayEmptyNote = panel.querySelector(MealPlanPage.pastDayEmptyNoteClass);
    this.#dailyMealsListContainer = rootContainer.querySelector(MealPlanPage.dailyMealsListClass);
    this.#dailyMealsListContainer.innerHTML = '';
    const activeWeek = getWeekForParameter(weekParameter, siteData);
    const activeDay = activeWeek.days.getDayByID(day);
    const dayIndex = SiteData.weekDays.findIndex(([dayID]) => dayID === day);
    const isPastDay = dayIndex >= 0 && this.#isPastDay(activeWeek.weekStartDate, dayIndex);
    panel.classList.toggle('is-past-day', isPastDay);
    pastDayNotice.hidden = !isPastDay;
    const activeStatus = activeDay?.status || 'empty';
    const activeMeals = activeDay?.meals.toJSON().collection || {};
    const hasMealPlan = Object.values(activeMeals).some(meal => meal.recipeIDs.length);
    const hasExecutedMeal = Object.values(activeMeals).some(meal => meal.isExecuted);
    const mealsForDay = dayID => {
      const targetDay = activeWeek.days.getDayByID(dayID);
      return Object.values(targetDay?.meals.toJSON().collection || {})
        .map(meal => ({
          ID: meal.ID,
          Name: meal.Name
        }));
    };
    const populateMealOptions = (select, meals, preferredID) => {
      select.replaceChildren();
      meals.forEach(({
        ID,
        Name
      }) => {
        const option = document.createElement('option');
        option.value = ID;
        option.textContent = Name;
        select.appendChild(option);
      });
      if (meals.some(({
          ID
        }) => ID === preferredID)) {
        select.value = preferredID;
      }
    };
    pastDayEmptyNote.hidden = !isPastDay || hasMealPlan;
    heading.textContent = `${activeDay?.Name || day}'s Meal Plan`;
    dayStatus.textContent = activeStatus === 'planned' ?
      'Planned' :
      hasMealPlan ? activeStatus : 'No meals planned';
    const dayActions = panel.querySelector('.day-plan-actions');
    const addMealForm = panel.querySelector('.day-add-meal-form');
    const addMealInput = panel.querySelector('.day-add-meal-name');
    const addMealMessage = panel.querySelector('.day-add-meal-message');
    addMealForm.hidden = isPastDay;
    addMealForm.addEventListener('submit', event => {
      event.preventDefault();
      try {
        siteData.addMealToDay(weekParameter, day, addMealInput.value);
        this.render();
        this.#mealPlanPageContainer.querySelector('.day-add-meal-message').textContent =
          `Added ${addMealInput.value.trim()} to the day.`;
      } catch (error) {
        addMealMessage.textContent = `Could not add meal: ${error.message}`;
      }
    });
    const dayHasRecipes = hasMealPlan;
    const dayClearButton = dayActions.querySelector('.day-clear');
    dayClearButton.hidden = !dayHasRecipes || isPastDay || hasExecutedMeal;
    const dayCopyDate = dayActions.querySelector('.day-copy-date');
    const dayCopyDetails = dayActions.querySelector('.day-copy-details');
    const dayCopyToggle = dayActions.querySelector('.day-copy-toggle');
    const dayCopyLabel = dayActions.querySelector('.day-copy-label');
    const dayCopyButton = dayActions.querySelector('.day-copy');
    const dayMessage = dayActions.querySelector('.day-plan-message');
    const today = new Date();
    dayCopyDate.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (dayHasRecipes) {
      dayCopyToggle.textContent = 'Copy day to date';
      dayCopyLabel.textContent = 'Destination date';
      dayCopyButton.textContent = 'Copy day';
      dayCopyDate.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    } else {
      dayCopyToggle.textContent = 'Copy day from date';
      dayCopyLabel.textContent = 'Source date';
      dayCopyButton.textContent = 'Copy day from date';
      dayCopyDate.removeAttribute('min');
    }
    dayCopyDetails.hidden = isPastDay;
    const dayHasEmptyMeals = Object.values(activeMeals).some(meal => !meal.recipeIDs.length);
    dayActions.querySelectorAll('button, input').forEach(control => {
      control.disabled = isPastDay;
    });
    dayActions.querySelector('.day-generate').disabled = isPastDay || !dayHasEmptyMeals;
    dayActions.onclick = event => {
      const button = event.target.closest('button');
      if (!button) return;
      try {
        if (button.matches('.day-generate')) {
          const result = siteData.generateDayPlan(weekParameter, day);
          this.render();
          this.#mealPlanPageContainer.querySelector('.day-plan-message').textContent =
            `Generated ${result.meals} meal${result.meals === 1 ? '' : 's'}. Existing meals were kept.${result.unfilled ? ` ${result.unfilled} empty meal slot${result.unfilled === 1 ? ' was' : 's were'} left empty because no unused recipes were available.` : ''}`;
          return;
        }
        if (button.matches('.day-clear')) {
          if (!window.confirm('Clear all recipes from this day? Expected serving counts will be kept.')) return;
          siteData.clearDayRecipes(weekParameter, day);
          this.render();
          this.#mealPlanPageContainer.querySelector('.day-plan-message').textContent =
            'Cleared all recipes from this day.';
          return;
        }
        if (button.matches('.day-copy')) {
          const selectedDate = dayActions.querySelector('.day-copy-date').value;
          if (!selectedDate) {
            dayMessage.textContent = `Choose a ${dayHasRecipes ? 'destination' : 'source'} date first.`;
            return;
          }
          if (dayHasRecipes && !window.confirm(`Copy this day to ${selectedDate}? The destination meal plan will be replaced.`)) return;
          if (!dayHasRecipes && !window.confirm(`Copy the day containing ${selectedDate} into ${day}? Its current meal plan will be replaced.`)) return;
          const destinationName = dayHasRecipes ?
            siteData.copyDayPlanToDate(weekParameter, day, selectedDate) :
            siteData.copyDayPlanFromDate(weekParameter, day, selectedDate);
          this.render();
          this.#mealPlanPageContainer.querySelector('.day-plan-message').textContent =
            dayHasRecipes ?
            `Copied this day to ${destinationName} (${selectedDate}).` :
            `Copied the day from ${selectedDate} into ${destinationName}.`;
        }
      } catch (error) {
        dayMessage.textContent = `Could not ${button.textContent.trim().toLowerCase()}: ${error.message}`;
      }
    };
    Object.values(activeMeals).forEach(meal => {
      const mealSlotClone = this.#dailyMealSlotTemplate.content.cloneNode(true);
      const dailyMealSlot = mealSlotClone.querySelector(MealPlanPage.dailyMealSlotClass);
      const mealSlotLabel = dailyMealSlot.querySelector(MealPlanPage.dailyMealSlotLabelClass);
      const servingsInput = dailyMealSlot.querySelector(MealPlanPage.dailyMealSlotServingsClass);
      const recipeList = dailyMealSlot.querySelector(MealPlanPage.dailyMealSlotRecipesClass);
      const emptyMessage = dailyMealSlot.querySelector(MealPlanPage.dailyMealSlotEmptyClass);
      const mealSlotSummary = dailyMealSlot.querySelector(MealPlanPage.dailyMealSlotSummaryClass);
      const addRecipeButton = dailyMealSlot.querySelector(MealPlanPage.dailyMealSlotAddRecipeClass);
      mealSlotLabel.textContent = meal.Name;
      const mealNameInput = dailyMealSlot.querySelector('.meal-slot-name');
      mealNameInput.value = meal.Name;
      mealNameInput.disabled = isPastDay || meal.isExecuted;
      mealNameInput.title = meal.isExecuted ? 'Executed meals are locked' : 'Rename this meal';
      servingsInput.value = String(meal.servingsRequired);
      servingsInput.dataset.mealId = meal.ID;
      servingsInput.disabled = isPastDay;
      mealSlotSummary.textContent = meal.recipeIDs.length ?
        `${meal.recipeIDs.length} planned recipe${meal.recipeIDs.length === 1 ? '' : 's'}` :
        'No recipes added yet';
      emptyMessage.hidden = meal.recipeIDs.length > 0;
      addRecipeButton.hidden = isPastDay;
      addRecipeButton.disabled = isPastDay || meal.isExecuted;
      dailyMealSlot.querySelector('.meal-slot-clear').hidden = isPastDay || meal.recipeIDs.length === 0;
      const executeButton = dailyMealSlot.querySelector('.meal-slot-execute');
      executeButton.disabled = isPastDay || meal.isExecuted || meal.recipeIDs.length === 0;
      executeButton.textContent = meal.isExecuted ? 'Meal executed' : 'Execute meal';
      executeButton.title = meal.isExecuted ?
        `Executed ${new Date(meal.executedAt).toLocaleString()}` :
        'Check stock and deduct ingredients for this meal';
      if (!isPastDay && !meal.isExecuted && meal.recipeIDs.length) {
        const executionStatus = dailyMealSlot.querySelector('.meal-execution-status');
        const executionMessage = dailyMealSlot.querySelector('.meal-execution-message');
        try {
          const check = siteData.getMealExecutionCheck(weekParameter, day, meal.ID);
          if (check.shortages.length || check.unresolved.length) {
            this.#renderExecutionCheck(dailyMealSlot, check);
          }
        } catch (error) {
          executeButton.textContent = '⚠ Needs review';
          executionStatus.hidden = false;
          executionMessage.textContent = `Inventory check stopped; no stock was deducted. ${error.message}`;
        }
      }
      const removeMealButton = dailyMealSlot.querySelector('.meal-slot-remove');
      removeMealButton.disabled = isPastDay || meal.isExecuted;
      const mealCopyDate = dailyMealSlot.querySelector('.meal-copy-date');
      const mealCopyDetails = dailyMealSlot.querySelector('.meal-copy-details');
      const mealCopyToggle = dailyMealSlot.querySelector('.meal-copy-toggle');
      const mealCopyDateLabel = dailyMealSlot.querySelector('.meal-copy-date-label');
      const mealCopyAction = dailyMealSlot.querySelector('.meal-slot-copy');
      const mealCopyDestinationLabel = dailyMealSlot.querySelector('.meal-copy-destination-text');
      const mealHasRecipes = meal.recipeIDs.length > 0;
      mealCopyDetails.hidden = isPastDay;
      if (mealHasRecipes) {
        mealCopyToggle.textContent = 'Copy meal to date';
        mealCopyDateLabel.textContent = 'Destination date';
        mealCopyDestinationLabel.textContent = 'Destination meal';
        mealCopyAction.textContent = 'Copy meal';
        mealCopyDate.min = dayCopyDate.min;
      } else {
        mealCopyToggle.textContent = 'Copy meal from date';
        mealCopyDateLabel.textContent = 'Source date';
        mealCopyDestinationLabel.textContent = 'Source meal';
        mealCopyAction.textContent = 'Copy meal from date';
        mealCopyDate.removeAttribute('min');
      }
      const mealCopyDestination = dailyMealSlot.querySelector('.meal-copy-destination');
      mealsForDay(day).forEach(({
        ID: mealID,
        Name: mealName
      }) => {
        const option = document.createElement('option');
        option.value = mealID;
        option.textContent = mealName;
        mealCopyDestination.appendChild(option);
      });
      mealCopyDestination.value = meal.ID;
      dailyMealSlot.querySelectorAll('.meal-slot-actions button, .meal-slot-actions input, .meal-slot-actions select')
        .forEach(control => {
          control.disabled = isPastDay || (meal.isExecuted &&
            !control.matches('.meal-slot-copy, .meal-copy-date, .meal-copy-destination'));
        });
      executeButton.disabled = isPastDay || meal.isExecuted || meal.recipeIDs.length === 0;
      removeMealButton.disabled = isPastDay || meal.isExecuted;
      mealNameInput.disabled = isPastDay || meal.isExecuted;
      dailyMealSlot.querySelector('.meal-slot-clear').disabled =
        isPastDay || meal.isExecuted || meal.recipeIDs.length === 0;
      dailyMealSlot.querySelector('.meal-generate').disabled =
        isPastDay || meal.isExecuted || meal.recipeIDs.length > 0;
      const searchURL = new URL('/Search/', window.location.origin);
      searchURL.searchParams.set('week', weekParameter);
      searchURL.searchParams.set('day', day);
      searchURL.searchParams.set('meal', meal.ID);
      addRecipeButton.addEventListener('click', () => {
        window.location.href = `${searchURL.pathname}${searchURL.search}`;
      });
      mealCopyDate.addEventListener('change', () => {
        if (!mealCopyDate.value) return;
        try {
          const dateMeals = siteData.getMealsForDate(mealCopyDate.value);
          populateMealOptions(mealCopyDestination, dateMeals, mealCopyDestination.value);
        } catch (error) {
          dailyMealSlot.querySelector('.meal-slot-action-message').textContent =
            `Could not load meals for that date: ${error.message}`;
        }
      });
      meal.recipeIDs.forEach(recipeID => {
        const recipe = siteData.recipes.getRecipeByID(recipeID) ||
          siteData.recipes.getRecipeByName(recipeID);
        const recipeName = recipe?.Name || recipeID;
        const recipeWrapper = meal.recipeWrappers.find(wrapper => wrapper.recipeID === recipeID);
        const recipeItem = this.#mealSlotRecipeTemplate.content.cloneNode(true)
          .querySelector('.meal-slot-recipe');
        recipeItem.dataset.recipeId = recipeID;
        const recipeTitle = recipeItem.querySelector('.meal-slot-recipe-name');
        recipeTitle.textContent = recipeName;
        if (recipe) {
          const detailsURL = new URL('/Recipe/', window.location.origin);
          const returnURL = new URL('/MealPlan/', window.location.origin);
          detailsURL.searchParams.set('week', weekParameter);
          detailsURL.searchParams.set('recipe', recipeID);
          returnURL.searchParams.set('week', weekParameter);
          returnURL.searchParams.set('day', day);
          detailsURL.searchParams.set('returnTo', `${returnURL.pathname}${returnURL.search}`);
          recipeTitle.href = `${detailsURL.pathname}${detailsURL.search}`;
          appendRecipeOriginFlag(recipeTitle, recipe, `${returnURL.pathname}${returnURL.search}`)
            .catch(error => {
              console.error(`Could not load the origin flag for "${recipe.Name}":`, error);
            });
        } else {
          recipeTitle.removeAttribute('href');
        }
        const servingsProducedInput = recipeItem.querySelector('.recipe-servings-produced');
        servingsProducedInput.value = String(recipeWrapper?.servingsProduced ?? meal.getRecipeServings(recipeID) ?? 1);
        servingsProducedInput.disabled = isPastDay || meal.isExecuted;
        const servingsNeededInput = recipeItem.querySelector('.recipe-servings-needed');
        servingsNeededInput.min = '1';
        servingsNeededInput.max = String(meal.servingsRequired);
        servingsNeededInput.value = String(Math.min(
          recipeWrapper?.servingsNeeded ?? 1,
          meal.servingsRequired
        ));
        servingsNeededInput.disabled = isPastDay || meal.isExecuted;
        recipeItem.querySelector('.meal-slot-recipe-remove').disabled = isPastDay;
        const destinationDay = recipeItem.querySelector('.recipe-destination-day');
        const availableDays = getWeekDays(activeWeek).filter((weekDay, index) =>
          !this.#isPastDay(activeWeek.weekStartDate, index)
        );
        availableDays.forEach(weekDay => {
          const option = document.createElement('option');
          option.value = weekDay.ID;
          option.textContent = weekDay.Name;
          destinationDay.appendChild(option);
        });
        destinationDay.value = availableDays.find(weekDay => weekDay.ID !== day)?.ID || day;
        const destinationMeal = recipeItem.querySelector('.recipe-destination-meal');
        populateMealOptions(destinationMeal, mealsForDay(destinationDay.value), meal.ID);
        recipeItem.querySelector('.meal-slot-recipe-replace').disabled = isPastDay || meal.isExecuted;
        recipeItem.querySelector('.meal-slot-recipe-remove').disabled = isPastDay || meal.isExecuted;
        recipeItem.querySelectorAll('.recipe-move, .recipe-copy').forEach(button => {
          button.disabled = isPastDay || (meal.isExecuted && button.matches('.recipe-move'));
        });
        destinationDay.disabled = isPastDay || meal.isExecuted;
        destinationMeal.disabled = isPastDay || meal.isExecuted;
        destinationDay.addEventListener('change', () => {
          populateMealOptions(destinationMeal, mealsForDay(destinationDay.value), destinationMeal.value);
        });
        this.#updateRecipeCoverageSummary(recipeItem, meal);
        recipeList.appendChild(recipeItem);
      });
      this.#dailyMealsListContainer.appendChild(mealSlotClone);
    });
    this.#dailyMealsListContainer.onchange = event => {
      const mealNameInput = event.target.closest('.meal-slot-name');
      if (mealNameInput) {
        const mealSlot = mealNameInput.closest(MealPlanPage.dailyMealSlotClass);
        const meal = activeDay.meals.getMealByID(
          mealSlot.querySelector(MealPlanPage.dailyMealSlotServingsClass).dataset.mealId
        );
        try {
          const renamed = siteData.renameMealOnDay(weekParameter, day, meal.ID, mealNameInput.value);
          mealSlot.querySelector('.meal-slot-label').textContent = renamed;
          mealSlot.querySelector('.meal-slot-action-message').textContent = `Meal renamed to ${renamed}.`;
        } catch (error) {
          mealNameInput.value = meal.Name;
          mealSlot.querySelector('.meal-slot-action-message').textContent =
            `Could not rename meal: ${error.message}`;
        }
        return;
      }
      const recipeItem = event.target.closest('.meal-slot-recipe');
      if (recipeItem) {
        const mealSlot = recipeItem.closest(MealPlanPage.dailyMealSlotClass);
        const meal = activeDay.meals.getMealByID(
          mealSlot.querySelector(MealPlanPage.dailyMealSlotServingsClass).dataset.mealId
        );
        if (event.target.matches('.recipe-servings-needed, .recipe-servings-produced')) {
          const servingsProduced = Number(recipeItem.querySelector('.recipe-servings-produced').value);
          const servingsNeeded = Number(recipeItem.querySelector('.recipe-servings-needed').value);
          const actionMessage = recipeItem.querySelector('.recipe-action-message');
          try {
            siteData.updateMealRecipeServings(
              weekParameter,
              day,
              meal.ID,
              recipeItem.dataset.recipeId,
              servingsProduced,
              servingsNeeded
            );
            actionMessage.textContent = 'Recipe servings updated.';
          } catch (error) {
            const wrapper = meal.getRecipeWrapper(recipeItem.dataset.recipeId);
            recipeItem.querySelector('.recipe-servings-produced').value = String(wrapper.servingsProduced);
            recipeItem.querySelector('.recipe-servings-needed').value = String(wrapper.servingsNeeded);
            actionMessage.textContent = `Could not update recipe servings: ${error.message}`;
          }
          this.#updateRecipeCoverageSummary(recipeItem, meal);
          return;
        }
      }
      const servingsInput = event.target.closest(MealPlanPage.dailyMealSlotServingsClass);
      if (!servingsInput) {
        return;
      }
      const meal = activeDay.meals.getMealByID(servingsInput.dataset.mealId);
      const message = servingsInput.closest(MealPlanPage.dailyMealSlotClass)
        .querySelector(MealPlanPage.dailyMealSlotMessageClass);
      const servingsRequired = Number(servingsInput.value);
      if (!Number.isSafeInteger(servingsRequired) || servingsRequired <= 0) {
        servingsInput.value = String(meal.servingsRequired);
        message.textContent = 'Enter a positive whole number of expected servings.';
        return;
      }
      try {
        siteData.setMealServingsRequired(weekParameter, day, meal.ID, servingsRequired);
        servingsInput.value = String(meal.servingsRequired);
        servingsInput.closest(MealPlanPage.dailyMealSlotClass)
          .querySelectorAll('.meal-slot-recipe').forEach(recipeItem => {
            const coverageInput = recipeItem.querySelector('.recipe-servings-needed');
            const wrapper = meal.getRecipeWrapper(recipeItem.dataset.recipeId);
            coverageInput.max = String(meal.servingsRequired);
            coverageInput.value = String(wrapper.servingsNeeded);
            this.#updateRecipeCoverageSummary(recipeItem, meal);
          });
        message.textContent = `Expected servings updated to ${meal.servingsRequired}.`;
      } catch (error) {
        servingsInput.value = String(meal.servingsRequired);
        message.textContent = `Could not update expected servings: ${error.message}`;
      }
    };
    this.#dailyMealsListContainer.oninput = event => {
      const recipeItem = event.target.closest('.meal-slot-recipe');
      if (!recipeItem || !event.target.matches('.recipe-servings-needed')) {
        return;
      }
      const mealSlot = recipeItem.closest(MealPlanPage.dailyMealSlotClass);
      const meal = activeDay.meals.getMealByID(
        mealSlot.querySelector(MealPlanPage.dailyMealSlotServingsClass).dataset.mealId
      );
      this.#updateRecipeCoverageSummary(recipeItem, meal);
    };
    this.#dailyMealsListContainer.onsubmit = async event => {
      const form = event.target.closest('.meal-amount-resolution-form');
      if (!form) return;
      event.preventDefault();
      const mealSlot = form.closest(MealPlanPage.dailyMealSlotClass);
      const message = mealSlot.querySelector('.meal-execution-message');
      const quantity = Number(form.querySelector('input[type="number"]').value);
      const unit = form.querySelector('input[type="text"]').value;
      try {
        siteData.resolveRecipeIngredientAmount(
          form.dataset.recipeId,
          form.dataset.ingredientKey,
          quantity,
          unit
        );
        await this.render();
        const updatedMealSlot = [...this.#mealPlanPageContainer.querySelectorAll(MealPlanPage.dailyMealSlotClass)]
          .find(slot => slot.querySelector(MealPlanPage.dailyMealSlotServingsClass).dataset.mealId ===
            mealSlot.querySelector(MealPlanPage.dailyMealSlotServingsClass).dataset.mealId);
        const status = updatedMealSlot.querySelector('.meal-execution-status');
        status.hidden = false;
        updatedMealSlot.querySelector('.meal-execution-message').textContent =
          `Saved ${quantity} ${unit.trim()} for this recipe ingredient. Check the remaining amounts and inventory before executing.`;
      } catch (error) {
        message.textContent = `Could not save this amount: ${error.message}`;
      }
    };
    this.#dailyMealsListContainer.onclick = event => {
      const button = event.target.closest('button');
      if (!button) {
        return;
      }
      const mealSlot = button.closest(MealPlanPage.dailyMealSlotClass);
      if (mealSlot && button.matches('.meal-generate, .meal-slot-clear, .meal-slot-copy')) {
        const mealID = mealSlot.querySelector(MealPlanPage.dailyMealSlotServingsClass).dataset.mealId;
        const message = mealSlot.querySelector('.meal-slot-action-message');
        try {
          if (button.matches('.meal-generate')) {
            siteData.generateMealPlan(weekParameter, day, mealID);
            this.updatePanelContent(this.#mealPlanPageContainer, weekParameter, day);
            return;
          }
          if (button.matches('.meal-slot-clear')) {
            if (!window.confirm('Clear all recipes from this meal? Expected servings will be kept.')) return;
            siteData.clearMealRecipes(weekParameter, day, mealID);
            this.render();
            return;
          }
          const selectedDate = mealSlot.querySelector('.meal-copy-date').value;
          const mealHasRecipes = activeDay.meals.getMealByID(mealID).recipeIDs.length > 0;
          if (!selectedDate) {
            message.textContent = `Choose a ${mealHasRecipes ? 'destination' : 'source'} date first.`;
            return;
          }
          const selectedMealID = mealSlot.querySelector('.meal-copy-destination').value;
          if (mealHasRecipes && !window.confirm(`Copy this meal to ${selectedDate}? The destination meal will be replaced.`)) return;
          if (!mealHasRecipes && !window.confirm(`Copy ${selectedMealID} from ${selectedDate} into this meal? Its current contents will be replaced.`)) return;
          const result = mealHasRecipes ?
            siteData.copyMealPlanToDate(
              weekParameter,
              day,
              mealID,
              selectedDate,
              selectedMealID
            ) :
            siteData.copyMealPlanFromDate(
              weekParameter,
              day,
              mealID,
              selectedDate,
              selectedMealID
            );
          this.render();
          this.#mealPlanPageContainer.querySelector('.day-plan-message').textContent =
            mealHasRecipes ?
            `Copied this meal to ${result.day} ${result.meal} (${selectedDate}).` :
            `Copied ${result.meal} from ${selectedDate} into ${result.meal}.`;
          return;
        } catch (error) {
          message.textContent = `Could not ${button.textContent.trim().toLowerCase()}: ${error.message}`;
          return;
        }
      }
      if (mealSlot && button.matches('.meal-slot-execute, .meal-slot-remove, .meal-shortages-shopping')) {
        const mealID = mealSlot.querySelector(MealPlanPage.dailyMealSlotServingsClass).dataset.mealId;
        const status = mealSlot.querySelector('.meal-execution-status');
        const statusMessage = mealSlot.querySelector('.meal-execution-message');
        const shortageList = mealSlot.querySelector('.meal-execution-shortages');
        const shoppingButton = mealSlot.querySelector('.meal-shortages-shopping');
        try {
          if (button.matches('.meal-slot-remove')) {
            const meal = activeDay.meals.getMealByID(mealID);
            if (meal.recipeIDs.length && !window.confirm(`Remove ${meal.Name} and all of its planned recipes?`)) {
              return;
            }
            siteData.removeMealFromDay(weekParameter, day, mealID);
            this.render();
            this.#mealPlanPageContainer.querySelector('.day-plan-message').textContent =
              `Removed ${meal.Name} from the day.`;
            return;
          }
          if (button.matches('.meal-shortages-shopping')) {
            siteData.addMealShortagesToShoppingList(JSON.parse(button.dataset.shortages || '[]'));
            statusMessage.textContent = 'Missing ingredients added to the shopping list. Update stock after purchase, then check this meal again.';
            shoppingButton.hidden = true;
            return;
          }
          const check = siteData.getMealExecutionCheck(weekParameter, day, mealID);
          status.hidden = false;
          this.#renderExecutionCheck(mealSlot, check);
          if (check.unresolved.length || check.shortages.length) {
            return;
          }
          status.hidden = false;
          statusMessage.textContent = 'Inventory covers this meal.';
          if (!window.confirm('Execute this meal? Required ingredients will be deducted from inventory and the meal will be locked.')) {
            return;
          }
          siteData.executeMeal(weekParameter, day, mealID);
          this.render();
          this.#mealPlanPageContainer.querySelector('.day-plan-message').textContent =
            'Meal executed. Ingredients were deducted and this meal is now locked; it can still be copied.';
        } catch (error) {
          status.hidden = false;
          statusMessage.textContent = button.matches('.meal-slot-remove') ?
            `Could not remove this meal: ${error.message}` :
            `Inventory check stopped; no stock was deducted. ${error.message}`;
          if (button.matches('.meal-slot-execute')) {
            button.textContent = '⚠ Needs review';
          }
          shortageList.replaceChildren();
          shoppingButton.hidden = true;
        }
        return;
      }
      const recipeItem = button.closest('.meal-slot-recipe');
      if (!recipeItem) return;
      const sourceMealID = recipeItem.closest(MealPlanPage.dailyMealSlotClass)
        .querySelector(MealPlanPage.dailyMealSlotServingsClass).dataset.mealId;
      const message = recipeItem.querySelector('.recipe-action-message');
      try {
        if (button.matches('.meal-slot-recipe-replace')) {
          const replaceURL = new URL('/MealPlan/', window.location.origin);
          replaceURL.searchParams.set('week', weekParameter);
          replaceURL.searchParams.set('day', day);
          const searchURL = new URL('/Search/', window.location.origin);
          searchURL.searchParams.set('week', weekParameter);
          searchURL.searchParams.set('day', day);
          searchURL.searchParams.set('meal', sourceMealID);
          searchURL.searchParams.set('replace', recipeItem.dataset.recipeId);
          searchURL.searchParams.set('returnTo', `${replaceURL.pathname}${replaceURL.search}`);
          window.location.href = `${searchURL.pathname}${searchURL.search}`;
          return;
        }
        if (button.matches('.meal-slot-recipe-remove')) {
          siteData.removeRecipeFromMeal(weekParameter, day, sourceMealID, recipeItem.dataset.recipeId);
          this.updatePanelContent(this.#mealPlanPageContainer, weekParameter, day);
          return;
        }
        if (button.matches('.recipe-move, .recipe-copy')) {
          const result = siteData.transferMealRecipe(
            weekParameter,
            day,
            sourceMealID,
            recipeItem.dataset.recipeId,
            recipeItem.querySelector('.recipe-destination-day').value,
            recipeItem.querySelector('.recipe-destination-meal').value,
            button.matches('.recipe-copy')
          );
          if (button.matches('.recipe-move')) {
            this.updatePanelContent(this.#mealPlanPageContainer, weekParameter, day);
            return;
          }
          message.textContent =
            `Copied to ${result.destinationDay} ${result.destinationMeal}. Covered servings: ${result.servingsNeeded}.`;
        }
      } catch (error) {
        message.textContent = `Could not ${button.textContent.trim().toLowerCase()} recipe: ${error.message}`;
      }
    };
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
