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
        this.currentFile = scenarioKey;
        this.currentLine = 0;
        console.log(`シナリオを解析しました: ${this.currentFile}`, this.scenario);
    }

    next() {
        if (this.isWaitingClick) return;
        if (this.currentLine >= this.scenario.length) {
            this.messageWindow.setText('（シナリオ終了）');
            return;
        }
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
        const processedLine = this.embedVariables(line);
        const trimedLine = processedLine.trim();

        if (trimedLine.startsWith(';') || trimedLine.startsWith('*')) {
            this.next();
            return;
        }

        const speakerMatch = trimedLine.match(/^([a-zA-Z0-9_]+):/);
        if (speakerMatch) {
            const speakerName = speakerMatch[1];
            const dialogue = trimedLine.substring(speakerName.length + 1).trim();
            this.stateManager.addHistory(speakerName, dialogue);
            this.highlightSpeaker(speakerName);
            const wrappedLine = this.manualWrap(dialogue);
            this.isWaitingClick = true;
            this.messageWindow.setText(wrappedLine, true, () => {
                this.messageWindow.showNextArrow();
            });
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

        this.stateManager.addHistory(null, trimedLine);
        this.highlightSpeaker(null);
        this.isWaitingClick = true; 
        const wrappedLine = this.manualWrap(trimedLine);
        this.messageWindow.setText(wrappedLine, true, () => {
            this.messageWindow.showNextArrow();
        });
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

    highlightSpeaker(speakerName) {
        const bright = 0xffffff;
        const dark = 0x888888;
        for (const name in this.scene.characters) {
            const chara = this.scene.characters[name];
            if (!chara.active) continue;
            if (speakerName === null || speakerName === name) {
                chara.setTint(bright);
            } else {
                chara.setTint(dark);
            }
        }
    }

    jumpTo(target) {
        const labelName = target.substring(1);
        const targetLineIndex = this.scenario.findIndex(line => line.trim().startsWith('*') && line.trim().substring(1) === labelName);
        if (targetLineIndex !== -1) {
            console.log(`ジャンプ: ${target} (行番号 ${targetLineIndex})`);
            this.currentLine = targetLineIndex;
            this.next();
        } else {
            console.error(`ジャンプ先のラベル[${target}]が見つかりませんでした。`);
            this.next();
        }
    }
}