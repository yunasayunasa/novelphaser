// 必要なモジュールをインポート
import ScenarioManager from '../core/ScenarioManager.js';
import { handleCharaShow } from '../handlers/chara_show.js';
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

    // アセットのプリロードを行うメソッド
    preload() {
        console.log("Preload: 準備中...");
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
        this.load.text('scene1', 'assets/scene1.ks');
        this.load.image('message_window', 'assets/message_window.png');
        this.load.text('chara_define', 'assets/chara_define.ks');
    }

    // シーンが生成された時に呼ばれるメソッド
    create() {
        // Webフォントの読み込みを待ってからゲームを開始する
        WebFont.load({
            google: { families: ['Noto Sans JP'] },
            active: () => this.startGame(),
            inactive: () => {
                console.error("Webフォントの読み込みに失敗しました。");
                this.startGame();
            }
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
        this.scenarioManager = new ScenarioManager(this, this.layer);
        
         // タグハンドラを登録
        this.scenarioManager.registerTag('chara_show', handleCharaShow);
        this.scenarioManager.registerTag('chara_hide', handleCharaHide); // chara_hideも忘れずに
        this.scenarioManager.registerTag('p', handlePageBreak);
        // ★★★ chara_new タグを追加 ★★★
        this.scenarioManager.registerTag('chara_new', handleCharaNew);

        // ★★★ ゲーム開始前に、キャラクター定義を読み込ませる ★★★
        this.scenarioManager.loadDefinitions('chara_define');

        // シナリオを読み込んで開始
        this.scenarioManager.load('scene1');
    }
}