import Phaser from 'phaser';
import options from '../options';
import dude from '../assets/dude.png';
import block from '../assets/block.png';

export default class Scene extends Phaser.Scene {
  constructor() {
    super('Scene');
  }

  preload() {
    this.load.image('dude', dude);
    this.load.image('block', block);
  }
}