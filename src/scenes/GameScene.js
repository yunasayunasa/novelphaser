import ScenarioManager from '../core/ScenarioManager.js';
import { handleCharaShow } from '../handlers/chara_show.js';
import { handleCharaHide } from '../handlers/chara_hide.js';
import { handlePageBreak } from '../handlers/p.js';
import { handleWait } from '../handlers/wait.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.scenarioManager = null;
        this.layer = { background: null, character: null, message: null };
        
        // ★★★ constructorでプロパティを初期化しておくのが安全 ★★★
        this.charaDefs = null; 
    }

    /**
     * PreloadSceneからデータを受け取るためのメソッド
     * createの前にPhaserによって自動的に呼ばれる
     */
    init(data) {
        console.log("GameScene: initデータ受け取り", data);
        this.charaDefs = data.charaDefs; // ここでプロパティにセット
    }

    preload() {
        console.log("GameScene: 準備中...");
        this.load.text('scene1', 'assets/scene1.ks');
    }

    /**
     * シーンが生成された時に呼ばれるメソッド
     */
    create() {
        console.log("GameScene: ゲーム開始！");
        this.cameras.main.setBackgroundColor('#000000');
        
        this.layer.background = this.add.container(0, 0);
        this.layer.character = this.add.container(0, 0);
        this.layer.message = this.add.container(0, 0);

        // ★★★ initでセットされた this.charaDefs を使う ★★★
        this.scenarioManager = new ScenarioManager(this, this.layer, this.charaDefs);
        this.scenarioManager.registerTag('wait', handleWait);
        this.scenarioManager.registerTag('chara_show', handleCharaShow);
        this.scenarioManager.registerTag('chara_hide', handleCharaHide);
        this.scenarioManager.registerTag('p', handlePageBreak);
  // ★★★ 表示中のキャラクターを名前で管理するオブジェクトを追加 ★★★
        this.characters = {}; 
        this.scenarioManager.load('scene1');
        
        this.input.on('pointerdown', () => { this.scenarioManager.onClick(); });
        this.scenarioManager.next();
    }
}