import Phaser from 'phaser';
import options from '../options';
import dude from '../assets/dude.png';
import block from '../assets/block.png';
import run from '../assets/run.png';
import apple from '../assets/apple.png';

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
    this.load.spritesheet('apple', apple, {
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

    this.appleGroup = this.add.group({

      removeCallback(apple) {
        apple.scene.applePool.add(apple);
      },
    });

    this.applePool = this.add.group({

      removeCallback(apple) {
        apple.scene.appleGroup.add(apple);
      },
    });

    this.playerJumps = 0;

    this.addPlatform(this.sys.game.config.width, this.sys.game.config.width / 2);

    this.player = this.physics.add.sprite(options.playerStartPosition, this.sys.game.config.height / 2, 'dude');
    this.player.setGravityY(options.playerGravity);

    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('run', {
        start: 0,
        end: 11,
      }),
      frameRate: 32,
      repeat: -1,
    });


    this.physics.add.collider(this.player, this.platformGroup, () => {
      if (!this.player.anims.isPlaying) {
        this.player.anims.play('run');
      }
    }, null, this);

    // setting collisions between the player and the apple group
    this.physics.add.overlap(this.player, this.appleGroup, (player, apple) => {
      this.tweens.add({
        targets: apple,
        y: apple.y - 100,
        alpha: 0,
        duration: 800,
        ease: 'Cubic.easeOut',
        callbackScope: this,
        onComplete() {
          this.appleGroup.killAndHide(apple);
          this.appleGroup.remove(apple);
        },
      });
    }, null, this);


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

      this.player.anims.stop();
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