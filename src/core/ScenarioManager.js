export default class ScenarioManager {
   /**
     * @param {Phaser.Scene} scene
     * @param {Object} layers
     * @param {Object} charaDefs
     * @param {MessageWindow} messageWindow
     * @param {SoundManager} soundManager  // ★★★ これを引数に追加 ★★★
     */
    constructor(scene, layers, charaDefs, messageWindow, soundManager, stateManager) {
        this.scene = scene;
        this.layers = layers;
        this.characterDefs = charaDefs || {};
        this.messageWindow = messageWindow; 
  this.soundManager = soundManager;
this.stateManager =stateManager;
        this.scenario = [];
        this.currentLine = 0;
        this.isWaitingClick = false;
        this.tagHandlers = new Map();
    }

    // --- タグ・シナリオ管理メソッド ---

    registerTag(tagName, handler) {
        this.tagHandlers.set(tagName, handler);
    }

    load(scenarioKey) {
        const rawText = this.scene.cache.text.get(scenarioKey);
        if (!rawText) {
            console.error(`シナリオファイル [${scenarioKey}] が見つからないか、中身が空です。`);
            return;
        }
        this.scenario = rawText.split(/\r\n|\n|\r/).filter(line => line.trim() !== '');
        this.currentLine = 0;
        console.log("シナリオを解析しました:", this.scenario);
    }

    // --- シナリオ進行メソッド ---

    next() {
        if (this.isWaitingClick) return;
        if (this.currentLine >= this.scenario.length) {
            // シナリオ終了時は、メッセージウィンドウのテキストもクリアする
            this.messageWindow.setText('（シナリオ終了）');
            console.log("シナリオ終了");
            return;
        }
        const line = this.scenario[this.currentLine];
        this.currentLine++;
        this.parse(line);
    }
    
         onClick() {
        // ★★★ アイコン非表示 ★★★
        this.messageWindow.hideNextArrow();

        if (this.messageWindow.isTyping) {
            this.messageWindow.skipTyping();
            // スキップした場合は、テロップ完了時にアイコンが表示されるので、
            // ここでは何もしなくてOK
            return;
        }
        
        if (this.isWaitingClick) {
            this.isWaitingClick = false;
            this.next();
        }
    }

    // ... ScenarioManagerクラスの中に追加 ...

    /**
     * 指定された話者を明るくし、それ以外を暗くする
     * @param {string | null} speakerName - 明るくするキャラクターの名前。nullの場合は全員を明るくする。
     */
    highlightSpeaker(speakerName) {
        const bright = 0xffffff; // 通常の明るさ（白）
        const dark = 0x888888;   // 暗い状態（グレー）

        // GameSceneが管理しているキャラクターリストをループ
        for (const name in this.scene.characters) {
            const chara = this.scene.characters[name];
            
            if (speakerName === null || speakerName === name) {
                // 話者がいない(null)場合、または現在のキャラが話者の場合は明るくする
                chara.setTint(bright);
            } else {
                // それ以外のキャラは暗くする
                chara.setTint(dark);
            }
        }
    }

    // --- 解析・ヘルパーメソッド ---

     /**
     * 1行のシナリオを解釈（パース）して、適切な処理を呼び出す
     * @param {string} line - 解釈するシナリオの1行
     */
    parse(line) {
        const trimedLine = line.trim();

        // 1. 無視する行の判定 (コメント、ラベル)
        if (trimedLine.startsWith(';') || trimedLine.startsWith('*')) {
            // 何もせず、すぐに次の行の処理へ
            this.next();
            return;
        }

          // ★★★ 2. 話者指定行の判定 (新規追加) ★★★
        // "キャラ名:" または "#キャラ名" の形式を認識 (正規表現を使用)
        const speakerMatch = trimedLine.match(/^([a-zA-Z0-9_]+):/);
        if (speakerMatch) {
            const speakerName = speakerMatch[1]; // マッチした部分（キャラ名）を取得
            const dialogue = trimedLine.substring(speakerName.length + 1).trim(); // コロン以降のセリフ部分を取得

            // 話者ハイライト処理を呼び出す
            this.highlightSpeaker(speakerName);
            
            // セリフ部分をテロップ表示
            const wrappedLine = this.manualWrap(dialogue);
            this.isWaitingClick = true;
            this.messageWindow.setText(wrappedLine, true, () => {
                this.messageWindow.showNextArrow();
            });
            return;
        }

        // 2. [p] タグの判定 (クリック待ち)
        if (trimedLine === '[p]') {
            this.isWaitingClick = true;
            this.messageWindow.showNextArrow();
            return;
        }
        
        // 3. その他のタグの判定
        if (trimedLine.startsWith('[')) {
            const { tagName, params } = this.parseTag(trimedLine);
            const handler = this.tagHandlers.get(tagName);
    
            if (handler) {
                // 登録済みのタグハンドラを実行
                console.log(`タグ[${tagName}]を実行, パラメータ:`, params);
                handler(this, params);
            } else {
                // 未定義のタグは警告を出し、無視して次に進む
                console.warn(`未定義のタグです: [${tagName}]`);
                this.next();
            }
            // タグの処理が完了したので、ここで終了
            return;
        }

       // 5. 上記のいずれでもなければ「地の文」と確定
        // ★★★ 地の文の場合は、全員をハイライト（元の明るさに戻す） ★★★
        this.highlightSpeaker(null); // nullを渡すと全員が通常表示になるように設計

        const wrappedLine = this.manualWrap(trimedLine);
        this.isWaitingClick = true; 
        this.messageWindow.setText(wrappedLine, true, () => {
            this.messageWindow.showNextArrow();
        });
    }

    parseTag(tagString) {
        const content = tagString.substring(1, tagString.length - 1);
        const parts = content.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
        const tagName = parts.shift() || '';
        const params = {};
        parts.forEach(part => {
            const [key, value] = part.split('=');
            if (value) {
                params[key] = value.replace(/"/g, '');
            }
        });
        return { tagName, params };
    }
    
    manualWrap(text) {
        let wrappedText = '';
        let currentLine = '';
        const textBoxWidth = this.messageWindow.textBoxWidth;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const testLine = currentLine + char;
            
            // 計測用のテキストオブジェクトのスタイルを、実際のテキストオブジェクトから取得
            const style = {
                fontFamily: this.messageWindow.textObject.style.fontFamily,
                fontSize: this.messageWindow.textObject.style.fontSize
            };
            const metrics = this.scene.add.text(0, 0, testLine, style).setVisible(false);

            if (metrics.width > textBoxWidth) {
                wrappedText += currentLine + '\n';
                currentLine = char;
            } else {
                currentLine = testLine;
            }
            metrics.destroy();
        }
        
        wrappedText += currentLine;
        return wrappedText;
    }

    
}
