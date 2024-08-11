import axios from 'axios';

const AS_BASE_URL = 'https://pre.ufcg.edu.br:8443/as_scao';
const DAS_BASE_URL = 'https://pre.ufcg.edu.br:8443/das-scao';

const axiosASInstance = axios.create({
  baseURL: AS_BASE_URL,
});

const axiosDASInstance = axios.create({
  baseURL: DAS_BASE_URL,
});

axiosASInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.data.message === "Expired token.") {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { axiosASInstance, axiosDASInstance };
