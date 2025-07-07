export default class StateManager {
    constructor() {
        this.state = {
            scenario: { fileName: null, line: 0 },
            layers: { background: null, characters: {} },
            sound: { bgm: null },
            variables: {},
            history: [], // ★★★ 履歴を保存する配列を追加 ★★★
           
        };
        this.systemVariables = this.loadSystemVariables(); 
    }

    // ★★★ 変数を操作するメソッドを追加 ★★★
    /**
     * 文字列のJavaScript式を安全に評価・実行する
     * @param {string} exp - 実行する式 (例: "f.hoge = 10")
     */
          eval(exp) {
        console.log(`[StateManager.eval] 開始: exp = "${exp}"`);
        const f = this.state.variables;
        const sf = this.systemVariables;

        try {
            console.log(`[StateManager.eval] tryブロックに入りました。`);
            let result;

            if (exp.includes('=')) {
                console.log(`[StateManager.eval] 代入式と判断しました。`);
                const execFunc = new Function('f', 'sf', `'use strict'; ${exp}`);
                console.log(`[StateManager.eval] 代入用の関数を作成しました。`);
                execFunc(f, sf);
                console.log(`[StateManager.eval] 代入用の関数を実行しました。 f:`, f);

                const varName = exp.split('=')[0].trim();
                const valueFunc = new Function('f', 'sf', `'use strict'; return ${varName}`);
                result = valueFunc(f, sf);
                console.log(`[StateManager.eval] 値の再取得結果:`, result);

            } else {
                console.log(`[StateManager.eval] 値取得の式と判断しました。`);
                const evalFunc = new Function('f', 'sf', `'use strict'; return ${exp}`);
                console.log(`[StateManager.eval] 評価用の関数を作成しました。`);
                result = evalFunc(f, sf);
                console.log(`[StateManager.eval] 評価結果:`, result);
            }

            this.saveSystemVariables();
            console.log(`[StateManager.eval] 正常終了。戻り値:`, result);
            return result;

        } catch (e) {
            // ★★★ 絶対にエラーをコンソールに出す ★★★
            console.error(`[StateManager.eval] CRITICAL ERROR: 式の評価中に致命的なエラーが発生しました: "${exp}"`, e);
            alert("evalでエラーが発生しました！コンソールを確認してください。"); // 強制的にアラートを出す
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
