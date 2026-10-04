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

await loadSiteShell('meals');
new MealPlanPage().render();
