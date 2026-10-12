import {
  siteData
} from './site-data.js'
export class RecipePage {
  #week;
  #recipe;
  #page;

  constructor(parms = {}) {
    this.#week = parms.week;
    const recipeID = new URLSearchParams(window.location.search).get('recipe');
    this.#recipe = recipeID ? siteData.recipes.getRecipeByID(recipeID) : undefined;
  };

  render() {
    const app = document.getElementById('app');
    const template = document.getElementById('recipe-page-template');
    this.#page = template.content.cloneNode(true);
    if (this.#recipe) {
      this.#renderRecipe();
    } else {
      this.#renderUnavailable();
    }
    this.#page.querySelector('.recipe-detail-acknowledge')
      .addEventListener('click', () => this.#returnToCaller());
    app.replaceChildren(this.#page);
  };

  #renderUnavailable() {
    const page = this.#page;
    page.querySelector('.recipe-detail-title').textContent = 'Recipe unavailable';
    page.querySelector('.recipe-detail-message').textContent =
      'This recipe could not be found in your saved recipes.';
    page.querySelector('.recipe-detail-ingredients').closest('section').hidden = true;
    page.querySelector('.recipe-detail-instructions').closest('section').hidden = true;
  };

  #renderRecipe() {
    const recipe = this.#recipe;
    const page = this.#page;
    const recipeTitle = page.querySelector('.recipe-detail-title');
    recipeTitle.textContent = recipe.Name;
    RecipePage.appendOriginFlag(recipeTitle, recipe).catch(error => {
      console.error(`Could not load the origin flag for "${recipe.Name}":`, error);
    });
    this.#renderInstructionsSection();
    page.querySelector('.recipe-detail-meta').textContent = [recipe.Category, recipe.Area].filter(Boolean).join(' · ');
    this.#renderOrigin();
    this.#renderImage();
    this.#renderIngredients();
  };

