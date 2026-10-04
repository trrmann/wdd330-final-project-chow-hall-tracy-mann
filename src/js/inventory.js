import '../css/core.css'
import '../css/mobile.css'
import '../css/tablet.css'
import '../css/laptop.css'
import '../css/desktop.css'
import {
  InventoryPage
} from './modules/inventory.js'
import {
  loadSiteShell
} from './site-shell.js'

const parms = await loadSiteShell('inventory');
new InventoryPage(parms).render();
