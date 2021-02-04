import View from './View.js';

// this class won't render anything. it will get the query and listen to the click button search
class SearchView extends View {
  _parentElement = document.querySelector('.search');

  getQuery() {
    const query = this._parentElement.querySelector('.search__field').value;
    this._clearInput();
    return query;
  }

  // clear search textarea
  _clearInput() {
    this._parentElement.querySelector('.search__field').value = '';
  }

  //PUBLISHER, in the publisher-subscriber pattern
  addHandlerSearch(handler) {
    this._parentElement.addEventListener('submit', function (e) {
      // avoids the page reloads
      e.preventDefault();
      handler();
    });
  }
}

export default new SearchView();
