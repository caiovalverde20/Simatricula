import axios from "axios";

const AS_BASE_URL = "https://eureca.sti.ufcg.edu.br/as";
const DAS_BASE_URL = "https://eureca.sti.ufcg.edu.br/das/v2";
const DAS_BASE_URL_V1 = "https://eureca.lsd.ufcg.edu.br/das-sig/v1";

const axiosASInstance = axios.create({
  baseURL: AS_BASE_URL,
});

const axiosDASInstance = axios.create({
  baseURL: DAS_BASE_URL,
});

const axiosDASInstanceV1 = axios.create({
  baseURL: DAS_BASE_URL_V1,
});

axiosASInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.data.message === "Expired token.") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export { axiosASInstance, axiosDASInstance, axiosDASInstanceV1 };
