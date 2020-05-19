import Phaser from 'phaser';
import Scene from './scene/index';

export const configGame = {
  type: Phaser.AUTO,
  width: 1334,
  height: 750,
  backgroundColor: 0x444444,
  scene: Scene,
  physics: {
    default: 'arcade',
  },
};


export default configGame;