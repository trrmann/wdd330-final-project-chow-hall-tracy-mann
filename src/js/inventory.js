import '../css/core.css'
import '../css/mobile.css'
import '../css/tablet.css'
import '../css/laptop.css'
import '../css/desktop.css'
import {
  InventoryPage
} from './modules/inventory-page.js'
import {
  loadSiteShell
} from './site-shell.js'

await loadSiteShell('inventory')
new InventoryPage().mount(document.querySelector('#app'))