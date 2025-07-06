export default class ScenarioManager {
    /**
     * @param {Phaser.Scene} scene
     * @param {Object} layers
     * @param {Object} charaDefs
     * @param {MessageWindow} messageWindow
     * @param {SoundManager} soundManager
     * @param {StateManager} stateManager
     */
    constructor(scene, layers, charaDefs, messageWindow, soundManager, stateManager) {
        this.scene = scene;
        this.layers = layers;
        this.characterDefs = charaDefs || {};
        this.messageWindow = messageWindow;
        this.soundManager = soundManager;
        this.stateManager = stateManager;

        this.scenario = [];
        this.currentFile = null; // 現在のシナリオファイル名を保持
        this.currentLine = 0;
        this.isWaitingClick = false;
        this.tagHandlers = new Map();
    }

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
        this.currentFile = scenarioKey; // ファイル名を保存
        this.currentLine = 0;
        console.log(`シナリオを解析しました: ${this.currentFile}`, this.scenario);
    }

        /**
     * 指定された話者を明るくし、それ以外を暗くする
     * @param {string | null} speakerName - 明るくするキャラクターの名前。nullの場合は全員を明るくする。
     */
    highlightSpeaker(speakerName) {
        const bright = 0xffffff; // 通常の色
        const dark = 0x888888;   // 暗い色

        for (const name in this.scene.characters) {
            const chara = this.scene.characters[name];
            if (!chara.active) continue; // 非アクティブなキャラは無視

            if (speakerName === null || speakerName === name) {
                chara.setTint(bright);
            } else {
                chara.setTint(dark);
            }
        }
    }

    next() {
    console.log(`--- next()呼び出し ---`);
    console.log(`isWaitingClick: ${this.isWaitingClick}`);

    if (this.isWaitingClick) return;

    console.log(`currentLine: ${this.currentLine}, scenario.length: ${this.scenario.length}`);

    if (this.currentLine >= this.scenario.length) {
        this.messageWindow.setText('（シナリオ終了）');
        console.log("シナリオ終了");
        return;
    }

    // ★ updateScenarioの前に、渡す値を確認
     // ★★★ 状態更新のタイミングを、行番号を進める「前」にする ★★★
    // これで「今から実行する行」の番号が保存される
    this.stateManager.updateScenario(this.currentFile, this.currentLine);

    const line = this.scenario[this.currentLine];
    this.currentLine++;
    this.parse(line);
}

        
      
    
    onClick() {
        this.messageWindow.hideNextArrow();
        if (this.messageWindow.isTyping) {
            this.messageWindow.skipTyping();
            return;
        }
        if (this.isWaitingClick) {
            this.isWaitingClick = false;
            this.next();
        }
    }

       parse(line) {
        const trimedLine = line.trim();

        // 1. 無視する行の判定
        if (trimedLine.startsWith(';') || trimedLine.startsWith('*')) {
            this.next();
            return;
        }

        // 2. 話者指定行の判定 (例: "yuna:こんにちは")
        const speakerMatch = trimedLine.match(/^([a-zA-Z0-9_]+):/);
        if (speakerMatch) {
            const speakerName = speakerMatch[1];
            const dialogue = trimedLine.substring(speakerName.length + 1).trim();

            this.highlightSpeaker(speakerName);
            
            const wrappedLine = this.manualWrap(dialogue);
            this.isWaitingClick = true;
            this.messageWindow.setText(wrappedLine, true, () => {
                this.messageWindow.showNextArrow();
            });
            return;
        }

        // 3. タグ行の判定
        if (trimedLine.startsWith('[')) {
            // [p]タグもここでまとめて処理できる
            const { tagName, params } = this.parseTag(trimedLine);
            const handler = this.tagHandlers.get(tagName);
    
            if (handler) {
                handler(this, params);
            } else {
                console.warn(`未定義のタグです: [${tagName}]`);
                this.next();
            }
            return;
        }

        // 4. 上記のいずれでもなければ「地の文」と確定
        this.highlightSpeaker(null); // 全員のハイライトを元に戻す

        this.isWaitingClick = true; 
        const wrappedLine = this.manualWrap(trimedLine);
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
        const style = { fontFamily: this.messageWindow.textObject.style.fontFamily, fontSize: this.messageWindow.textObject.style.fontSize };
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const testLine = currentLine + char;
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