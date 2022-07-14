import { getHttp } from './api';

interface GitRepo {
  name: string;
  language: string;
  stargazers_count: number;
  updated_at: string;
  html_url: string;
}

export default class View {
  searchResult = document.querySelector('.search-result') as HTMLDivElement;
  repoResultWrap = document.querySelector('.repo-result') as HTMLDivElement;
  repoResultTitle = document.querySelector('.repo-result-title') as HTMLHeadingElement;
  repoResult = this.repoResultWrap.querySelector('.repo-result-list') as HTMLUListElement;
  id = '' as string; // 유저 id
  visibleNumber = 30; // api 호출할 때 마다 가져오는 레파지토리 수. 최대: 100으로 설정 가능
  pageNumber = 2; // moreHandler에서 api 2페이지부터 호출
  isLoading = false; // 로딩 유무
  isEnd = false; // api호출한 데이터의 length가 visibleNumber보다 적을 경우 true

  constructor() {
    this.searchResult.addEventListener('click', e => this.resultView(e));
    this.repoResult.addEventListener('scroll', this.moreHandler);
  }

  renderRepo = (item: GitRepo) => {
    this.repoResult.insertAdjacentHTML(
      'beforeend',
      `
      <li>
        <a href="${item.html_url}" target="_blank" class="repo-title" title="repository ${item.name} 새창열기">
          ${item.name}
        </a>
        <div class="repo-result-info">
          ${item.language !== null ? `<span class="repo-lang" title="주로 쓰인 언어">${item.language}</span>` : ''}
          ${
            item.stargazers_count !== 0
              ? `<span class="repo-star" title="별 개수">★ ${item.stargazers_count}</span>`
              : ''
          }
          <span class="repo-update-time" title="마지막 업데이트">${item.updated_at.slice(0, 10)}</span>
        </div>
      </li>
      `
    );
  };

  resultView = async (e: MouseEvent) => {
    e.preventDefault();
    if ((e.target as HTMLElement).nodeName !== 'BUTTON') return false;
    const target = e.target as HTMLButtonElement;
    this.id = target.dataset.id as string;
    this.isEnd = false;
    this.pageNumber = 2; // moreHandler가 작동하고 후에 유저를 다시 클릭했을 때 pageNumber 문제가 있어서 여기서 초기화.

    this.isLoading = true;
    this.repoResultWrap.classList.add('loading');

    const response = await getHttp('repo', this.id);

    if (response.data.length < this.visibleNumber) this.isEnd = true;

    this.repoResult.innerHTML = '';
    this.repoResult.scrollTo(0, 0);

    if (response.data.length !== 0) {
      this.repoResultTitle.innerHTML = `<a href="https://github.com/${this.id}" target="_blank" title="${this.id}의 git 새창열기">${this.id}</a>님의 레파지토리 리스트`;
    } else {
      this.repoResultTitle.innerHTML = `<a href="https://github.com/${this.id}" target="_blank" title="${this.id}의 git 새창열기">${this.id}</a>님의 레파지토리가 없습니다!`;
    }

    response.data.map((item: GitRepo) => {
      this.renderRepo(item);
    });

    this.repoResultTitle.querySelector('a')?.focus(); // 유저를 클릭 후 해당 유저의 레파지토리 리스트로 focus

    this.repoResultWrap.classList.remove('loading');
    this.isLoading = false;
  };

  moreHandler = async () => {
    const scrollY = this.repoResult.scrollHeight - this.repoResult.scrollTop - 80;
    const height = this.repoResult.offsetHeight;

    if (height >= scrollY && !this.isLoading && !this.isEnd) {
      this.isLoading = true;
      this.repoResultWrap.classList.add('loading');

      const response = await getHttp('repo', this.id, this.pageNumber);

      if (response.data.length < this.visibleNumber) this.isEnd = true;

      response.data.map((item: GitRepo) => {
        this.renderRepo(item);
      });

      this.pageNumber++;
      this.repoResultWrap.classList.remove('loading');
      this.isLoading = false;
    }
  };
}
