export default class StateManager {
    constructor() {
        this.state = {
            scenario: { fileName: null, line: 0 },
            layers: { background: null, characters: {} },
            sound: { bgm: null },
            variables: {},
            history: [] // ★★★ 履歴を保存する配列を追加 ★★★
        };
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