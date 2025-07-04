// --- ゲームエンジンの中核クラス ---
class ScenarioManager {
    constructor(scene) {
        this.scene = scene;         // Phaserのシーンオブジェクト
        this.scenario = [];         // シナリオ全体を格納する配列
        this.currentLine = 0;       // 現在実行中の行番号
        this.isWaitingClick = false; // クリック待ち状態かどうかのフラグ

        // ゲーム画面の幅と高さをスケールマネージャーから取得
        const gameWidth = this.scene.scale.width;
        const gameHeight = this.scene.scale.height;

        // テキストを表示する「箱」のサイズと位置を定義
        const padding = gameWidth * 0.1; // 左右の余白
        const textBoxWidth = gameWidth - (padding * 2); // 箱の幅
        const textBoxHeight = gameHeight * 0.30; // 箱の高さ（画面高さの30%を確保）
        const textBoxY = gameHeight - textBoxHeight - (gameHeight * 0.05); // 箱を画面下から5%の位置に配置
        
        // テキストボックスの幅をプロパティとして保持
        this.textBoxWidth = textBoxWidth;

        // 画面に表示するテキストオブジェクト
        this.textObject = this.scene.add.text(
            padding,
            textBoxY,
            '',
            {
                fontFamily: '"Noto Sans JP", sans-serif',
                fontSize: '36px',
                fill: '#ffffff',
                // wordWrapは使わない
                fixedWidth: textBoxWidth,
                fixedHeight: textBoxHeight
            }
        );
    }

    /**
     * 手動で改行コードを挿入するメソッド
     * @param {string} text - 折り返し処理をしたい元のテキスト
     * @returns {string} 改行コード(\n)が挿入された新しいテキスト
     */
    manualWrap(text) {
        let wrappedText = '';
        let currentLine = '';
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const testLine = currentLine + char;
            
            // 目に見えない一時的なテキストオブジェクトを作って、その描画幅を計測する
            const metrics = this.scene.add.text(0, 0, testLine, { 
                fontFamily: this.textObject.style.fontFamily,
                fontSize: this.textObject.style.fontSize
            }).setVisible(false);

            // 計測した幅が、テキストボックスの最大幅を超えたら
            if (metrics.width > this.textBoxWidth) {
                wrappedText += currentLine + '\n'; // それまでの行を確定し、改行コードを追加
                currentLine = char; // 現在の文字から新しい行を開始
            } else {
                currentLine = testLine; // まだ余裕があるので、テスト中の行を正式な行とする
            }
            
            metrics.destroy(); // 計測用オブジェクトは用が済んだらすぐに破棄する
        }
        
        wrappedText += currentLine; // ループの最後に残った行を追加
        return wrappedText;
    }


    /**
     * シナリオデータを読み込み、行ごとに分割して準備する
     * @param {string} scenarioKey - preloadで読み込んだシナリオのキー
     */
    load(scenarioKey) {
        const rawText = this.scene.cache.text.get(scenarioKey);
        // テキストを改行で分割し、空行を無視して配列に格納
        this.scenario = rawText.split(/\r\n|\n|\r/).filter(line => line.trim() !== '');
        this.currentLine = 0;
        console.log("シナリオを解析しました:", this.scenario);
    }

    /**
     * 次のシナリオ行に進む
     */
    next() {
        if (this.isWaitingClick) {
            return;
        }

        if (this.currentLine >= this.scenario.length) {
            this.textObject.setText('（シナリオ終了）');
            console.log("シナリオ終了");
            return;
        }

        const line = this.scenario[this.currentLine];
        this.currentLine++;

        this.parse(line);
    }

    /**
     * 1行のシナリオを解釈（パース）して、適切な処理を呼び出す
     * @param {string} line - 解釈するシナリオの1行
     */
    parse(line) {
        console.log(`実行: ${line}`);

        // [p] タグの処理
        if (line.trim() === '[p]') {
            this.isWaitingClick = true;
            return;
        }
        
        // その他のタグ（今は何もしない）
        if (line.trim().startsWith('[')) {
            console.log("タグを検出（未実装）:", line);
            this.next(); // すぐに次の行へ
            return;
        }

        // ラベル（*で始まる行）の処理（今は何もしない）
        if (line.trim().startsWith('*')) {
            console.log("ラベルを検出（未実装）:", line);
            this.next(); // すぐに次の行へ
            return;
        }

        // 上記のいずれでもなければ、セリフとして表示
        // ★★★ 自作の改行処理を呼び出す ★★★
        const wrappedLine = this.manualWrap(line);
        this.textObject.setText(wrappedLine);
    }

    /**
     * 画面がクリックされた時の処理
     */
    onClick() {
        if (this.isWaitingClick) {
            this.isWaitingClick = false;
            this.textObject.setText('');
            this.next();
        } else {
            this.next();
        }
    }
}


// --- Phaserのシーン設定 ---

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.scenarioManager = null;
    }

    preload() {
        console.log("Preload: 準備中...");
        // WebFont Loaderのスクリプトを読み込む
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
        // シナリオファイルを読み込む
        this.load.text('scene1', 'assets/scene1.ks');
    }

    create() {
        // Webフォントが読み込まれてから、ゲームのメイン処理を開始する
        WebFont.load({
            google: {
                families: ['Noto Sans JP'] // 使用したいGoogle Fontsを指定
            },
            active: () => {
                // フォント読み込みが成功したらstartGameを呼び出す
                this.startGame();
            },
            inactive: () => {
                // フォント読み込みが失敗した場合もゲームは開始する
                console.error("Webフォントの読み込みに失敗しました。");
                this.startGame();
            }
        });
    }

    // ゲームの本体を開始する関数
    startGame() {
        console.log("Create: ゲーム開始！");
        this.cameras.main.setBackgroundColor('#000000');

        // シナリオマネージャーを生成
        this.scenarioManager = new ScenarioManager(this);
        this.scenarioManager.load('scene1');

        // クリック（タップ）イベントの設定
        this.input.on('pointerdown', () => {
            this.scenarioManager.onClick();
        });
        
        // 最初の行を実行開始
        this.scenarioManager.next();
    }
}


// --- Phaserのゲーム設定 ---
const config = {
    type: Phaser.AUTO, // WebGLが使えるならWebGLを、そうでなければCanvasを使う
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-game',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 720,  // "基準"となる幅（スマホ縦持ちを想定）
        height: 1280 // "基準"となる高さ
    },
    scene: [GameScene]
};

// ゲームインスタンスの作成
const game = new Phaser.Game(config);
