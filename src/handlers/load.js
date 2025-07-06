// rebuildScene関数は、GameScene.jsに移動させるので、このファイルからは削除

export function handleLoad(manager, params) {
    const slot = params.slot;
    if (!slot) { console.warn('[load] slot属性は必須です。'); manager.next(); return; }

    // ★★★ GameSceneのグローバルなロード機能を呼び出す ★★★
    manager.scene.performLoad(slot);

    // ★★★ 重要: ここではもうnext()を呼ばない ★★★
    // performLoadがシナリオの実行フローを乗っ取るため
}