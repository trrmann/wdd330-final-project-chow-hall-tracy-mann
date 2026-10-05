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
const weekDaysLong = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday'
};
const defaultMeals = {
  breakfast: {
    display: "Breakfast",
    required: true
  },
  brunch: {
    display: "Brunch",
    required: false
  },
  lunch: {
    display: "Lunch",
    required: true
  },
  dinner: {
    display: "Dinner",
    required: true
  },
  midnightMeal: {
    display: "Midnight Meal",
    required: false
  }
};
const weekDayStatuses = {
  current: {
    Mon: {
      status: 'planned',
      meals: {
        breakfast: {
          servings: 2,
          recipes: [{
              percentServings: 50,
              recipe: 'Eggs'
            },
            {
              percentServings: 50,
              recipe: 'Omlette'
            }
          ]
        },
        brunch: {
          servings: 4,
          recipes: [{
              percentServings: 25,
              recipe: 'Eggs'
            },
            {
              percentServings: 75,
              recipe: 'Fried Chicken'
            }
          ]
        },
        lunch: {
          servings: 4,
          recipes: [{
            percentServings: 100,
            recipe: 'Fried Chicken'
          }]
        },
        dinner: {
          servings: 4,
          recipes: [{
              percentServings: 100,
              recipe: 'Fried Chicken'
            },
            {
              percentServings: 100,
              recipe: 'Rice'
            }
          ]
        },
        midnightMeal: {
          servings: 4,
          recipes: [{
              percentServings: 100,
              recipe: 'Fried Chicken'
            },
            {
              percentServings: 100,
              recipe: 'Rice'
            }
          ]
        }
      }
    },
    Tue: {
      status: 'planned',
      meals: {
        breakfast: {
          servings: 2,
          recipes: [{
              percentServings: 50,
              recipe: 'Eggs'
            },
            {
              percentServings: 50,
              recipe: 'Omlette'
            }
          ]
        },
        brunch: {
          servings: 4,
          recipes: [{
              percentServings: 25,
              recipe: 'Eggs'
            },
            {
              percentServings: 75,
              recipe: 'Fried Chicken'
            }
          ]
        },
        lunch: {
          servings: 4,
          recipes: [{
            percentServings: 100,
            recipe: 'Fried Chicken'
          }]
        },
        dinner: {
          servings: 4,
          recipes: [{
              percentServings: 100,
              recipe: 'Fried Chicken'
            },
            {
              percentServings: 100,
              recipe: 'Rice'
            }
          ]
        },
        midnightMeal: {
          servings: 4,
          recipes: [{
              percentServings: 100,
              recipe: 'Fried Chicken'
            },
            {
              percentServings: 100,
              recipe: 'Rice'
            }
          ]
        }
      }
    },
    Wed: {
      status: 'planned',
      meals: {
        breakfast: {
          servings: 2,
          recipes: [{
              percentServings: 50,
              recipe: 'Eggs'
            },
            {
              percentServings: 50,
              recipe: 'Omlette'
            }
          ]
        },
        brunch: {
          servings: 4,
          recipes: [{
              percentServings: 25,
              recipe: 'Eggs'
            },
            {
              percentServings: 75,
              recipe: 'Fried Chicken'
            }
          ]
        },
        lunch: {
          servings: 4,
          recipes: [{
            percentServings: 100,
            recipe: 'Fried Chicken'
          }]
        },
        dinner: {
          servings: 4,
          recipes: [{
              percentServings: 100,
              recipe: 'Fried Chicken'
            },
            {
              percentServings: 100,
              recipe: 'Rice'
            }
          ]
        },
        midnightMeal: {
          servings: 4,
          recipes: [{
              percentServings: 100,
              recipe: 'Fried Chicken'
            },
            {
              percentServings: 100,
              recipe: 'Rice'
            }
          ]
        }
      }
    },
    Thu: {
      status: 'planned',
      meals: {
        breakfast: {
          servings: 2,
          recipes: [{
              percentServings: 50,
              recipe: 'Eggs'
            },
            {
              percentServings: 50,
              recipe: 'Omlette'
            }
          ]
        },
        brunch: {
          servings: 4,
          recipes: [{
              percentServings: 25,
              recipe: 'Eggs'
            },
            {
              percentServings: 75,
              recipe: 'Fried Chicken'
            }
          ]
        },
        lunch: {
          servings: 4,
          recipes: [{
            percentServings: 100,
            recipe: 'Fried Chicken'
          }]
        },
        dinner: {
          servings: 4,
          recipes: [{
              percentServings: 100,
              recipe: 'Fried Chicken'
            },
            {
              percentServings: 100,
              recipe: 'Rice'
            }
          ]
        },
        midnightMeal: {
          servings: 4,
          recipes: [{
              percentServings: 100,
              recipe: 'Fried Chicken'
            },
            {
              percentServings: 100,
              recipe: 'Rice'
            }
          ]
        }
      }
    },
    Fri: {
      status: 'review',
      meals: {
        breakfast: {
          servings: 2,
          recipes: [{
              percentServings: 50,
              recipe: 'Eggs'
            },
            {
              percentServings: 50,
              recipe: 'Omlette'
            }
          ]
        },
        brunch: {
          servings: 4,
          recipes: [{
              percentServings: 25,
              recipe: 'Eggs'
            },
            {
              percentServings: 75,
              recipe: 'Fried Chicken'
            }
          ]
        },
        lunch: {
          servings: 4,
          recipes: [{
            percentServings: 100,
            recipe: 'Fried Chicken'
          }]
        },
        dinner: {
          servings: 4,
          recipes: [{
              percentServings: 100,
              recipe: 'Fried Chicken'
            },
            {
              percentServings: 100,
              recipe: 'Rice'
            }
          ]
        }
      }
    },
    Sat: {
      status: 'review',
      meals: {
        breakfast: {
          servings: 2,
          recipes: [{
              percentServings: 50,
              recipe: 'Eggs'
            },
            {
              percentServings: 50,
              recipe: 'Omlette'
            }
          ]
        },
        brunch: {
          servings: 4,
          recipes: [{
              percentServings: 25,
              recipe: 'Eggs'
            },
            {
              percentServings: 75,
              recipe: 'Fried Chicken'
            }
          ]
        },
        lunch: {
          servings: 4,
          recipes: [{
            percentServings: 100,
            recipe: 'Fried Chicken'
          }]
        },
        dinner: {
          servings: 4,
          recipes: [{
              percentServings: 100,
              recipe: 'Fried Chicken'
            },
            {
              percentServings: 100,
              recipe: 'Rice'
            }
          ]
        }
      }
    },
    Sun: {
      status: 'suggestion',
      meals: {
        breakfast: {
          servings: 2,
          recipes: [{
              percentServings: 50,
              recipe: 'Eggs'
            },
            {
              percentServings: 50,
              recipe: 'Omlette'
            }
          ]
        },
        midnightMeal: {
          servings: 4,
          recipes: [{
              percentServings: 100,
              recipe: 'Fried Chicken'
            },
            {
              percentServings: 100,
              recipe: 'Rice'
            }
          ]
        }
      }
    }
  },
  next: {
    Mon: {
      status: 'planned',
      meals: {
        breakfast: {
          servings: 2,
          recipes: [{
              percentServings: 50,
              recipe: 'Eggs'
            },
            {
              percentServings: 50,
              recipe: 'Omlette'
            }
          ]
        },
        brunch: {
          servings: 4,
          recipes: [{
              percentServings: 25,
              recipe: 'Eggs'
            },
            {
              percentServings: 75,
              recipe: 'Fried Chicken'
            }
          ]
        },
        lunch: {
          servings: 4,
          recipes: [{
            percentServings: 100,
            recipe: 'Fried Chicken'
          }]
        },
        dinner: {
          servings: 4,
          recipes: [{
              percentServings: 100,
              recipe: 'Fried Chicken'
            },
            {
              percentServings: 100,
              recipe: 'Rice'
            }
          ]
        },
        midnightMeal: {
          servings: 4,
          recipes: [{
              percentServings: 100,
              recipe: 'Fried Chicken'
            },
            {
              percentServings: 100,
              recipe: 'Rice'
            }
          ]
        }
      }
    },
    Tue: {
      status: 'planned',
      meals: {
        breakfast: {
          servings: 2,
          recipes: [{
              percentServings: 50,
              recipe: 'Eggs'
            },
            {
              percentServings: 50,
              recipe: 'Omlette'
            }
          ]
        },
        brunch: {
          servings: 4,
          recipes: [{
              percentServings: 25,
              recipe: 'Eggs'
            },
            {
              percentServings: 75,
              recipe: 'Fried Chicken'
            }
          ]
        },
        lunch: {
          servings: 4,
          recipes: [{
            percentServings: 100,
            recipe: 'Fried Chicken'
          }]
        },
        dinner: {
          servings: 4,
          recipes: [{
              percentServings: 100,
              recipe: 'Fried Chicken'
            },
            {
              percentServings: 100,
              recipe: 'Rice'
            }
          ]
        },
        midnightMeal: {
          servings: 4,
          recipes: [{
              percentServings: 100,
              recipe: 'Fried Chicken'
            },
            {
              percentServings: 100,
              recipe: 'Rice'
            }
          ]
        }
      }
    },
    Wed: {
      status: 'review',
      meals: {
        breakfast: {
          servings: 2,
          recipes: [{
              percentServings: 50,
              recipe: 'Eggs'
            },
            {
              percentServings: 50,
              recipe: 'Omlette'
            }
          ]
        },
        brunch: {
          servings: 4,
          recipes: [{
              percentServings: 25,
              recipe: 'Eggs'
            },
            {
              percentServings: 75,
              recipe: 'Fried Chicken'
            }
          ]
        },
        lunch: {
          servings: 4,
          recipes: [{
            percentServings: 100,
            recipe: 'Fried Chicken'
          }]
        },
        dinner: {
          servings: 4,
          recipes: [{
              percentServings: 100,
              recipe: 'Fried Chicken'
            },
            {
              percentServings: 100,
              recipe: 'Rice'
            }
          ]
        }
      }
    },
    Thu: {
      status: 'suggestion',
      meals: {
        breakfast: {
          servings: 2,
          recipes: [{
              percentServings: 50,
              recipe: 'Eggs'
            },
            {
              percentServings: 50,
              recipe: 'Omlette'
            }
          ]
        },
        midnightMeal: {
          servings: 4,
          recipes: [{
              percentServings: 100,
              recipe: 'Fried Chicken'
            },
            {
              percentServings: 100,
              recipe: 'Rice'
            }
          ]
        }
      }
    },
    Fri: {
      status: 'suggestion',
      meals: {
        breakfast: {
          servings: 2,
          recipes: [{
              percentServings: 50,
              recipe: 'Eggs'
            },
            {
              percentServings: 50,
              recipe: 'Omlette'
            }
          ]
        },
        midnightMeal: {
          servings: 4,
          recipes: [{
              percentServings: 100,
              recipe: 'Fried Chicken'
            },
            {
              percentServings: 100,
              recipe: 'Rice'
            }
          ]
        }
      }
    },
    Sat: {
      status: 'empty',
      meals: {}
    },
    Sun: {
      status: 'empty',
      meals: {}
    }
  }
};

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
  static weekNavButtonClass = '.week-nav-btn';
  static weekNavCurrentResetButtonClass = '.week-current-reset-button';
  static folderTabsContainerClass = '.folder-tabs';
  static folderTabTemplateId = 'folder-tab-template';
  static folderTabClass = '.folder-tab';
  static folderPanelClass = '.folder-panel';
  static activeTabClass = 'is-active';
  static dailyMealsListClass = '.daily-meals-list';
  static dailyMealSlotTemplateId = 'daily-meal-slot-template';
  static dailyMealSlotClass = '.daily-meal-slot';
  static dailyMealSlotLabelClass = '.meal-slot-label';
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
  render() {
    const pageContentClone = this.#mealPlanPageTemplate.content.cloneNode(true);
    const tabsContainer = pageContentClone.querySelector(MealPlanPage.folderTabsContainerClass);
    this.#renderWeekNavigationData(pageContentClone);
    weekDays.forEach((day) => {
      const tabClone = this.#folderTabTemplate.content.cloneNode(true);
      const tabElement = tabClone.querySelector(MealPlanPage.folderTabClass);
      console.log("Looking for:", MealPlanPage.folderTabClass, "Found element:", tabElement);
      tabElement.textContent = day;
      tabElement.dataset.day = day;
      if (day === this.#selectedDay) {
        tabElement.classList.add(MealPlanPage.activeTabClass);
        tabElement.setAttribute('aria-selected', 'true');
      } else {
        tabElement.setAttribute('aria-selected', 'false');
      }
      tabsContainer.appendChild(tabClone);
    });
    this.initFolderEvents(pageContentClone);
    this.#initWeekNavigationEvents(pageContentClone);
    this.updatePanelContent(pageContentClone, this.#weekParameter, this.#selectedDay);
    this.#mealPlanPageContainer.innerHTML = '';
    this.#mealPlanPageContainer.appendChild(pageContentClone);
  }
  initFolderEvents(renderedFragment) {
    const tabsContainer = renderedFragment.querySelector(MealPlanPage.folderTabsContainerClass);

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
    const rangeContainer = container.querySelector(MealPlanPage.weekNavRangeClass);
    if (this.#weekOffset === 0) {
      labelContainer.textContent = "Current Week";
      labelContainer.classList.remove('has-offset');
    } else if (this.#weekOffset === -1) {
      labelContainer.textContent = "Last Week";
      labelContainer.classList.add('has-offset');
    } else if (this.#weekOffset === 1) {
      labelContainer.textContent = "Next Week";
      labelContainer.classList.add('has-offset');
    } else {
      labelContainer.textContent = this.#weekOffset > 0 ? `Week +${this.#weekOffset}` : `Week ${this.#weekOffset}`;
      labelContainer.classList.add('has-offset');
    }
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + (this.#weekOffset * 7));
    const dayOfWeek = targetDate.getDay();
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Handle Sunday wrap
    const monday = new Date(targetDate.setDate(targetDate.getDate() + distanceToMonday));
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
    const formatter = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    rangeContainer.textContent = `${formatter.format(monday)} – ${formatter.format(sunday)}`;
  }
  #initWeekNavigationEvents(container) {
    const navPanelContainer = container.querySelector(MealPlanPage.weekNavPanelClass);
    const resetButtonContainer = container.querySelector(MealPlanPage.weekNavCurrentResetButtonClass);
    navPanelContainer.addEventListener('click', (event) => {
      const buttonElement = event.target.closest(MealPlanPage.weekNavButtonClass);
      if (!buttonElement) return;
      const directionalStep = parseInt(buttonElement.dataset.navDir, 10);
      this.#weekOffset += directionalStep;
      const weekParamValue = this.#weekOffset === -1 ? 'last' : this.#weekOffset === 0 ? 'current' : this.#weekOffset === 1 ? 'next' : String(this.#weekOffset);
      this.#updateUrlParameter('week', weekParamValue);
      this.render();
    });
    resetButtonContainer.addEventListener('click', () => {
      if (this.#weekOffset === 0) return;
      this.#weekOffset = 0;
      this.#updateUrlParameter('week', 'current');
      this.render();
    });
  }
  #parseInitialWeekOffset() {
    if (!this.#weekParameter || this.#weekParameter === 'last' || this.#weekParameter === 'current' || this.#weekParameter === 'next') {
      if (!this.#weekParameter || this.#weekParameter === 'current') {
        this.#weekOffset = 0;
      } else if (this.#weekParameter === 'last') {
        this.#weekOffset = -1;
      } else {
        this.#weekOffset = 1;
      }
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
    const activeWeekData = weekDayStatuses[weekParameter] || {};
    const activeDayData = activeWeekData[day] || {};
    const activeStatus = activeDayData.status || 'undefined';
    const activeMeals = activeDayData.meals || {};
    const activeMealsArray = Object.keys(activeMeals);
    heading.textContent = `${weekDaysLong[day]}'s Meal Plan:  (${activeStatus})`;
    activeMealsArray.forEach((meal) => {
      const mealPlan = activeMeals[meal];
      const mealServings = mealPlan.servings;
      const mealRecipes = mealPlan.recipes;
      const mealDetails = mealRecipes.map((recipe) => {
        const servings = mealServings * (recipe.percentServings / 100);
        return `${servings} servings of ${recipe.recipe}`;
      });
      const mealSlotClone = this.#dailyMealSlotTemplate.content.cloneNode(true);
      const dailyMealSlot = mealSlotClone.querySelector(MealPlanPage.dailyMealSlotClass);
      const dailyMealSlotLabel = dailyMealSlot.querySelector(MealPlanPage.dailyMealSlotLabelClass);
      const description = dailyMealSlot.querySelector('p');
      if (Object.hasOwn(defaultMeals, meal)) {
        description.textContent = `${defaultMeals[meal].display} is ${mealDetails}.`;
      } else {
        description.textContent = `${meal} is ${mealDetails}.`;
      }
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
    switch (weekParameter) {
      case 'current':
        weekKicker.textContent = `This Week`;
        weekKickerAnchor.href = persistQueryParameter(weekKickerAnchor.href, 'week', 'next');
        weekKickerAnchor.title = 'Click to change to next week!';
        break;
      case 'next':
        weekKicker.textContent = `Next Week`;
        weekKickerAnchor.href = persistQueryParameter(weekKickerAnchor.href, 'week', 'current');
        weekKickerAnchor.title = 'Click to change to the current week!';
        break;
      default:
        weekKicker.textContent = `Other Week`;
        weekKickerAnchor.href = persistQueryParameter(weekKickerAnchor.href, 'week', 'current');
        weekKickerAnchor.title = 'Click to change to the current week!';
        break;
    }
    const weekPanelLink = weekDashBoardClone.querySelector(MealPlanPage.mealPlanDashBoardPanelLinkClass);
    weekPanelLink.href = persistQueryParameter(weekPanelLink.href, 'week', weekParameter);
    const targetContainer = weekDashBoardClone.querySelector(MealPlanPage.weekStripClass);
    weekDays.forEach((day) => {
      const clone = this.#mealPlanDayTemplate.content.cloneNode(true);
      clone.querySelector(MealPlanPage.weekStripLabelClass).textContent = day;
      const statusSpan = clone.querySelector(MealPlanPage.weekStripStatusClass);
      statusSpan.classList.add(`${MealPlanPage.weekStripStatusClassPrefix}${ weekDayStatuses[weekParameter][day].status}`);
      statusSpan.setAttribute('aria-label', weekDayStatuses[weekParameter][day].status);
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
