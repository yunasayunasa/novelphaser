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

    // StateManagerから、next()で更新された最新の状態を取得する
    const gameState = manager.stateManager.getState();
    gameState.saveDate = new Date().toLocaleString();

    try {
        localStorage.setItem(`save_data_${slot}`, JSON.stringify(gameState));
        console.log(`スロット[${slot}]にセーブしました。`, gameState);
    } catch (e) {
    }
    manager.next();
}