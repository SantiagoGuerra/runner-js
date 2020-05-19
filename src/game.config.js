import Phaser from 'phaser';
import Scene from './scene/index';

export const configGame = {
  type: Phaser.AUTO,
  width: 1200,
  height: 600,
  backgroundColor: 0x444444,
  scene: Scene,
  physics: {
    default: 'arcade',
  },
};


export default configGame;