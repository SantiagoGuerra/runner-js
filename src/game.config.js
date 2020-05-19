import Phaser from 'phaser';
import preload from './scene/preload';
import create from './scene/create';

export const config = {
  type: Phaser.AUTO,
  width: 1334,
  height: 750,
  backgroundColor: 0x444444,
  scene: {
    preload,
    create
  },
  physics: {
    default: 'arcade',
  },
};


export default config;