/**
 * [chara_show] タグの処理
 * @param {ScenarioManager} manager - シナリオマネージャーのインスタンス
 * @param {Object} params - タグのパラメータ
 */
export function handleCharaShow(manager, params) {
    const storage = params.storage;
    // パラメータが指定されていない場合のデフォルト値を設定
    const x = Number(params.x) || manager.scene.scale.width / 2;
    const y = Number(params.y) || manager.scene.scale.height / 2;

    if (storage) {
        const chara = manager.scene.add.image(x, y, storage);
        manager.layers.character.add(chara);
    }
    
    // このタグは待たずに次の行へ進む
    manager.next();
}