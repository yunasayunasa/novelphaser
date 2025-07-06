/**
 * [load] タグの処理
 * 指定されたスロットからゲーム状態を復元する
 * @param {Object} params - {slot}
 */
export async function handleLoad(manager, params) {
    const slot = params.slot;
    if (!slot) { console.warn('[load] slot属性は必須です。'); manager.next(); return; }

  
    try {
        const jsonString = localStorage.getItem(`save_data_${slot}`);
        if (!jsonString) { /* ... */ return; }
        const loadedState = JSON.parse(jsonString);
        manager.stateManager.setState(loadedState);
        console.log(`スロット[${slot}]からロードしました。`, loadedState);
        
        // ★★★ rebuildSceneをtry...catchで囲む ★★★
          try {
            rebuildScene(manager, loadedState);
            const line = manager.scenario[manager.currentLine];
            manager.currentLine++;
            manager.parse(line);
        } catch (rebuildError) {
            // ★★★ ここを改造 ★★★
            console.error("シーンの再構築に失敗しました。", rebuildError); // 第2引数にエラーオブジェクトそのものを渡す
        

            manager.next(); // とりあえず次に進む
        }
    } catch (e) {
        console.error(`ロードに失敗しました: スロット[${slot}]`, e);
        manager.next();
    }
}

function rebuildScene(manager, state) {
    const scene = manager.scene;
    
    // 現在の表示をクリア
    manager.layers.background.removeAll(true);
    manager.layers.character.removeAll(true);
    scene.characters = {};
    manager.soundManager.stopBgm();

    // シナリオを復元
    manager.currentFile = state.scenario.fileName;
    manager.currentLine = state.scenario.line;
    // ★★★ キャッシュに存在するか確認 ★★★
    if (!scene.cache.text.has(manager.currentFile)) {
        throw new Error(`シナリオファイル[${manager.currentFile}]がキャッシュにありません。`);
    }
    const rawText = scene.cache.text.get(manager.currentFile);
    manager.scenario = rawText.split(/\r\n|\n|\r/).filter(line => line.trim() !== '');

    // 背景を復元
    if (state.layers.background) {
        if (!scene.textures.exists(state.layers.background)) {
            throw new Error(`背景テクスチャ[${state.layers.background}]がキャッシュにありません。`);
        }
        const bg = scene.add.image(scene.scale.width / 2, scene.scale.height / 2, state.layers.background);
        bg.setDisplaySize(scene.scale.width, scene.scale.height);
        manager.layers.background.add(bg);
    }
    
    // キャラクターを復元
    for (const name in state.layers.characters) {
        const charaData = state.layers.characters[name];
        if (!scene.textures.exists(charaData.storage)) {
            throw new Error(`キャラクターテクスチャ[${charaData.storage}]がキャッシュにありません。`);
        }
        const chara = scene.add.image(charaData.x, charaData.y, charaData.storage);
        manager.layers.character.add(chara);
        scene.characters[name] = chara;
    }

    // BGMを復元
    if (state.sound.bgm) {
        manager.soundManager.playBgm(state.sound.bgm);
    }
    
    manager.messageWindow.setText('');
}