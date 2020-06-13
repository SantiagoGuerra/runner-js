const scoreboard = document.querySelector('.scoreboard');
scoreboard.addEventListener('click', () => {
  scoreboard.classList.toggle('close');
});

const openScoreboad = document.querySelector('.open-scoreboard');

openScoreboad.addEventListener('click', () => {
  scoreboard.classList.toggle('close');
});