  #renderInstructionsSection() {
    const recipe = this.#recipe;
    const instructions = this.#page.querySelector('.recipe-detail-instructions');
    if (!recipe.Instructions) {
      instructions.textContent = 'No instructions are available for this recipe.';
      return;
    }
    this.#renderInstructions(instructions);
    const message = this.#page.querySelector('.recipe-detail-message');
    message.textContent = 'Looking up instruction definitions…';
    message.classList.add('is-loading');
    siteData.resolveDictionaryWordsForRecipe(recipe, () => {
      this.#renderInstructions(instructions);
    }).then(() => {
      message.textContent = '';
      message.classList.remove('is-loading');
      this.#renderInstructions(instructions);
    }).catch(error => {
      message.classList.remove('is-loading');
      message.textContent = 'Some instruction definitions could not be loaded.';
      console.error(`Could not load dictionary definitions for "${recipe.Name}":`, error);
    });
  };

  #renderOrigin() {
    const recipe = this.#recipe;
    const origin = this.#page.querySelector('.recipe-detail-origin');
    const originName = recipe.Country || recipe.Area;
    if (!originName) {
      return;
    }
    origin.hidden = false;
    origin.textContent = 'Origin: ';
    const originStatus = document.createElement('span');
    originStatus.textContent = originName;
    origin.append(originStatus);
    siteData.resolveCountryByName(originName).then(country => {
      if (!country) {
        return;
      }
      const countryLink = document.createElement('a');
      countryLink.className = 'recipe-origin-link';
      countryLink.href = `/Country/?country=${encodeURIComponent(country.ID)}&returnTo=${encodeURIComponent(window.location.href)}`;
      countryLink.textContent = country.Name || originName;
      origin.replaceChildren(document.createTextNode('Origin: '), countryLink);
    }).catch(error => {
      console.error(`Could not load country information for "${originName}":`, error);
    });
  };

  #renderImage() {
    const recipe = this.#recipe;
    const image = this.#page.querySelector('.recipe-detail-image');
    if (recipe.ThumbnailURL) {
      image.src = recipe.ThumbnailURL;
      image.alt = `Photo of ${recipe.Name}`;
      image.hidden = false;
    }
  };

  #renderIngredients() {
    const ingredients = this.#page.querySelector('.recipe-detail-ingredients');
    const collection = this.#recipe.QuantifiedIngredient?.toJSON().collection || {};
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
  };

  #renderInstructions(container) {
    const instructionText = this.#recipe.Instructions;
    const wordPattern = /[\p{L}]+(?:['’][\p{L}]+)*/gu;
    let lastIndex = 0;
    const openDefinitions = new Set(
      [...container.querySelectorAll('.recipe-word-entry')]
      .filter(entry => !entry.querySelector('.recipe-word-definition').hidden)
      .map(entry => entry.querySelector('button').textContent.toLowerCase())
    );
    container.replaceChildren();

    for (const match of instructionText.matchAll(wordPattern)) {
      const [matchedWord] = match;
      const matchIndex = match.index;
      container.append(document.createTextNode(instructionText.slice(lastIndex, matchIndex)));

      const dictionaryWord = siteData.words.getWordByWord(matchedWord);
      const definitions = RecipePage.#getDefinitions(dictionaryWord);
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
        definition.hidden = !openDefinitions.has(matchedWord.toLowerCase());
        button.setAttribute('aria-expanded', String(!definition.hidden));
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
  };

  static async appendOriginFlag(nameElement, recipe, returnTo = window.location.href) {
    const originName = recipe?.Country || recipe?.Area;
    if (!nameElement || !originName) {
      return;
    }

    const country = await siteData.resolveCountryByName(originName);
    if (!country) {
      return;
    }

    const returnURL = new URL(returnTo, window.location.origin);
    if (returnURL.origin !== window.location.origin) {
      throw new Error('Recipe origin links must return to a page on this site');
    }
    const countryURL = new URL('/Country/', window.location.origin);
    countryURL.searchParams.set('country', country.ID);
    countryURL.searchParams.set('returnTo', `${returnURL.pathname}${returnURL.search}${returnURL.hash}`);

    const group = document.createElement(nameElement.tagName === 'H1' ? 'div' : 'span');
    group.className = nameElement.tagName === 'H1' ?
      'recipe-origin-group recipe-detail-title-group' :
      'recipe-origin-group';
    nameElement.before(group);
    group.append(nameElement);

    const flagLink = document.createElement('a');
    flagLink.className = 'recipe-origin-flag-link';
    flagLink.href = `${countryURL.pathname}${countryURL.search}`;
    flagLink.setAttribute('aria-label', `View ${country.Name || originName} country information`);
    flagLink.title = `View ${country.Name || originName} country information`;

    if (country.FlagURL) {
      const image = document.createElement('img');
      image.className = 'recipe-origin-flag';
      image.src = country.FlagURL;
      image.alt = `${country.Name || originName} flag`;
      image.addEventListener('error', () => {
        if (country.FlagEmoji) {
          const fallback = document.createElement('span');
          fallback.className = 'recipe-origin-flag-emoji';
          fallback.setAttribute('role', 'img');
          fallback.setAttribute('aria-label', `${country.Name || originName} flag`);
          fallback.textContent = country.FlagEmoji;
          image.replaceWith(fallback);
        } else {
          flagLink.remove();
        }
      }, {
        once: true
      });
      flagLink.append(image);
    } else if (country.FlagEmoji) {
      const emoji = document.createElement('span');
      emoji.className = 'recipe-origin-flag-emoji';
      emoji.setAttribute('role', 'img');
      emoji.setAttribute('aria-label', `${country.Name || originName} flag`);
      emoji.textContent = country.FlagEmoji;
      flagLink.append(emoji);
    } else {
      return;
    }

    group.append(flagLink);
  };

  static #getDefinitions(dictionaryWord) {
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
  };

  #returnToCaller() {
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
    window.location.assign(returnURL || new URL(`/?week=${encodeURIComponent(this.#week)}`, window.location.origin).href);
  };
}
