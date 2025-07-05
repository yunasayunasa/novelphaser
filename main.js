// --- ゲームエンジンの中核クラス ---
class ScenarioManager {
    constructor(scene, layers) {
        this.scene = scene;
        this.layers = layers;
        this.scenario = [];
        this.currentLine = 0;
        this.isWaitingClick = false;
        this.tagHandlers = new Map();

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

     registerTag(tagName, handler) {
        this.tagHandlers.set(tagName, handler);
    }

       // ★★★ 汎用的なタグ解析メソッドを追加 ★★★
    /**
     * タグ文字列を解析して、タグ名とパラメータのオブジェクトを返す
     * 例: "[chara_show storage="yuna" x=100]" -> { tagName: "chara_show", params: { storage: "yuna", x: "100" } }
     * @param {string} tagString - タグの文字列
     * @returns {{tagName: string, params: Object}}
     */
    parseTag(tagString) {
        const content = tagString.substring(1, tagString.length - 1); // 角括弧[]を削除
        const parts = content.match(/(?:[^\s"]+|"[^"]*")+/g) || []; // スペースで分割（""内は無視）
        
        const tagName = parts.shift() || '';
        const params = {};

        parts.forEach(part => {
            const [key, value] = part.split('=');
            if (value) {
                // 値から引用符 "" を削除
                params[key] = value.replace(/"/g, '');
            }
        });

        return { tagName, params };
    }

    // ★★★ parseメソッドを全面的に書き換え ★★★
    parse(line) {
        const trimedLine = line.trim();

        // ラベル行やコメント行の処理（先頭で判定）
        if (trimedLine.startsWith('*') || trimedLine.startsWith(';')) {
            console.log("ラベルまたはコメントをスキップ:", trimedLine);
            this.next();
            return;
        }

        // セリフ行の処理
        if (!trimedLine.startsWith('[')) {
            const wrappedLine = this.manualWrap(trimedLine);
            this.textObject.setText(wrappedLine);
            return; // セリフの場合はここで処理終了
        }
        
        // タグ行の処理
        const { tagName, params } = this.parseTag(trimedLine);
        const handler = this.tagHandlers.get(tagName);

        if (handler) {
            console.log(`タグ[${tagName}]を実行, パラメータ:`, params);
            handler(this, params); // 登録された関数を実行
        } else {
            console.warn(`未定義のタグです: [${tagName}]`);
            this.next(); // 不明なタグは無視して次に進む
        }
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
        this.layer.background = this.add.container(0, 0);
        this.layer.character = this.add.container(0, 0);
        this.layer.message = this.add.container(0, 0);

        this.scenarioManager = new ScenarioManager(this, this.layer);
        
        // ★★★ ここでタグをエンジンに登録する ★★★
        this.scenarioManager.registerTag('chara_show', handleCharaShow);
        this.scenarioManager.registerTag('p', handlePageBreak);
        // 新しいタグを追加する時は、ここに一行追加するだけでOK！

        this.scenarioManager.load('scene1');
        this.input.on('pointerdown', () => { this.scenarioManager.onClick(); });
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
