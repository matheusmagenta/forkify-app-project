import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, KEY } from './config.js';
//import { getJSON, sendJSON } from './helpers.js';
import { AJAX } from './helpers.js';

// state contains all the data that needed in order to build the application
export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

// function to formate data as new recipe object
const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }), // short-circuiting if there is no key
  };
};

// function responsible for fetch the recipe data from the forkify api
// this function won't return anything, but change the state object
export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    state.recipe = createRecipeObject(data);

    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;

    //console.log(state.recipe);
  } catch (err) {
    //temporary error handling
    console.error(err);
    throw err;
  }
};

// building a function that can be exported and used by the controller
export const loadSearchResults = async function (query) {
  //query string passed will be plugged into the API call
  try {
    // URL needed to be call by AJAX request https://forkify-api.herokuapp.com/api/v2/recipes?search=pizza
    // the getJSON method will fetch the data, convert it to the JSON and create an error if something goes wrong
    // getJSON method returns a promise (so, need an await keyword)
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    // console.log(data);

    // data.data.recipes is the array with all objects from search
    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });

    // clear pagination to the new search
    state.search.page = 1;

    // console.log(state.search.results);
  } catch (err) {
    //temporary error handling
    console.error(err);
    throw err; // throw the error to be handled by the controller
  }
};

// PAGINATION
export const getSearchResultsPage = function (page = state.search.page) {
  // state.search.results --> array with results
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage; //0;
  const end = page * state.search.resultsPerPage; //9;

  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    //newQt = oldQt * newServings / oldServings
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });

  // update the serving in the state at the end of this function
  state.recipe.servings = newServings;
};

// PERSISTENCE OF THE DATA
// it is necessary to persist the data when add or remove
const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

// ADD BOOKMARK
// when we add something to the state, we get the whole thing as parameter. and just the id to delete it
export const addBookmark = function (recipe) {
  //add bookmark
  state.bookmarks.push(recipe);

  // mark current recipe as bookmarked
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  // calling the persistance function
  persistBookmarks();
};

// REMOVE BOOKMARK
// when we add something to the state, we get the whole thing as parameter. and just the id to delete it
export const deleteBookmark = function (id) {
  // delete bookmark
  const index = state.bookmarks.findIndex(element => element.id === id);
  state.bookmarks.splice(index, 1);

  // mark current recipe as NOT bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  // calling the persistance function
  persistBookmarks();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

// just for development/debugging (is necessary to comment init() above)
const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};
//clearBookmarks();

// UPLOAD
export const uploadRecipe = async function (newRecipe) {
  try {
    // get the raw data and transform into an object
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());
        if (ingArr.length !== 3) throw new Error('Wrong ingredient format');
        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });
    // console.log(ingredients);

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };
    //console.log(recipe);
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    console.log(data);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
