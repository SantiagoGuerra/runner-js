import Phaser from 'phaser';

export const config = {
  type: Phaser.AUTO,
  width: 1334,
  height: 750,
  backgroundColor: 0x444444,

  physics: {
    default: 'arcade',
  },
};


export default config;