import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// parcel method to mantain state
/* if (module.hot) {
  module.hot.accept();
} */

const recipeContainer = document.querySelector('.recipe');

//SUBSCRIBER, in the publisher-subscriber pattern
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;

    recipeView.renderSpinner();

    // 0. UPDATING RESULTS VIEW TO MARK SELECTED SEARCH RESULT
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    // 1. LOADING RECIPE
    // this is a async function and will return a promise. so, we need to await the promise before move to the next step
    await model.loadRecipe(id);

    // 2) RENDERING RECIPE
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

//SUBSCRIBER, in the publisher-subscriber pattern
const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    //console.log(resultsView);

    //1. get search query
    const query = searchView.getQuery();

    // guard clause
    if (!query) return;

    //2. load search results
    // there is not result to be stored because this do not return anything, just manipulate the state
    await model.loadSearchResults(query);

    //3. render results
    //console.log(model.state.search.results);
    // resultsView.render(model.state.search.results); //all results
    resultsView.render(model.getSearchResultsPage()); //some results

    //4. render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

// controller executed when buttons page are clicked
const controlPagination = function (goToPage) {
  //1. render new results
  resultsView.render(model.getSearchResultsPage(goToPage)); //some results

  //4. render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // update the recipe servings (in state)
  model.updateServings(newServings);

  // update the recipe view
  //recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

// BOOKMARK
const controlAddBookmark = function () {
  // 1. add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2. update recipe view
  recipeView.update(model.state.recipe);

  // 3. render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // show loading spinner
    addRecipeView.renderSpinner();

    // 1.upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);
    // console.log(newRecipe);

    // 2. render the recipe added in recipeView
    recipeView.render(model.state.recipe);

    // 3. success message
    addRecipeView.renderMessage();

    // render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // 4. close form window with setTimeout
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
};

// PUBLISHER-SUBSCRIBER PATTERN
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks); // pass the controller function
  recipeView.addHandlerRender(controlRecipes); // pass the controller function
  recipeView.addHandlerUpdateServings(controlServings); // pass the controller function
  recipeView.addHandlerAddBookmark(controlAddBookmark); // pass the controller function
  searchView.addHandlerSearch(controlSearchResults); // pass the controller function
  paginationView.addHandlerClick(controlPagination); // pass the controller function
  addRecipeView.addHandlerUpload(controlAddRecipe); // pass the controller function
};
init();
