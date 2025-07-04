// --- グローバル変数・定数 ---
const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 600;

// GameSceneクラスを元の状態に戻す
class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.scenarioManager = null;
    }

    preload() {
        // Webフォントの読み込みは活かしておきましょう
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
        this.load.text('scene1', 'assets/scene1.ks');
    }

    create() {
        // Webフォントが読み込まれてから処理を開始する
        WebFont.load({
            google: {
                families: ['Noto Sans JP']
            },
            active: () => {
                console.log("Webフォント読み込み完了");
                // フォント読み込み後にゲームを開始する
                this.startGame();
            }
        });
    }

    // ゲームのメイン処理を開始する関数
    startGame() {
        console.log("Create: ゲーム開始！");
        this.cameras.main.setBackgroundColor('#000000');

        // シナリオマネージャーを生成
        this.scenarioManager = new ScenarioManager(this);
        this.scenarioManager.load('scene1');

        // クリックイベントの設定
        this.input.on('pointerdown', () => {
            this.scenarioManager.onClick();
        });
        
        // 最初の行を実行開始
        this.scenarioManager.next();
    }
}


// --- Phaserのシーン設定 ---

// GameSceneクラスを定義
class GameScene extends Phaser.Scene {

    // preload は必要なので残します
    preload() {
        console.log("Preload: 準備中...");
        this.load.text('scene1', 'assets/scene1.ks');
    }

    // create は、デバッグ用のコードが書かれた1つだけにします
    create() {
        console.log("Create: 【デバッグモード】テキスト折り返し機能の単体テスト");
        this.cameras.main.setBackgroundColor('#000000');

        // --- ↓↓↓ ここからデバッグ専用コード ↓↓↓ ---
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;

        const padding = gameWidth * 0.1;
        const textBoxWidth = gameWidth - (padding * 2);
        const textBoxHeight = gameHeight * 0.4;
        const textBoxY = gameHeight * 0.5;

        const testString = "これは、Phaserのテキスト折り返し機能を単体でテストするための非常に長い文章です。この文章が、指定された幅で正しく折り返され、複数行にわたって表示されるかを確認します。";

        this.add.text(
            padding,
            textBoxY,
            testString,
            {
                fontFamily: '"Noto Sans JP", sans-serif',
    fontSize: '36px',
    fill: '#ffffff',
                wordWrap: {
                    width: textBoxWidth,
                    useAdvanced: true
                },
                fixedWidth: textBoxWidth,
                fixedHeight: textBoxHeight
            }
        );

        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0xff0000, 1.0);
        graphics.strokeRect(padding, textBoxY, textBoxWidth, textBoxHeight);
        // --- ↑↑↑ ここまでデバッグ専用コード ↑↑↑ ---
    }
    
    // constructor が抜けていたので、念のため追加しておきます
    constructor() {
        super('GameScene');
    }
}

// --- Phaserのゲーム設定 ---
// --- Phaserのゲーム設定 ---
const config = {
    // ★★★ typeを強制的にCANVASに変更 ★★★
    type: Phaser.CANVAS,
    scale: {
        mode: Phaser.Scale.FIT, // 縦横比を維持したまま、親要素（ブラウザウィンドウ）にフィットさせる
        parent: 'phaser-game',  // ゲームキャンバスを入れるdivのID（HTML側で追加）
        autoCenter: Phaser.Scale.CENTER_BOTH, // 縦横両方で中央揃え
        width: 720,  // "基準"となる幅（例：スマホ縦持ちを想定）
        height: 1280 // "基準"となる高さ
    },
    scene: [GameScene]
};

// ゲームインスタンスの作成
const game = new Phaser.Game(config);
