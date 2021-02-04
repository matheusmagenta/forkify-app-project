import icons from 'url:../../img/icons.svg';

// parent class of other child views
export default class View {
  _data;
  /**
   * Render the received object to the DOM
   * @param {Object | Object[]} data The data to be rendered (e.g. recipe)
   * @param {boolean} [render=true] If false, create markup string instead of rendering to the DOM
   * @returns {undefined | string} A markup string is returned if render=false
   * @this {Object} View instance
   * @author Matheus Magenta
   * @todo Finish the implementation
   */
  // this render method uses _generateMarkup from child views
  render(data, render = true) {
    // guard clause
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();

    this._data = data;
    const markup = this._generateMarkup();

    if (!render) return markup;

    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  // UPDATE THE DOM WITH JUST THE CHANGES
  update(data) {
    this._data = data;
    const newMarkup = this._generateMarkup();

    const newDOM = document.createRange().createContextualFragment(newMarkup);
    const newElements = Array.from(newDOM.querySelectorAll('*'));
    const curElements = Array.from(this._parentElement.querySelectorAll('*'));

    newElements.forEach((newEl, i) => {
      const curEl = curElements[i];
      //console.log(curEl, newEl.isEqualNode(curEl));

      // updates changed TEXT
      if (
        !newEl.isEqualNode(curEl) && newEl.firstChild
          ? newEl.firstChild.nodeValue.trim() !== ''
          : false
      ) {
        curEl.textContent = newEl.textContent;
      }

      // updates changed ATTRIBUTES
      // replaces all the attributes in the current element by the attributes coming from the new element
      if (!newEl.isEqualNode(curEl))
        Array.from(newEl.attributes).forEach(attr =>
          curEl.setAttribute(attr.name, attr.value)
        );
    });
  }

  _clear() {
    this._parentElement.innerHTML = '';
  }

  renderSpinner() {
    const markup = `
        <div class="spinner">
          <svg>
            <use href="${icons}_icon-loader"></use>
          </svg>
        </div>
      `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  // RENDER ERROR
  renderError(message = this._errorMessage) {
    const markup = `
      <div class="error">
         <div>
             <svg>
                 <use href="${icons}_icon-alert-triangle"></use>
             </svg>
         </div>
         <p>${message}</p>
     </div>
     `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  //SUCCESS MESSAGE
  renderMessage(message = this._message) {
    const markup = `
      <div class="recipe">
          <div class="message">
            <div>
              <svg>
                <use href="${icons}icon-smile"></use>
              </svg>
            </div>
            <p>Start by searching for a recipe or an ingredient. Have fun!</p>
          </div>
     `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}
