import GameScene from './scenes/GameScene.js';

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-game',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 720,
        height: 1280
    },
    // ★★★ 起動するシーンとして、インポートしたGameSceneを指定 ★★★
     scene: [PreloadScene, GameScene]
};

const game = new Phaser.Game(config);