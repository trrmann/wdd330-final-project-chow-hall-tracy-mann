import '../css/core.css'
import '../css/mobile.css'
import '../css/tablet.css'
import '../css/laptop.css'
import '../css/desktop.css'
import {
  CountryPage
} from './modules/country.js'
import {
  loadSiteShell
} from './site-shell.js'

await loadSiteShell('country');
new CountryPage().render();
