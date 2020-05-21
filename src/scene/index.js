import Phaser from 'phaser';
import options from '../options';
import suckEffect from '../assets/suck-effect.wav';
import jumpEffect from '../assets/jump-effect.wav';
import musicBackground from '../assets/background-loop.wav';
import dude from '../assets/dude.png';
import block from '../assets/block.png';
import run from '../assets/run.png';
import apple from '../assets/apple.png';
import collected from '../assets/collected.png';
import background from '../assets/background.png';
import fire from '../assets/fire.png';
import playerDisappear from '../assets/player-disappear.png';
import nokiaFont from '../assets/nokia.png';
import nokiaFontXML from '../assets/nokia.xml';

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
    this.load.spritesheet('collected', collected, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('fire', fire, {
      frameWidth: 16,
      frameHeight: 32,
    });
    this.load.image('background', background);
    this.load.spritesheet('player-disappear', playerDisappear, {
      frameHeight: 96,
      frameWidth: 96,
    });
    this.load.audio('music-background', musicBackground);
    this.load.audio('suck-effect', suckEffect);
    this.load.audio('jump-effect', jumpEffect);
    this.load.bitmapFont('nokia', nokiaFont, nokiaFontXML);
  }

  create() {
    this.addedPlatforms = 0;

    this.music = this.sound.add('music-background');

    this.music.loop = true;
    this.suckEffect = this.sound.add('suck-effect');
    this.jumpEffect = this.sound.add('jump-effect');

    this.music.play();

    this.dying = false;

    this.add.tileSprite(0, 0, 2400, 1200, 'background');
    this.points = 0;
    this.score = this.add.bitmapText(64, 64, 'nokia');


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

    this.fireGroup = this.add.group({
      removeCallback(fire) {
        this.points += 1;

        fire.scene.firePool.add(fire);
      },
    });

    this.firePool = this.add.group({

      removeCallback(fire) {
        fire.scene.fireGroup.add(fire);
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

    this.anims.create({
      key: 'elastic-apple',
      frames: this.anims.generateFrameNumbers('apple', {
        start: 0,
        end: 16,
      }),
      frameRate: 32,
      repeat: -1,
    });

    this.anims.create({
      key: 'disappear',
      frames: this.anims.generateFrameNumbers('collected', {
        start: 0,
        end: 16,
      }),
      frameRate: 32,
      repeat: -1,
    });

    this.anims.create({
      key: 'burn',
      frames: this.anims.generateFrameNumbers('fire', {
        start: 0,
        end: 2,
      }),
      frameRate: 32,
      repeat: -1,
    });

    this.anims.create({
      key: 'player-disappear',
      frames: this.anims.generateFrameNumbers('player-disappear', {
        start: 0,
        end: 6,
      }),
      frameRate: 32,
      repeat: -1,
    });


    this.physics.add.collider(this.player, this.platformGroup, () => {
      if (!this.player.anims.isPlaying) {
        this.player.anims.play('run');
      }
    }, null, this);

    this.physics.add.overlap(this.player, this.appleGroup, (player, apple) => {
      this.points += 1;
      apple.disableBody(false, false);
      this.suckEffect.play();
      apple.anims.play('disappear');
      this.tweens.add({
        targets: apple,
        y: apple.y,
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

    this.physics.add.overlap(this.player, this.fireGroup, () => {
      this.dying = true;
      this.player.anims.play('player-disappear');
      this.player.setFrame(2);
      this.player.body.setVelocityY(-200);
      this.physics.world.removeCollider(this.platformCollider);
    }, null, this);


    this.input.on('pointerdown', this.jump, this);
    this.input.keyboard.on('keydown-SPACE', this.jump, this);
  }

  addPlatform(platformWidth, posX, posY) {
    this.addedPlatforms += 1;
    let platform;
    if (this.platformPool.getLength()) {
      platform = this.platformPool.getFirst();
      platform.x = posX;
      platform.y = posY;
      platform.active = true;
      platform.visible = true;
      this.platformPool.remove(platform);
      platform.displayWidth = platformWidth;
      platform.tileScaleX = 1 / platform.scaleX;
    } else {
      platform = this.add.tileSprite(posX, posY, platformWidth, 24, 'block');
      this.physics.add.existing(platform);
      platform.body.setImmovable(true);
      // eslint-disable-next-line max-len
      platform.body.setVelocityX(Phaser.Math.Between(options.platformSpeedRange[0], options.platformSpeedRange[1]) * -1);
      this.platformGroup.add(platform);
    }
    this.nextPlatformDistance = Phaser.Math.Between(options.spawnRange[0], options.spawnRange[1]);

    if (this.addedPlatforms > 1) {
      if (Phaser.Math.Between(1, 100) <= options.applePercent) {
        if (this.applePool.getLength()) {
          const apple = this.applePool.getFirst();
          apple.anims.play('elastic-apple');
          apple.x = posX;
          apple.y = posY - 96;
          apple.alpha = 1;
          apple.active = true;
          apple.visible = true;
          this.applePool.remove(apple);
        } else {
          const apple = this.physics.add.sprite(posX, posY - 96, 'apple');
          apple.setImmovable(true);
          apple.setVelocityX(platform.body.velocity.x);
          apple.anims.play('elastic-apple');
          this.appleGroup.add(apple);
        }
      }

      if (Phaser.Math.Between(1, 100) <= options.firePercent) {
        if (this.firePool.getLength()) {
          const fire = this.firePool.getFirst();
          fire.x = posX - platformWidth / 2 + Phaser.Math.Between(1, platformWidth);
          fire.y = posY - 46;
          fire.alpha = 1;
          fire.active = true;
          fire.visible = true;
          this.firePool.remove(fire);
        } else {
          const fire = this.physics.add.sprite(posX - platformWidth / 2 + Phaser.Math.Between(1, platformWidth), posY - 46, 'fire');
          fire.setImmovable(true);
          fire.setVelocityX(platform.body.velocity.x);
          fire.setSize(8, 2, true);
          fire.anims.play('burn');
          fire.setDepth(2);
          this.fireGroup.add(fire);
        }
      }
    }
  }

  jump() {
    // eslint-disable-next-line max-len
    if ((!this.dying) && (this.player.body.touching.down || (this.playerJumps > 0 && this.playerJumps < options.jumps))) {
      this.jumpEffect.play();
      if (this.player.body.touching.down) {
        this.playerJumps = 0;
      }
      this.player.setVelocityY(options.jumpForce * -1);
      this.playerJumps += 1;

      this.player.anims.stop();
    }
  }

  update() {
    let playerName = document.querySelector('#playerName').value || 'Unknown';
    this.score.text = `${playerName}'s Apples: ${this.points}`;
    if (this.player.y > this.sys.game.config.height) {
      this.music.stop();
      this.scene.start('Scene');
      this.points = 0;
    }
    this.player.x = options.playerStartPosition;

    let minDistance = this.sys.game.config.width;
    let rightmostPlatformHeight = 0;
    this.platformGroup.getChildren().forEach((platform) => {
      const platformDistance = this.sys.game.config.width - platform.x - platform.displayWidth / 2;
      if (platformDistance < minDistance) {
        minDistance = platformDistance;
        rightmostPlatformHeight = platform.y;
      }
      if (platform.x < -platform.displayWidth / 2) {
        this.platformGroup.killAndHide(platform);
        this.platformGroup.remove(platform);
      }
    }, this);

    this.appleGroup.getChildren().forEach(apple => {
      if (apple.x < -apple.displayWidth / 2) {
        this.appleGroup.killAndHide(apple);
        this.appleGroup.remove(apple);
      }
    }, this);

    this.fireGroup.getChildren().forEach((fire) => {
      if (fire.x < -fire.displayWidth / 2) {
        this.fireGroup.killAndHide(fire);
        this.fireGroup.remove(fire);
      }
    }, this);


    if (minDistance > this.nextPlatformDistance) {
      // eslint-disable-next-line max-len
      const nextPlatformWidth = Phaser.Math.Between(options.platformSizeRange[0], options.platformSizeRange[1]);
      // eslint-disable-next-line max-len
      const platformRandomHeight = options.platformHeighScale * Phaser.Math.Between(options.platformHeightRange[0], options.platformHeightRange[1]);
      const nextPlatformGap = rightmostPlatformHeight + platformRandomHeight;
      const minPlatformHeight = this.sys.game.config.height * options.platformVerticalLimit[0];
      const maxPlatformHeight = this.sys.game.config.height * options.platformVerticalLimit[1];
      // eslint-disable-next-line max-len
      const nextPlatformHeight = Phaser.Math.Clamp(nextPlatformGap, minPlatformHeight, maxPlatformHeight);
      // eslint-disable-next-line max-len
      this.addPlatform(nextPlatformWidth, this.sys.game.config.width + nextPlatformWidth / 2, nextPlatformHeight);
    }
  }
}