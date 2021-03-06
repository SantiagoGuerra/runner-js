import axios from 'axios';

const getScores = axios.get('https://us-central1-js-capstone-backend.cloudfunctions.net/api/games/pnsGnjvnCzLyLxnwkdkP/scores/');

const scoreboardList = document.querySelector('.scoreboard-list');

const elementFromString = string => {
  const element = document.createElement('div');

  element.innerHTML = string;

  return element.firstChild;
};

const insertScore = data => {
  const list = `<li class="scoreboard-list-item">
  <span>
    Name: ${data.user}
  </span>
  <span>
    Score: ${data.score}
  </span>
</li>`;

  scoreboardList.appendChild(elementFromString(list));
};


function compareScore(a, b) {
  if (a.score > b.score) {
    return -1;
  }
  if (a.score < b.score) {
    return 1;
  }
  return 0;
}

getScores.then(result => {
  result.data.result.sort(compareScore).map(data => insertScore(data));
});