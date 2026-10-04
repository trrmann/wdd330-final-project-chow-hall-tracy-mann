import '../css/core.css'
import '../css/mobile.css'
import '../css/tablet.css'
import '../css/laptop.css'
import '../css/desktop.css'
import {
  MealPlanPage
} from './modules/meal-plan.js'
import {
  loadSiteShell
} from './site-shell.js'

const parms = await loadSiteShell('meals');
new MealPlanPage(parms).render();
