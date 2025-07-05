// 必要なモジュールをインポート
import ScenarioManager from '../core/ScenarioManager.js';
import { handleCharaShow } from '../handlers/chara_show.js';
import { handleCharaHide } from '../handlers/chara_hide.js';
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
    preload() {
        console.log("GameScene: 準備中...");
        // アセットはPreloadSceneで読み込み済みなので、ここではシナリオだけ
        this.load.text('scene1', 'assets/scene1.ks');
    }

    create() {
        // WebFontの読み込みは、GameSceneが始まる時点では完了しているはずなので、
        // PreloadSceneに移動させるのがベターだが、一旦ここに残してもOK
        WebFont.load({
            google: { families: ['Noto Sans JP'] },
            active: () => this.startGame(),
            inactive: () => this.startGame()
        });
    }


    // ゲームのメインロジックを開始するメソッド
    startGame() {
        console.log("Create: ゲーム開始！");
        this.cameras.main.setBackgroundColor('#000000');
        
        // レイヤーを生成
        this.layer.background = this.add.container(0, 0);
        this.layer.character = this.add.container(0, 0);
        this.layer.message = this.add.container(0, 0);

        // シナリオマネージャーを生成
         this.scenarioManager = new ScenarioManager(this, this.layer, this.charaDefs);
         // ★★★ タグ登録からchara_newを削除 ★★★
        this.scenarioManager.registerTag('chara_show', handleCharaShow);
        this.scenarioManager.registerTag('chara_hide', handleCharaHide);
        this.scenarioManager.registerTag('p', handlePageBreak);

        // loadDefinitionsの呼び出しは削除
        this.scenarioManager.load('scene1');

        // シナリオを読み込んで開始
        this.scenarioManager.load('scene1');
    }
}