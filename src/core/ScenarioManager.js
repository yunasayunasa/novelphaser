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
        // --- 1. 変数埋め込み ---
        const processedLine = this.embedVariables(line);
        const trimedLine = processedLine.trim();

        // --- 2. タグ名とパラメータを先に解析 ---
        const { tagName, params } = this.parseTag(trimedLine);
        const handler = this.tagHandlers.get(tagName);

        // --- 3. 現在のスキップ状態を確認 ---
        let isSkipping = false;
        if (this.ifStack.length > 0) {
            isSkipping = this.ifStack[this.ifStack.length - 1].skipping;
        }

        // --- 4. 実行 or スキップの判断 ---
        // 制御タグ([if]など)か、またはスキップモードでない場合にのみ、中身の処理を行う
        if (handler && ['if', 'elsif', 'else', 'endif'].includes(tagName)) {
            // ★ 分岐制御タグは、常にハンドラが呼ばれる
            handler(this, params);
        } else if (!isSkipping) {
            // ★ スキップモードでないなら、通常の処理を実行
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
                return; // テロップ表示を開始したら、next()は呼ばない
            } else if (trimedLine.startsWith('[')) {
                // 通常のタグ行
                if (handler) {
                    handler(this, params);
                } else {
                    console.warn(`未定義のタグです: [${tagName}]`);
                    this.next();
                }
                return; // ハンドラがnext()を呼ぶので、ここでは呼ばない
            } else if (trimedLine.length > 0) {
                // 地の文
                this.stateManager.addHistory(null, trimedLine);
                this.highlightSpeaker(null);
                this.isWaitingClick = true; 
                const wrappedLine = this.manualWrap(trimedLine);
                this.messageWindow.setText(wrappedLine, true, () => {
                    this.messageWindow.showNextArrow();
                });
                return; // テロップ表示を開始したら、next()は呼ばない
            }
        }
        
        // --- 5. 上記の処理が終わったら、次の行へ ---
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