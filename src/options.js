const options = {
  platformSpeedRange: [300, 300],
  spawnRange: [80, 300],
  platformSizeRange: [90, 300],
  platformHeightRange: [-5, 5],
  platformHeighScale: 20,
  platformVerticalLimit: [0.4, 0.8],
  playerGravity: 900,
  jumpForce: 400,
  playerStartPosition: 200,
  jumps: 2,
  applePercent: 110,
  firePercent: 30,
  playerName: document.querySelector('#playerName').value || 'Unknown',
};

export default options;