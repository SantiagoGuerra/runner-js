import Phaser from 'phaser';
import options from '../options';
import dude from '../assets/dude.png';
import block from '../assets/block.png';
import run from '../assets/run.png';

export default class Scene extends Phaser.Scene {
  constructor() {
    super('Scene');
  }

  preload() {
    this.load.image('dude', dude);
    this.load.image('block', block);
    this.load.spritesheet('run', run, {
      frameWidth: 32,
      frameHeight: 32,
    });
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

    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('player', {
        start: 0,
        end: 1,
      }),
      frameRate: 8,
      repeat: -1,
    });

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

  jump() {
    // eslint-disable-next-line max-len
    if (this.player.body.touching.down || (this.playerJumps > 0 && this.playerJumps < options.jumps)) {
      if (this.player.body.touching.down) {
        this.playerJumps = 0;
      }
      this.player.setVelocityY(options.jumpForce * -1);
      this.playerJumps += 1;
    }
  }

  update() {
    if (this.player.y > this.sys.game.config.height) {
      this.scene.start('Scene');
    }
    this.player.x = options.playerStartPosition;

    let minDistance = this.sys.game.config.width;
    this.platformGroup.getChildren().forEach(platform => {
      const platformDistance = this.sys.game.config.width - platform.x - platform.displayWidth / 2;
      minDistance = Math.min(minDistance, platformDistance);
      if (platform.x < -platform.displayWidth / 2) {
        this.platformGroup.killAndHide(platform);
        this.platformGroup.remove(platform);
      }
    }, this);

    if (minDistance > this.nextPlatformDistance) {
      // eslint-disable-next-line max-len
      const nextPlatformWidth = Phaser.Math.Between(options.platformSizeRange[0], options.platformSizeRange[1]);
      this.addPlatform(nextPlatformWidth, this.sys.game.config.width + nextPlatformWidth / 2);
    }
  }
}