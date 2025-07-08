export default class ScenarioManager {
    constructor(scene, layers, charaDefs, messageWindow, soundManager, stateManager, configManager) {
        this.scene = scene;
        this.layers = layers;
        this.characterDefs = charaDefs || {};
        this.messageWindow = messageWindow;
        this.soundManager = soundManager;
        this.stateManager = stateManager;
        this.configManager = configManager;

        this.scenario = [];
        this.currentFile = null;
        this.currentLine = 0;
        this.isWaitingClick = false;
        this.isWaitingTag = false;
        this.isEnd = false;

        this.tagHandlers = new Map();
        this.ifStack = [];
        this.callStack = [];
    }

    registerTag(tagName, handler) {
        this.tagHandlers.set(tagName, handler);
    }

    load(scenarioKey) {
        const rawText = this.scene.cache.text.get(scenarioKey);
        if (!rawText) {
            console.error(`シナリオファイル [${scenarioKey}] が見つからないか、中身が空です。`);
            this.isEnd = true;
            return;
        }
        this.scenario = rawText.split(/\r\n|\n|\r/).filter(line => line.trim() !== '');
        this.currentFile = scenarioKey;
        this.currentLine = 0;
        console.log(`シナリオを解析しました: ${this.currentFile}`);
    }

    next() {
        if (this.isEnd || this.isWaitingClick || this.isWaitingTag) {
            return;
        }
        if (this.currentLine >= this.scenario.length) {
            this.messageWindow.setText('（シナリオ終了）', false);
            this.isEnd = true;
            return;
        }
        
        this.stateManager.updateScenario(this.currentFile, this.currentLine);
        
        const line = this.scenario[this.currentLine];
        this.currentLine++;
        
        this.parse(line);
    }
    
    onClick() {
        if (this.isEnd || this.isWaitingTag) return;
        
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
        const processedLine = this.embedVariables(line);
        const trimedLine = processedLine.trim();

        // スキップ判定
        const ifState = this.ifStack.length > 0 ? this.ifStack[this.ifStack.length - 1] : null;
        if (ifState && ifState.skipping) {
            const { tagName } = this.parseTag(trimedLine);
            if (['if', 'elsif', 'else', 'endif'].includes(tagName)) {
                const handler = this.tagHandlers.get(tagName);
                if (handler) handler(this, this.parseTag(trimedLine).params);
            }
            this.next();
            return;
        }
        
        // 通常実行
        if (trimedLine.startsWith(';') || trimedLine.startsWith('*')) {
            this.next();
        } else if (trimedLine.match(/^([a-zA-Z0-9_]+):/)) {
            // (省略なし)
        } else if (trimedLine.startsWith('[')) {
            const { tagName, params } = this.parseTag(trimedLine);
            const handler = this.tagHandlers.get(tagName);
            if (handler) {
                this.isWaitingTag = true;
                handler(this, params); // ハンドラが完了を通知する
            } else { this.next(); }
        } else if (trimedLine.length > 0) {
            // (省略なし)
        } else {
            this.next();
        }
    }
    
    finishTagExecution() {
        this.isWaitingTag = false;
        this.next();
    }
    
    async loadScenario(scenarioKey, targetLabel = null) {
        if (!this.scene.cache.text.has(scenarioKey)) {
            await new Promise(resolve => { /* ... */ });
        }
        this.load(scenarioKey);
        if (targetLabel) this.jumpTo(targetLabel);
    }

  

    jumpTo(target) {
        const labelName = target.substring(1);
        const targetLineIndex = this.scenario.findIndex(line => line.trim().startsWith('*') && line.trim().substring(1) === labelName);
        if (targetLineIndex !== -1) {
            this.currentLine = targetLineIndex;
        } else {
            console.error(`ジャンプ先のラベル[${target}]が見つかりませんでした。`);
        }
    }

    embedVariables(line) {
        return line.replace(/&((f|sf)\.[a-zA-Z0-9_.-]+)/g, (match, exp) => {
            const value = this.stateManager.eval(exp);
            if (value === undefined || value === null) {
                return `(undef: ${exp})`;
            }
            return value;
        });
    }

    parseTag(tagString) {
        const content = tagString.substring(1, tagString.length - 1).trim();
        const firstSpaceIndex = content.indexOf(' ');
        const tagName = firstSpaceIndex === -1 ? content : content.substring(0, firstSpaceIndex);
        const attributesString = firstSpaceIndex === -1 ? '' : content.substring(firstSpaceIndex + 1);
        const params = {};
        const regex = /(\w+)\s*=\s*("[^"]*"|'[^']*'|[^'"\s]+)/g;
        let match;
        while ((match = regex.exec(attributesString)) !== null) {
            let value = match[2];
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.substring(1, value.length - 1);
            }
            params[key] = value;
        }
        if (tagName === 'glink' && !params.text) {
             const lastPart = content.substring(content.lastIndexOf(attributesString) + attributesString.length).trim();
             if (lastPart) params.text = lastPart;
        }
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

    highlightSpeaker(speakerName) {
        const bright = 0xffffff;
        const dark = 0x888888;
        for (const name in this.scene.characters) {
            const chara = this.scene.characters[name];
            if (chara && chara.active) {
                if (speakerName === null || speakerName === name) {
                    chara.setTint(bright);
                } else {
                    chara.setTint(dark);
                }
            }
        }
    }
}
