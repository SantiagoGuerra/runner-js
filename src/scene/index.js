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

  create() {
    this.platformGroup = this.add.group({

      removeCallback(platform) {
        platform.scene.platformPool.add(platform);
      },
    });

    this.platformPool = this.add.group({

      removeCallback(platform) {
        platform.scene.platformGroup.add(platform);
      },
    });

    this.playerJumps = 0;

    this.addPlatform(this.sys.game.config.width, this.sys.game.config.width / 2);

    this.player = this.physics.add.sprite(options.playerStartPosition, this.sys.game.config.height / 2, 'dude');
    this.player.setGravityY(options.playerGravity);

    this.physics.add.collider(this.player, this.platformGroup);

    this.input.on('pointerdown', this.jump, this);
  }

  addPlatform(platformWidth, posX) {
    let platform;
    if (this.platformPool.getLength()) {
      platform = this.platformPool.getFirst();
      platform.x = posX;
      platform.active = true;
      platform.visible = true;
      this.platformPool.remove(platform);
    } else {
      platform = this.physics.add.sprite(posX, this.sys.game.config.height * 0.8, 'block');
      platform.setImmovable(true);
      platform.setVelocityX(options.platformStartSpeed * -1);
      this.platformGroup.add(platform);
    }
    platform.displayWidth = platformWidth;
    this.nextPlatformDistance = Phaser.Math.Between(options.spawnRange[0], options.spawnRange[1]);
  }
}