import PreloadScene from './scenes/PreloadScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import SaveLoadScene from './scenes/SaveLoadScene.js';
import ConfigScene from './scenes/ConfigScene.js';
import BacklogScene from './scenes/BacklogScene.js';
import ConfigManager from './core/ConfigManager.js';

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-game',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720
    },
    scene: [PreloadScene, GameScene, UIScene, SaveLoadScene, ConfigScene, BacklogScene],
    callbacks: {
        preBoot: (game) => {
            game.config.globals = {
                configManager: new ConfigManager()
            };
        }
    }
};

const game = new Phaser.Game(config);