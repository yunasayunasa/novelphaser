export default class ScenarioManager {export default class ScenarioManager {
    /**
     * @param {Phaser.Scene} scene - このマネージャーが属するPhaserのシーン
     * @param {Object} layers - ゲームの各レイヤー（コンテナ）
     * @param {Object} charaDefs - キャラクター定義情報
     * @param {MessageWindow} messageWindow - メッセージウィンドウのインスタンス
     */
    constructor(scene, layers, charaDefs, messageWindow) {
        this.scene = scene;
        this.layers = layers;
        this.characterDefs = charaDefs || {};
        this.messageWindow = messageWindow; 

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
        if (this.isWaitingClick) {
            this.isWaitingClick = false;
            this.messageWindow.setText('');
            this.next();
        } else {
            this.next();
        }
    }

    // --- 解析・ヘルパーメソッド ---

    parse(line) {
        const trimedLine = line.trim();
        if (trimedLine.startsWith('*') || trimedLine.startsWith(';')) {
            this.next();
            return;
        }

        if (!trimedLine.startsWith('[')) {
            const wrappedLine = this.manualWrap(trimedLine);
            this.messageWindow.setText(wrappedLine);
            return;
        }
        
        const { tagName, params } = this.parseTag(trimedLine);
        const handler = this.tagHandlers.get(tagName);

        if (handler) {
            console.log(`タグ[${tagName}]を実行, パラメータ:`, params);
            handler(this, params);
        } else {
            console.warn(`未定義のタグです: [${tagName}]`);
            this.next();
        }
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
}}