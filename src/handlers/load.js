/**
 * [load] タグの処理
 * 指定されたスロットからゲーム状態を復元する
 * @param {Object} params - {slot}
 */
export async function handleLoad(manager, params) {
    const slot = params.slot;
    if (!slot) { console.warn('[load] slot属性は必須です。'); manager.next(); return; }

    try {
        // 1. ローカルストレージからJSON文字列を取得
        const jsonString = localStorage.getItem(`save_data_${slot}`);
        if (!jsonString) { console.warn(`スロット[${slot}]にセーブデータがありません。`); manager.next(); return; }

        // 2. JSON文字列をオブジェクトに変換
        const loadedState = JSON.parse(jsonString);
        
        // 3. StateManagerの状態を上書き
        manager.stateManager.setState(loadedState);
        console.log(`スロット[${slot}]からロードしました。`, loadedState);
        
         // ★★★ 4. 画面を再構築 ★★★
    await rebuildScene(manager, loadedState);
        
    // 5. ロードしたシナリオの行から「再開」する
    // ★★★ next()を呼ぶのではなく、直接parse()を呼ぶ ★★★
    const line = manager.scenario[manager.currentLine];
    manager.currentLine++; // 次の行に進む準備をしておく
    manager.parse(line); // 保存されていた行を直接実行する
}

     catch (e) {
        console.error(`ロードに失敗しました: スロット[${slot}]`, e);
        manager.next();
    }
}

/**
 * ロードした状態に基づいて、シーンの表示を再構築するヘルパー関数
 * @param {ScenarioManager} manager
 * @param {Object} state - ロードした状態オブジェクト
 */
async function rebuildScene(manager, state) {
    const scene = manager.scene;
    
    // --- 事前準備 ---
    // 現在表示されているものをすべてクリア
    manager.layers.background.removeAll(true);
    manager.layers.character.removeAll(true);
    scene.characters = {}; // 管理リストもリセット
    manager.soundManager.stopBgm(); // BGMも停止

    // --- シナリオの再読み込み ---
    // もしロードしたシナリオが現在と違う場合、読み込み直す必要がある
    // (今回は同じファイルなので、loadは呼ばずに行番号だけ設定)
    manager.currentFile = state.scenario.fileName;
    manager.currentLine = state.scenario.line;
    manager.scenario = scene.cache.text.get(manager.currentFile).split(/\r\n|\n|\r/).filter(line => line.trim() !== '');

    // --- 背景の再構築 ---
    if (state.layers.background) {
        const bg = scene.add.image(scene.scale.width / 2, scene.scale.height / 2, state.layers.background);
        bg.setDisplaySize(scene.scale.width, scene.scale.height);
        manager.layers.background.add(bg);
    }
    
    // --- キャラクターの再構築 ---
    for (const name in state.layers.characters) {
        const charaData = state.layers.characters[name];
        const chara = scene.add.image(charaData.x, charaData.y, charaData.storage);
        manager.layers.character.add(chara);
        scene.characters[name] = chara; // 管理リストにも再登録
    }

    // --- BGMの再構築 ---
    if (state.sound.bgm) {
        manager.soundManager.playBgm(state.sound.bgm);
    }
    
    // 話者ハイライトの状態も復元
    // (次のnext()で実行されるセリフ行で自動的に復元されるので、ここでは不要)
    
    // メッセージウィンドウのテキストはクリアしておく
    manager.messageWindow.setText('');
}