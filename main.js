// --- ゲームエンジンの中核クラス ---
class ScenarioManager {
    // constructorの引数にlayersを追加
    constructor(scene, layers) {
        this.scene = scene;
        this.layers = layers; // シーンから受け取ったレイヤーを保持
        this.scenario = [];
        this.currentLine = 0;
        this.isWaitingClick = false;

        const gameWidth = this.scene.scale.width;
        const gameHeight = this.scene.scale.height;
        
        // --- メッセージウィンドウの表示 ---
        const msgWindowY = gameHeight * 0.65; // ウィンドウのY座標
        // メッセージレイヤーにウィンドウ画像を追加
        const msgWindow = this.scene.add.image(gameWidth / 2, msgWindowY, 'message_window');
        this.layers.message.add(msgWindow); // コンテナに追加

        // --- テキストオブジェクトの配置 ---
        // テキストの座標をウィンドウに合わせる
        const padding = 80;
        const textBoxWidth = msgWindow.width - (padding * 2);
        const textBoxHeight = msgWindow.height - (padding * 1.5);
        this.textBoxWidth = textBoxWidth;

        this.textObject = this.scene.add.text(
            msgWindow.x - (msgWindow.width / 2) + padding,
            msgWindow.y - (msgWindow.height / 2) + (padding / 2),
            '',
            {
                fontFamily: '"Noto Sans JP", sans-serif',
                fontSize: '36px',
                fill: '#ffffff',
                fixedWidth: textBoxWidth,
                fixedHeight: textBoxHeight
            }
        );
        this.layers.message.add(this.textObject); // テキストもメッセージレイヤーに追加
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
     * @param {string} line - 解釈するシナリオの1行.*/
    parse(line) {
        console.log(`実行: ${line}`);
        
        const trimedLine = line.trim();

        // ★★★ [chara_show] タグの処理を追加 ★★★
        if (trimedLine.startsWith('[chara_show')) {
            // 例: [chara_show storage="yuna_smile" x=360 y=800]
            const storage = this.getTagValue(trimedLine, 'storage');
            const x = Number(this.getTagValue(trimedLine, 'x'));
            const y = Number(this.getTagValue(trimedLine, 'y'));

            if (storage) {
                // キャラクターレイヤーに画像を追加
                const chara = this.scene.add.image(x, y, storage);
                this.layers.character.add(chara);
            }
            this.next(); // すぐに次の行へ
            return;
        }

        // [p] タグの処理
        if (trimedLine === '[p]') {
            this.isWaitingClick = true;
            return;
        }
        
        // その他のタグ（今は何もしない）
        if (trimedLine.startsWith('[')) {
            console.log("タグを検出（未実装）:", line);
            this.next();
            return;
        }

        // ラベル（*で始まる行）の処理（今は何もしない）
        if (trimedLine.startsWith('*')) {
            console.log("ラベルを検出（未実装）:", line);
            this.next();
            return;
        }

        // セリフ表示
        const wrappedLine = this.manualWrap(line);
        this.textObject.setText(wrappedLine);
    }
    
    // ★★★ タグの属性値を取得するためのヘルパー関数を追加 ★★★
    getTagValue(tagString, attribute) {
        // 正規表現で "attr=value" の部分を検索
        const regex = new RegExp(`${attribute}\\s*=\\s*"?([^"\\s\\]]+)"?`);
        const match = tagString.match(regex);
        return match ? match[1] : null;
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
        // レイヤーをプロパティとして保持
        this.layer = {
            background: null,
            character: null,
            message: null
        };
    }

    preload() {
        console.log("Preload: 準備中...");
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
        this.load.text('scene1', 'assets/scene1.ks');
        
        // ★★★ 画像アセットを読み込む ★★★
        this.load.image('message_window', 'assets/message_window.png');
        this.load.image('yuna_smile', 'assets/yuna_smile.png'); // keyとファイル名を指定
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

        // ★★★ レイヤーを作成する ★★★
        // Phaserのコンテナ機能を使って、オブジェクトをまとめる入れ物を作る
        // 作成順がそのまま重なり順になる（後から作ったものが上に来る）
        this.layer.background = this.add.container(0, 0);
        this.layer.character = this.add.container(0, 0);
        this.layer.message = this.add.container(0, 0);

        // シナリオマネージャーを生成（引数にレイヤーを渡す）
        this.scenarioManager = new ScenarioManager(this, this.layer);
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
