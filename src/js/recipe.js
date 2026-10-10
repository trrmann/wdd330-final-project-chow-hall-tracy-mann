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
  const instructions = page.querySelector('.recipe-detail-instructions');
  if (recipe.Instructions) {
    renderInstructions(instructions, recipe);
    const message = page.querySelector('.recipe-detail-message');
    message.textContent = 'Looking up instruction definitions…';
    siteData.resolveDictionaryWordsForRecipe(recipe, () => {
      renderInstructions(instructions, recipe);
    }).then(() => {
      message.textContent = '';
      renderInstructions(instructions, recipe);
    }).catch(error => {
      message.textContent = 'Some instruction definitions could not be loaded.';
      console.error(`Could not load dictionary definitions for "${recipe.Name}":`, error);
    });
  } else {
    instructions.textContent = 'No instructions are available for this recipe.';
  }

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

function renderInstructions(container, currentRecipe) {
  const instructionText = currentRecipe.Instructions;
  const wordPattern = /[\p{L}]+(?:['’][\p{L}]+)*/gu;
  let lastIndex = 0;

  for (const match of instructionText.matchAll(wordPattern)) {
    const [matchedWord] = match;
    const matchIndex = match.index;
    container.append(document.createTextNode(instructionText.slice(lastIndex, matchIndex)));

    const dictionaryWord = siteData.words.getWordByWord(matchedWord);
    const definitions = getDefinitions(dictionaryWord);
    if (definitions.length) {
      const word = document.createElement('span');
      word.className = 'recipe-word-entry';

      const button = document.createElement('button');
      button.className = 'recipe-word-definition-button';
      button.type = 'button';
      button.textContent = matchedWord;
      button.title = 'Click to view the definition';
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', `Show definition for ${matchedWord}`);

      const definition = document.createElement('span');
      definition.className = 'recipe-word-definition';
      definition.hidden = true;
      definition.textContent = definitions
        .map((item, index) => `${index + 1}. ${item}`)
        .join(' ');

      button.addEventListener('click', () => {
        definition.hidden = !definition.hidden;
        button.setAttribute('aria-expanded', String(!definition.hidden));
      });

      word.append(button, definition);
      container.append(word);
    } else {
      container.append(document.createTextNode(matchedWord));
    }
    lastIndex = matchIndex + matchedWord.length;
  }

  container.append(document.createTextNode(instructionText.slice(lastIndex)));
}

function getDefinitions(dictionaryWord) {
  const definitions = [];
  const addSenseDefinitions = (sense, partOfSpeech) => {
    if (sense.Definition) {
      definitions.push([partOfSpeech, sense.Definition].filter(Boolean).join(' — '));
    }
    sense.Subsenses.forEach(subsense => addSenseDefinitions(subsense, partOfSpeech));
  };

  dictionaryWord?.Entry?.Entries.forEach(entry => {
    entry.Senses.forEach(sense => addSenseDefinitions(sense, entry.PartOfSpeech));
  });

  return [...new Set(definitions)];
}

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
