import '../css/core.css'
import '../css/mobile.css'
import '../css/tablet.css'
import '../css/laptop.css'
import '../css/desktop.css'
import {
  SearchPage
} from './modules/search.js'
import {
  loadSiteShell
} from './site-shell.js'

await loadSiteShell('search');
new SearchPage().render();
