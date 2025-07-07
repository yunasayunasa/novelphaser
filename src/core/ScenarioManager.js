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
        this.ifStack = []; 
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

        const { tagName, params } = this.parseTag(trimedLine);
        const handler = this.tagHandlers.get(tagName);

        // --- スキップ判定 ---
        let isSkipping = false;
        if (this.ifStack.length > 0) {
            isSkipping = this.ifStack[this.ifStack.length - 1].skipping;
        }

        // --- ハンドラの実行 ---
        // ifなどの制御タグも、通常のタグも、ここでまとめてハンドラを呼ぶ
        if (trimedLine.startsWith('[')) {
            if (handler) {
                handler(this, params);
            } else if(tagName !== 'p') { // [p]は特別なので、未定義でも警告しない
                console.warn(`未定義のタグです: [${tagName}]`);
            }
        }
        
        // --- 実行 or スキップの判断 ---
        if (isSkipping) {
            // スキップモードなら、何もせず次に進む
            this.next();
            return;
        }

        // --- 通常実行 (スキップモードでない場合) ---
        if (trimedLine.startsWith(';') || trimedLine.startsWith('*')) {
            // コメント/ラベルは無視
        } else if (trimedLine.match(/^([a-zA-Z0-9_]+):/)) {
            // 話者指定行
            const speakerMatch = trimedLine.match(/^([a-zA-Z0-9_]+):/);
            const speakerName = speakerMatch[1];
            const dialogue = trimedLine.substring(speakerName.length + 1).trim();
            this.stateManager.addHistory(speakerName, dialogue);
            this.highlightSpeaker(speakerName);
            const wrappedLine = this.manualWrap(dialogue);
            this.isWaitingClick = true;
            this.messageWindow.setText(wrappedLine, true, () => {
                this.messageWindow.showNextArrow();
            });
            return; // テロップ表示中はここで停止
        } else if (trimedLine === '[p]') {
             // [p]タグ (クリック待ち)
             if (this.scene.pendingChoices.length > 0) {
                this.isWaitingChoice = true;
                this.scene.displayChoiceButtons();
             } else {
                this.isWaitingClick = true;
                this.messageWindow.showNextArrow();
             }
             return; // クリック待ちなのでここで停止
        }
        else if (trimedLine.length > 0 && !trimedLine.startsWith('[')) {
            // 地の文
            this.stateManager.addHistory(null, trimedLine);
            this.highlightSpeaker(null);
            this.isWaitingClick = true; 
            const wrappedLine = this.manualWrap(trimedLine);
            this.messageWindow.setText(wrappedLine, true, () => {
                this.messageWindow.showNextArrow();
            });
            return; // テロップ表示中はここで停止
        }
        
        // ハンドラが実行され、かつクリック待ちやテロップ表示ではない場合
        // (例: [eval], [chara_hide]など)
        this.next();
    }
       embedVariables(line) {
        console.log(`[embedVariables] 開始: line = "${line}"`);
        
        // 正規表現がマッチするかどうかをテスト
        const regex = /&((f|sf)\.[a-zA-Z0-9_.-]+)/g;
        if (!regex.test(line)) {
            // console.log(`[embedVariables] マッチなし。そのまま返します。`);
            return line; // マッチしなかったらログは出さずにすぐ返す
        }
        
        console.log(`[embedVariables] 変数埋め込み候補が見つかりました。`);
        return line.replace(regex, (match, exp) => {
            console.log(`[embedVariables] マッチ部分: match="${match}", exp="${exp}"`);
            const value = this.stateManager.eval(exp);
            console.log(`[embedVariables] stateManager.evalの結果: value =`, value);
            
            if (value === undefined || value === null) {
                const undefinedText = `(undef: ${exp})`;
                console.log(`[embedVariables] 値が未定義のため、"${undefinedText}" に置換します。`);
                return undefinedText; 
            }
            console.log(`[embedVariables] 値 "${value}" に置換します。`);
            return value;
        });
    }
       parseTag(tagString) {
        const content = tagString.substring(1, tagString.length - 1).trim();
        const firstSpaceIndex = content.indexOf(' ');
        
        // タグ名と、それ以降の属性文字列に分割
        const tagName = firstSpaceIndex === -1 ? content : content.substring(0, firstSpaceIndex);
        const attributesString = firstSpaceIndex === -1 ? '' : content.substring(firstSpaceIndex + 1);

        const params = {};
        
        // ★★★ 属性文字列をパースする、より強力な正規表現 ★★★
        const regex = /(\w+)\s*=\s*("[^"]*"|'[^']*'|[^'"\s]+)/g;
        let match;
        while ((match = regex.exec(attributesString)) !== null) {
            const key = match[1];
            let value = match[2];
            
            // 値を囲む引用符があれば削除する
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.substring(1, value.length - 1);
            } else if (value.startsWith("'") && value.endsWith("'")) {
                value = value.substring(1, value.length - 1);
            }
            params[key] = value;
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