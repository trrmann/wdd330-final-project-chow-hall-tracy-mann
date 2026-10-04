import '../css/core.css'
import '../css/mobile.css'
import '../css/tablet.css'
import '../css/laptop.css'
import '../css/desktop.css'
import {
  HomePage
} from './modules/home-page.js'
import {
  loadSiteShell
} from './site-shell.js'

await loadSiteShell('home')
new HomePage().mount(document.querySelector('#app'))
