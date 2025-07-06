export default class StateManager {
    constructor() {
        // ゲームの状態を保持するプロパティ
        this.state = {
            scenario: {
                fileName: null, // 現在のシナリオファイル名
                line: 0         // 現在の行番号
            },
            layers: {
                background: null, // 表示中の背景画像のキー
                characters: {}    // 表示中のキャラクター情報 { name: { storage, x, y, ... } }
            },
            sound: {
                bgm: null // 再生中のBGMのキー
            },
            variables: {} // ゲーム内変数 (f, sf) は後で実装
        };
    }

    /**
     * 現在のゲーム状態をJSONとして取得する
     * @returns {Object} ゲーム状態のオブジェクト
     */
    getState() {
        // stateオブジェクトの深いコピーを返すことで、外部から直接変更されるのを防ぐ
        return JSON.parse(JSON.stringify(this.state));
    }

    /**
     * 新しい状態でゲーム状態を上書きする (ロード時に使用)
     * @param {Object} newState - ロードする新しい状態オブジェクト
     */
    setState(newState) {
        this.state = newState;
    }
    
    // 以下、各状態を更新するためのメソッド群

    updateScenario(fileName, line) {
        this.state.scenario.fileName = fileName;
        this.state.scenario.line = line;
        console.log('State Updated (Scenario):', this.state.scenario);
    }
    
    updateBg(storage) {
        this.state.layers.background = storage;
        console.log('State Updated (Background):', this.state.layers.background);
    }

    updateChara(name, charaData) {
        if (charaData) {
            this.state.layers.characters[name] = charaData;
        } else {
            // charaDataがnullなら、キャラクターを削除
            delete this.state.layers.characters[name];
        }
        console.log('State Updated (Characters):', this.state.layers.characters);
    }

    updateBgm(key) {
        this.state.sound.bgm = key;
        console.log('State Updated (BGM):', this.state.sound.bgm);
    }
}
