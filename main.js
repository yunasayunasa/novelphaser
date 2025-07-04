// --- グローバル変数・定数 ---
const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 600;

// --- ゲームエンジンの中核クラス ---
class ScenarioManager {
    constructor(scene) {
        this.scene = scene;         // Phaserのシーンオブジェクト
        this.scenario = [];         // シナリオ全体を格納する配列
        this.currentLine = 0;       // 現在実行中の行番号
        this.isWaitingClick = false; // クリック待ち状態かどうかのフラグ

        // 画面に表示するテキストオブジェクト
        this.textObject = this.scene.add.text(50, 400, '', {
            font: '24px sans-serif',
            fill: '#ffffff',
            wordWrap: { width: SCREEN_WIDTH - 100 }
        }).setOrigin(0, 0);
    }

    // シナリオデータをセットアップするメソッド
    load(scenarioKey) {
        const rawText = this.scene.cache.text.get(scenarioKey);
        // テキストを改行で分割し、空行を無視して配列に格納
        this.scenario = rawText.split(/\r\n|\n|\r/).filter(line => line.trim() !== '');
        this.currentLine = 0;
        console.log("シナリオを解析しました:", this.scenario);
    }

    // 次の行に進むメソッド
    next() {
        // クリック待ち状態なら、何もしない（[p]タグの処理）
        if (this.isWaitingClick) {
            return;
        }

        // シナリオの最後まで到達したら終了
        if (this.currentLine >= this.scenario.length) {
            this.textObject.setText('（シナリオ終了）');
            console.log("シナリオ終了");
            return;
        }

        // 現在の行のテキストを取得して、行番号を進める
        const line = this.scenario[this.currentLine];
        this.currentLine++;

        // 行を解析して実行
        this.parse(line);
    }

    // 1行を解析して、適切な処理を呼び出すメソッド（パーサー）
    parse(line) {
        console.log(`実行: ${line}`);

        // [p] タグの処理
        if (line.trim() === '[p]') {
            this.isWaitingClick = true; // クリック待ち状態にする
            // ここではテキストは更新しない
            return;
        }
        
        // その他のタグ（今は何もしない）
        if (line.trim().startsWith('[')) {
            // 将来的に他のタグの処理をここに追加
            console.log("タグを検出（未実装）:", line);
            this.next(); // すぐに次の行へ
            return;
        }

        // ラベル（*で始まる行）の処理（今は何もしない）
        if (line.trim().startsWith('*')) {
            // 将来的にラベル管理をここに追加
            console.log("ラベルを検出（未実装）:", line);
            this.next(); // すぐに次の行へ
            return;
        }

        // 上記のいずれでもなければ、セリフとして表示
        this.textObject.setText(line);
    }

    // クリックを受け付けた時の処理
    onClick() {
        // もしクリック待ち状態（[p]タグの後）なら
        if (this.isWaitingClick) {
            this.isWaitingClick = false; // クリック待ちを解除
            this.textObject.setText('');   // テキストをクリア
            this.next();                 // 次の行の処理へ進む
        } else {
            // 通常のセリフ表示中なら、次の行へ
            this.next();
        }
    }
}


// --- Phaserのシーン設定 ---

// GameSceneクラスを定義
class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.scenarioManager = null;
    }

    preload() {
        console.log("Preload: 準備中...");
        this.load.text('scene1', 'assets/scene1.ks');
    }

    create() {
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


// --- Phaserのゲーム設定 ---
const config = {
    type: Phaser.AUTO,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    scene: [GameScene] // シーンをクラスで指定
};

// ゲームインスタンスの作成
const game = new Phaser.Game(config);