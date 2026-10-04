import '../../src/css/core.css'
import '../../src/css/mobile.css'
import '../../src/css/tablet.css'
import '../../src/css/laptop.css'
import '../../src/css/desktop.css'
import {
  loadSiteShell
} from '../../src/js/site-shell.js'

await loadSiteShell('meals')
document.querySelector('#app').innerHTML = `
  <section class="page-intro" aria-labelledby="meal-plan-title">
    <p class="home-kicker">Your gathering</p>
    <h1 id="meal-plan-title">Meal Plan</h1>
    <p>Choose meals for your week and build a shopping list from the ingredients you need.</p>
  </section>
`
