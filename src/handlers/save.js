/**
 * [save] タグの処理
 * 現在のゲーム状態を指定されたスロットに保存する
 * @param {Object} params - {slot}
 */
export function handleSave(manager, params) {
    const slot = params.slot;
    if (!slot) {
        console.warn('[save] slot属性は必須です。');
        manager.next();
        return;
    }

    // 1. 現在のゲーム状態を取得
    const gameState = manager.stateManager.getState();
    
    // 2. セーブ日時を追加
    gameState.saveDate = new Date().toLocaleString();

    try {
        // 3. 状態オブジェクトをJSON文字列に変換
        const jsonString = JSON.stringify(gameState);
        
        // 4. ローカルストレージに保存 (キーは "save_data_1" のようになる)
        localStorage.setItem(`save_data_${slot}`, jsonString);
        
        console.log(`スロット[${slot}]にセーブしました。`, gameState);

    } catch (e) {
        console.error(`セーブに失敗しました: スロット[${slot}]`, e);
    }
    
    manager.next();
}