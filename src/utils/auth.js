import { axiosASInstance } from './axiosConfig';
export const checkTokenValidity = async (token) => {
  try {
    const response = await axiosASInstance.get('/profile', {
      headers: {
        'token-de-autenticacao': token
      }
    });
    return true;
  } catch (error) {
    if (error.response && error.response.data.message === "Expired token.") {
      return false;
    }
    throw error;
  }
};
