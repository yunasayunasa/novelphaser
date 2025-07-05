export default class ScenarioManager {
    constructor(scene, layers) {
        this.scene = scene;
        this.layers = layers;
        this.scenario = [];
        this.currentLine = 0;
        this.isWaitingClick = false;
        this.tagHandlers = new Map();
        this.characterDefs = {};

        const gameWidth = this.scene.scale.width;
        const gameHeight = this.scene.scale.height;
        
        const msgWindowY = gameHeight * 0.65;
        const msgWindow = this.scene.add.image(gameWidth / 2, msgWindowY, 'message_window');
        this.layers.message.add(msgWindow);

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
        this.layers.message.add(this.textObject);
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

    loadDefinitions(scenarioKey) {
        const rawText = this.scene.cache.text.get(scenarioKey);
        if (!rawText) {
            console.error(`定義ファイル [${scenarioKey}] が見つからないか、中身が空です。`);
            return;
        }
        const lines = rawText.split(/\r\n|\n|\r/);
        for (const line of lines) {
            const trimedLine = line.trim();
            if (trimedLine.startsWith('[chara_new')) {
                const { tagName, params } = this.parseTag(trimedLine);
                const handler = this.tagHandlers.get(tagName);
                if (handler) {
                    handler(this, params);
                }
            }
            if (trimedLine.startsWith('*stop')) {
                break;
            }
        }
    }

    // --- シナリオ進行メソッド ---

    next() {
        if (this.isWaitingClick) return;
        if (this.currentLine >= this.scenario.length) {
            this.textObject.setText('（シナリオ終了）');
            return;
        }
        const line = this.scenario[this.currentLine];
        this.currentLine++;
        this.parse(line);
    }
    
    onClick() {
        if (this.isWaitingClick) {
            this.isWaitingClick = false;
            this.textObject.setText('');
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
            this.textObject.setText(wrappedLine);
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
   // ... parse メソッドの終わり
    }

    // --- 解析・ヘルパーメソッド ---

    parseTag(tagString) { // ★★★ この形式に修正 ★★★
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
    
    manualWrap(text) { // ★★★ この形式に修正 ★★★
        let wrappedText = '';
        let currentLine = '';
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const testLine = currentLine + char;
            const metrics = this.scene.add.text(0, 0, testLine, { fontFamily: this.textObject.style.fontFamily, fontSize: this.textObject.style.fontSize }).setVisible(false);
            if (metrics.width > this.textBoxWidth) {
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