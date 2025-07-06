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


export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.scenarioManager = null;
        this.layer = { background: null, character: null, message: null };
        this.charaDefs = null;
         this.messageWindow = null;
        // ★★★ 正しい位置はここです！ ★★★
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

        this.scenarioManager = new ScenarioManager(this, this.layer, this.charaDefs);
        // ★★★ MessageWindowを生成 ★★★
        this.messageWindow = new MessageWindow(this);
        // ★★★ メッセージレイヤーにMessageWindowを追加 ★★★
        this.layer.message.add(this.messageWindow);

        // ★★★ ScenarioManagerにmessageWindowを渡す ★★★
        this.scenarioManager = new ScenarioManager(this, this.layer, this.charaDefs, this.messageWindow);
        this.scenarioManager.registerTag('chara_show', handleCharaShow);
        this.scenarioManager.registerTag('chara_hide', handleCharaHide); // 有効化
        this.scenarioManager.registerTag('p', handlePageBreak);
       this.scenarioManager.registerTag('wait', handleWait); // 有効化
        this.scenarioManager.registerTag('bg', handleBg); // これを追加
        this.scenarioManager.registerTag('chara_mod', handleCharaMod);
        this.scenarioManager.load('scene1');
        this.input.on('pointerdown', () => { this.scenarioManager.onClick(); });
        this.scenarioManager.next();
    }
}