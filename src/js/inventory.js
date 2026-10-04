import '../css/core.css'
import '../css/mobile.css'
import '../css/tablet.css'
import '../css/laptop.css'
import '../css/desktop.css'
import {
  loadSiteShell
} from './site-shell.js'

await loadSiteShell('inventory')
document.querySelector('#app').innerHTML = `
  <section class="page-intro" aria-labelledby="inventory-title">
    <p class="home-kicker">Your gathering</p>
    <h1 id="inventory-title">Inventory</h1>
    <p>Manage your inventory and keep track of your supplies.</p>
  </section>
`
