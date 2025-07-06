// src/scenes/GameScene.js

import ScenarioManager from '../core/ScenarioManager.js';
import { handleCharaShow } from '../handlers/chara_show.js';
import { handleCharaHide } from '../handlers/chara_hide.js'; // これを有効にする
import { handlePageBreak } from '../handlers/p.js';
import { handleWait } from '../handlers/wait.js'; // これも有効にする
import { handleBg } from '../handlers/bg.js'; // これを追
import MessageWindow from '../ui/MessageWindow.js';
import { Layout } from '../core/Layout.js'; // これを追加
import { handleCharaMod } from '../handlers/chara_mod.js';
import SoundManager from '../core/SoundManager.js';
import { handlePlaySe } from '../handlers/playse.js';
import { handlePlayBgm } from '../handlers/playbgm.js';
import { handleStopBgm } from '../handlers/stopbgm.js';
import StateManager from '../core/StateManager.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.scenarioManager = null;
        this.layer = { background: null, character: null, message: null };
        this.charaDefs = null;
         this.messageWindow = null;
         this.soundManager = null;
        this.stateManager = null;
        this.characters = {}; 
    }

    init(data) {
        this.charaDefs = data.charaDefs;
    }

    preload() {
        this.load.text('scene1', 'assets/scene1.ks');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');
        this.layer.background = this.add.container(0, 0);
        this.layer.character = this.add.container(0, 0);
        this.layer.message = this.add.container(0, 0);
this.stateManager = new StateManager();
        this.scenarioManager = new ScenarioManager(this, this.layer, this.charaDefs);
          // ★★★ 1. 依存される部品を先に作る ★★★
        this.soundManager = new SoundManager(this, this.stateManager);
        
        // ★★★2. 部品を使って、他のオブジェクトを作る ★★★
        this.messageWindow = new MessageWindow(this, this.soundManagerthis);
        // ★★★ メッセージレイヤーにMessageWindowを追加 ★★★
        this.layer.message.add(this.messageWindow);
  // ★★★ 各マネージャーにstateManagerを渡す ★★

        this.scenarioManager = new ScenarioManager(this, this.layer, this.charaDefs, this.messageWindow, this.soundManager, this.stateManager);

        
       
        this.scenarioManager.registerTag('chara_show', handleCharaShow);
        this.scenarioManager.registerTag('chara_hide', handleCharaHide); // 有効化
        this.scenarioManager.registerTag('p', handlePageBreak);
       this.scenarioManager.registerTag('wait', handleWait); // 有効化
        this.scenarioManager.registerTag('bg', handleBg); // これを追加
        this.scenarioManager.registerTag('chara_mod', handleCharaMod);
        this.scenarioManager.registerTag('playse', handlePlaySe);
        this.scenarioManager.registerTag('playbgm', handlePlayBgm);
this.scenarioManager.registerTag('stopbgm', handleStopBgm);
        this.scenarioManager.load('scene1');
        this.input.on('pointerdown', () => { this.scenarioManager.onClick(); });
        this.scenarioManager.next();
    }
}
