import { getHttp } from './api';

interface GitUser {
  login: string;
  avatar_url: string;
}

export default class SearchInput {
  form = document.querySelector('.search-form') as HTMLFormElement;
  input = this.form.querySelector('.search-input') as HTMLInputElement;
  resultWrap = document.querySelector('.search-result') as HTMLDivElement;
  resultTitle = document.querySelector('.search-result-title') as HTMLDivElement;
  result = this.resultWrap.querySelector('.search-result-list') as HTMLUListElement;
  count = 0; // 현재 검색된 유저의 수
  visibleNumber = 30; // api 호출할 때 마다 가져오는 유저의 수. 최대: 100으로 설정 가능
  pageNumber = 2; // moreHandler에서 api 2페이지부터 호출
  isLoading = false; // 로딩 유무
  isEnd = false; // api호출한 데이터의 length가 visibleNumber보다 적을 경우 true

  constructor() {
    this.form.addEventListener('submit', this.searchResultHandler);
    this.result.addEventListener('scroll', this.moreHandler);
  }

  renderUser = (item: GitUser) => {
    this.result.insertAdjacentHTML(
      'beforeend',
      `
        <li>
          <button type="button" data-id="${item.login}">
            <img src="${item.avatar_url}" alt="${item.login}">
            <strong>${item.login}</strong>
          </button>
        </li>
      `
    );
  };

  searchResultHandler = async (e: Event) => {
    e.preventDefault();
    if (this.input.value.trim() === '') return false;
    this.isEnd = false;
    this.pageNumber = 2; // moreHandler가 작동하고 후에 유저를 다시 검색했을 때 pageNumber 문제가 있어서 여기서 초기화.

    this.isLoading = true;
    this.resultWrap.classList.add('loading');

    const response = await getHttp('user', this.input.value);

    if (response.data.total_count <= this.visibleNumber) this.isEnd = true;

    this.result.innerHTML = '';
    this.result.scrollTo(0, 0);

    if (response.data.total_count !== 0) {
      this.count = response.data.items.length;
      this.resultTitle.textContent = `총 ${response.data.total_count}명 중 ${this.count}명의 유저를 찾았습니다.`;
    } else {
      this.resultTitle.textContent = '찾고자하는 유저가 없습니다!';
    }

    response.data.items.map((item: GitUser) => {
      this.renderUser(item);
    });

    this.resultWrap.classList.remove('loading');
    this.isLoading = false;
  };

  moreHandler = async () => {
    const scrollY = this.result.scrollHeight - this.result.scrollTop - 40;
    const height = this.result.offsetHeight;

    if (height >= scrollY && !this.isLoading && !this.isEnd) {
      this.isLoading = true;
      this.resultWrap.classList.add('loading');
      const response = await getHttp('user', this.input.value, this.pageNumber);

      if (response.data.items.length < this.visibleNumber) this.isEnd = true;

      this.count = this.count + response.data.items.length;
      this.resultTitle.textContent = `총 ${response.data.total_count}명 중 ${this.count}명의 유저를 찾았습니다.`;

      response.data.items.map((item: GitUser) => {
        this.renderUser(item);
      });

      this.resultWrap.classList.remove('loading');
      this.pageNumber++;
      this.isLoading = false;
    }
  };
}
