import axios from 'axios';

export const getHttp = async (way: string, username: string, pageNumber = 1, visibleNumber = 30) => {
  const config = {
    method: 'get',
    url: `${
      way === 'user'
        ? `https://api.github.com/search/users?q=${username}&per_page=${visibleNumber}&page=${pageNumber}`
        : `https://api.github.com/users/${username}/repos?per_page=${visibleNumber}&page=${pageNumber}`
    }`,
    headers: {
      accept: 'application/vnd.github+json',
      Authorization: 'token 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', // 토큰이 없으면 요청에 제한이 있어서 403 에러남.
    },
  };
  const response = await axios(config);
  if (response.status !== 200) {
    throw new Error('통신이 원활하지 않습니다. 잠시후 다시 시도해 주십시오.');
  }
  return response;
};
