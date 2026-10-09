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

const parms = await loadSiteShell('home');
await new HomePage(parms).render();
