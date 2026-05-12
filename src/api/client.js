import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your local IP address if testing on a physical device
const BASE_URL = 'http://10.0.2.2:3000/api'; 

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Add a request interceptor to add the auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
