import '../css/core.css'
import '../css/mobile.css'
import '../css/tablet.css'
import '../css/laptop.css'
import '../css/desktop.css'
import {
  RecipePage
} from './modules/recipe.js'
import {
  loadSiteShell
} from './site-shell.js'

const parms = await loadSiteShell('recipe');
new RecipePage(parms).render();
