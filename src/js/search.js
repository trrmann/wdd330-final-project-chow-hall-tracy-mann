import '../css/core.css'
import '../css/mobile.css'
import '../css/tablet.css'
import '../css/laptop.css'
import '../css/desktop.css'
import {
  loadSiteShell
} from './site-shell.js'

await loadSiteShell('search')
document.querySelector('#app').innerHTML = `
  <section class="page-intro" aria-labelledby="search-title">
    <p class="home-kicker">Your gathering</p>
    <h1 id="search-title">Search</h1>
    <p>Find recipes and ingredients for your meals.</p>
  </section>
`
