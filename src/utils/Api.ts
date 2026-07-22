import axios from 'axios';
import Config from 'react-native-config';

console.log('API base URL:', Config.API_BASE_URL);

const api = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 60000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export default api;