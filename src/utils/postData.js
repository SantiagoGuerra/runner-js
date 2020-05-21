import axios from 'axios';

const postData = data => axios.post('https://us-central1-js-capstone-backend.cloudfunctions.net/api/games/pnsGnjvnCzLyLxnwkdkP/scores/', data)

export default postData;