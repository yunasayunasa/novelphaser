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
        // rebuildSceneを呼び出す
        rebuildScene(manager, loadedState);
        
        // ★★★ ここからが重要 ★★★
        console.log("rebuildScene完了。シナリオ再開処理に入ります。");
        console.log(`再開前の行番号: manager.currentLine = ${manager.currentLine}`);
        console.log(`シナリオ配列の長さ: manager.scenario.length = ${manager.scenario.length}`);

        // 行番号が配列の範囲内かチェック
        if (manager.currentLine >= manager.scenario.length) {
            throw new Error(`復元しようとした行番号(${manager.currentLine})がシナリオの範囲外です。`);
        }

        console.log("シナリオから行テキストを取得します...");
        const line = manager.scenario[manager.currentLine];
        console.log(`取得した行: "${line}"`);
        
        manager.currentLine++;
        
        console.log("parseを実行します...");
        manager.parse(line);
        console.log("parseを実行しました。");

    } catch (e) {
        console.error("ロード処理全体でエラーが発生しました。", e);
        manager.next(); // エラー時はとりあえず次に進む
    }
}

function rebuildScene(manager, state) {
    console.log("--- rebuildScene 開始 ---");
    const scene = manager.scene;

    console.log("1. レイヤーをクリアします...");
    manager.layers.background.removeAll(true);
    manager.layers.character.removeAll(true);
    scene.characters = {};
    manager.soundManager.stopBgm();
    console.log("...レイヤークリア完了");

    console.log("2. シナリオ情報を復元します...");
    manager.currentFile = state.scenario.fileName;
    manager.currentLine = state.scenario.line;
    console.log(`...シナリオ情報: file=${manager.currentFile}, line=${manager.currentLine}`);
    
    console.log("3. シナリオキャッシュを確認します...");
    if (!scene.cache.text.has(manager.currentFile)) {
        throw new Error(`シナリオファイル[${manager.currentFile}]がキャッシュにありません。`);
    }
    const rawText = scene.cache.text.get(manager.currentFile);
    manager.scenario = rawText.split(/\r\n|\n|\r/).filter(line => line.trim() !== '');
    console.log("...シナリオキャッシュOK、再構築完了");

    console.log("4. 背景を復元します...");
    if (state.layers.background) {
        if (!scene.textures.exists(state.layers.background)) {
            throw new Error(`背景テクスチャ[${state.layers.background}]がキャッシュにありません。`);
        }
        const bg = scene.add.image(scene.scale.width / 2, scene.scale.height / 2, state.layers.background);
        bg.setDisplaySize(scene.scale.width, scene.scale.height);
        manager.layers.background.add(bg);
    }
    console.log("...背景復元完了");
    
    console.log("5. キャラクターを復元します...");
    for (const name in state.layers.characters) {
        const charaData = state.layers.characters[name];
        console.log(`...キャラクター[${name}]を復元中...`);
        if (!scene.textures.exists(charaData.storage)) {
            throw new Error(`キャラクターテクスチャ[${charaData.storage}]がキャッシュにありません。`);
        }
        const chara = scene.add.image(charaData.x, charaData.y, charaData.storage);
        manager.layers.character.add(chara);
        scene.characters[name] = chara;
    }
    console.log("...キャラクター復元完了");

    console.log("6. BGMを復元します...");
    if (state.sound.bgm) {
        // BGMのキャッシュ確認はPhaser内部でやってくれるので不要
        manager.soundManager.playBgm(state.sound.bgm);
    }
    console.log("...BGM復元完了");
    
    manager.messageWindow.setText('');
    console.log("--- rebuildScene 正常終了 ---");
}