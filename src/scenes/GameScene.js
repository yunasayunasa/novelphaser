// 必要なモジュールをインポート
import ScenarioManager from '../core/ScenarioManager.js';
import { handleCharaShow } from '../handlers/chara_show.js';
//import { handleCharaHide } from '../handlers/chara_hide.js';
import { handlePageBreak } from '../handlers/p.js';
// GameSceneクラスを定義し、デフォルトとしてエクスポート
export default class GameScene extends Phaser.Scene {
   constructor() {
        // 親クラスのコンストラクタを呼び出す
        super('GameScene');

        // プロパティの初期化
        this.scenarioManager = null;
        this.layer = { background: null, character: null, message: null };
    }

    // ★★★ initメソッドを追加 ★★★
    // 他のシーンからデータを受け取るためのメソッド
    init(data) {
        // PreloadSceneから渡されたキャラクター定義を受け取る
        this.charaDefs = data.charaDefs;
    }

    // アセットのプリロードを行うメソッド
    // preloadメソッドは大幅にスリム化
     // ★★★ preloadからWebフォント関連を削除 ★★★
    preload() {
        console.log("GameScene: 準備中...");
        this.load.text('scene1', 'assets/scene1.ks');
    }

    // ★★★ createをstartGameに統合し、シンプルにする ★★★
    create(data) {
        // initメソッドはcreateの前に呼ばれるので、this.charaDefsはここで使える
        console.log("GameScene: ゲーム開始！");
        this.cameras.main.setBackgroundColor('#000000');
        
        this.layer.background = this.add.container(0, 0);
        this.layer.character = this.add.container(0, 0);
        this.layer.message = this.add.container(0, 0);

        this.scenarioManager = new ScenarioManager(this, this.layer, this.charaDefs);
        
        this.scenarioManager.registerTag('chara_show', handleCharaShow);
        this.scenarioManager.registerTag('chara_hide', handleCharaHide);
        this.scenarioManager.registerTag('p', handlePageBreak);

        this.scenarioManager.load('scene1');
        
        this.input.on('pointerdown', () => { this.scenarioManager.onClick(); });
        this.scenarioManager.next();
    }
}