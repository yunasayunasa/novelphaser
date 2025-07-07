export default class StateManager {
    constructor() {
        this.state = {
            scenario: { fileName: null, line: 0 },
            layers: { background: null, characters: {} },
            sound: { bgm: null },
            variables: {},
            history: [], // ★★★ 履歴を保存する配列を追加 ★★★
            variables: {} // ★ f.変数用の領域
        };
        this.systemVariables = this.loadSystemVariables(); 
    }

    // ★★★ 変数を操作するメソッドを追加 ★★★
    /**
     * 文字列のJavaScript式を安全に評価・実行する
     * @param {string} exp - 実行する式 (例: "f.hoge = 10")
     */
                eval(exp) {
        const f = this.state.variables;
        const sf = this.systemVariables;

        try {
            // ★★★ 式に '=' が含まれるか（代入式か）どうかで処理を分ける ★★★
            let result;
            if (exp.includes('=')) {
                //【代入式の場合】値を設定するのが目的なので、戻り値は気にしない
                const execFunc = new Function('f', 'sf', `'use strict'; ${exp}`);
                execFunc(f, sf);
                // 代入後の値を取得するために、もう一度評価する
                // 例: "f.hoge = 10" -> "f.hoge" に変換
                const varName = exp.split('=')[0].trim();
                const valueFunc = new Function('f', 'sf', `'use strict'; return ${varName}`);
                result = valueFunc(f, sf);

            } else {
                //【値の取得の場合】単純に評価して結果を返す
                const evalFunc = new Function('f', 'sf', `'use strict'; return ${exp}`);
                result = evalFunc(f, sf);
            }

            this.saveSystemVariables();
            return result;

        } catch (e) {
            console.error(`[eval] 式の評価中にエラーが発生しました: "${exp}"`, e);
            return undefined;
        }
    }

    // ★★★ sf変数のセーブ/ロード機能 ★★★
    saveSystemVariables() {
        try {
            localStorage.setItem('my_novel_engine_system', JSON.stringify(this.systemVariables));
        } catch (e) {
            console.error("システム変数の保存に失敗しました。", e);
        }
    }
    loadSystemVariables() {
        try {
            const data = localStorage.getItem('my_novel_engine_system');
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error("システム変数の読み込みに失敗しました。", e);
            return {};
        }
    }

      /**
     * 読んだテキストの履歴を追加する
     * @param {string} speaker - 話者名 (地の文の場合はnull)
     * @param {string} dialogue - セリフ内容
     */
    addHistory(speaker, dialogue) {
        this.state.history.push({ speaker, dialogue });
        
        // 履歴が長くなりすぎないように、古いものから削除する (例: 100件まで)
        if (this.state.history.length > 100) {
            this.state.history.shift();
        }
        console.log('History Updated:', this.state.history);
    }

    getState() { return JSON.parse(JSON.stringify(this.state)); }
    setState(newState) { this.state = newState; }
    updateScenario(fileName, line) { this.state.scenario.fileName = fileName; this.state.scenario.line = line; console.log('State Updated (Scenario):', this.state.scenario); }
    updateBg(storage) { this.state.layers.background = storage; console.log('State Updated (Background):', this.state.layers.background); }
    updateChara(name, charaData) { if (charaData) { this.state.layers.characters[name] = charaData; } else { delete this.state.layers.characters[name]; } console.log('State Updated (Characters):', this.state.layers.characters); }
    updateBgm(key) { this.state.sound.bgm = key; console.log('State Updated (BGM):', this.state.sound.bgm); }
}
