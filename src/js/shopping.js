import '../css/core.css'
import '../css/mobile.css'
import '../css/tablet.css'
import '../css/laptop.css'
import '../css/desktop.css'
import {
  ShoppingPage
} from './modules/shopping.js'
import {
  loadSiteShell
} from './site-shell.js'

await loadSiteShell('shopping')
new ShoppingPage().mount(document.querySelector('#app'))
