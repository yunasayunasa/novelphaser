/**
 * [chara_new] タグの処理
 * キャラクターの基本情報をエンジンに登録する
 * @param {Object} params - {name, storage, jname, ...}
 */
export function handleCharaNew(manager, params) {
    const name = params.name;
    if (!name) {
        console.warn('[chara_new] name属性は必須です。');
        return; // next()は呼ばず、定義ファイルの解析を続ける
    }

    // キャラクター定義オブジェクトに、パラメータをそのまま保存
    manager.characterDefs[name] = params;
    console.log(`キャラクター[${name}]を定義しました:`, params);
}