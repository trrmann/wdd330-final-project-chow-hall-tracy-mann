import '../css/core.css'
import '../css/mobile.css'
import '../css/tablet.css'
import '../css/laptop.css'
import '../css/desktop.css'
import {
  loadSiteShell
} from './site-shell.js'

await loadSiteShell('shopping')
document.querySelector('#app').innerHTML = `
  <section class="page-intro" aria-labelledby="shopping-title">
    <p class="home-kicker">Your gathering</p>
    <h1 id="shopping-title">Shopping</h1>
    <p>Build a shopping list from the ingredients you need.</p>
  </section>
`
