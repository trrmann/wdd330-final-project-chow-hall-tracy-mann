import '../css/core.css'
import '../css/mobile.css'
import '../css/tablet.css'
import '../css/laptop.css'
import '../css/desktop.css'
import {
  loadSiteShell
} from './site-shell.js'
import {
  siteData
} from './modules/site-data.js'

const parms = await loadSiteShell('recipe');
const app = document.getElementById('app');
const template = document.getElementById('recipe-page-template');
const page = template.content.cloneNode(true);
const recipeID = new URLSearchParams(window.location.search).get('recipe');
const recipe = recipeID ? siteData.recipes.getRecipeByID(recipeID) : undefined;

if (!recipe) {
  page.querySelector('.recipe-detail-title').textContent = 'Recipe unavailable';
  page.querySelector('.recipe-detail-message').textContent =
    'This recipe could not be found in your saved recipes.';
  page.querySelector('.recipe-detail-ingredients').closest('section').hidden = true;
  page.querySelector('.recipe-detail-instructions').closest('section').hidden = true;
  page.querySelector('.recipe-detail-acknowledge').addEventListener('click', returnToCaller);
} else {
  page.querySelector('.recipe-detail-title').textContent = recipe.Name;
  page.querySelector('.recipe-detail-instructions').textContent =
    recipe.Instructions || 'No instructions are available for this recipe.';

  const metadata = [recipe.Category, recipe.Area].filter(Boolean).join(' · ');
  page.querySelector('.recipe-detail-meta').textContent = metadata;

  const image = page.querySelector('.recipe-detail-image');
  if (recipe.ThumbnailURL) {
    image.src = recipe.ThumbnailURL;
    image.alt = `Photo of ${recipe.Name}`;
    image.hidden = false;
  }

  const ingredients = page.querySelector('.recipe-detail-ingredients');
  const collection = recipe.QuantifiedIngredient?.toJSON().collection || {};
  Object.values(collection).forEach(ingredient => {
    const item = document.createElement('li');
    const measure = Number.isFinite(ingredient.Quantity ?? ingredient.quantity) ?
      `${ingredient.Quantity ?? ingredient.quantity} ${ingredient.Unit ?? ingredient.unit ?? ''}`.trim() :
      ingredient.Measure ?? ingredient.measure;
    const name = ingredient.Name ?? ingredient.ingredient;
    item.textContent = [measure, name].filter(Boolean).join(' ');
    ingredients.appendChild(item);
  });
  if (!ingredients.children.length) {
    const item = document.createElement('li');
    item.textContent = 'No ingredients are available for this recipe.';
    ingredients.appendChild(item);
  }
  page.querySelector('.recipe-detail-acknowledge').addEventListener('click', returnToCaller);
}

app.replaceChildren(page);

function returnToCaller() {
  const returnTo = new URLSearchParams(window.location.search).get('returnTo');
  let returnURL;
  if (returnTo) {
    const requestedURL = new URL(returnTo, window.location.origin);
    if (requestedURL.origin === window.location.origin) {
      returnURL = requestedURL.href;
    }
  }
  if (!returnURL && document.referrer) {
    const referrer = new URL(document.referrer);
    if (referrer.origin === window.location.origin) {
      returnURL = referrer.href;
    }
  }
  window.location.assign(returnURL || new URL(`/?week=${encodeURIComponent(parms.week)}`, window.location.origin).href);
}
