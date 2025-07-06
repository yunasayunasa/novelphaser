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

    next() {
        if (this.isWaitingClick) return;
        if (this.currentLine >= this.scenario.length) {
            this.messageWindow.setText('（シナリオ終了）');
            console.log("シナリオ終了");
            return;
        }
        
        // ★ 状態更新：次の行に進む「前」に、現在の行番号を保存
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
        if (trimedLine.startsWith(';') || trimedLine.startsWith('*')) {
            this.next();
            return;
        }
        if (trimedLine === '[p]') {
            this.isWaitingClick = true;
            this.messageWindow.showNextArrow();
            return;
        }
        if (trimedLine.startsWith('[')) {
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