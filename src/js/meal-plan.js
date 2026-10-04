import '../css/core.css'
import '../css/mobile.css'
import '../css/tablet.css'
import '../css/laptop.css'
import '../css/desktop.css'
import {
  loadSiteShell
} from './site-shell.js'

await loadSiteShell('meals')
document.querySelector('#app').innerHTML = `
  <section class="page-intro" aria-labelledby="meal-plan-title">
    <p class="home-kicker">Your gathering</p>
    <h1 id="meal-plan-title">Meal Plan</h1>
    <p>Choose meals for your week and build a shopping list from the ingredients you need.</p>
  </section>
`
