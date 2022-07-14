import '../scss/index.scss';
import SearchInput from './util/search';
import View from './util/view';

document.addEventListener('DOMContentLoaded', () => {
  new SearchInput();
  new View();
});
