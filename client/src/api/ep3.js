import axios from 'axios';

const ep3 = axios.create({
// baseURL: 'https://epaathsala.azurewebsites.net/api/v2',
baseURL: 'http://localhost:8000/api/v2',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default ep3;
