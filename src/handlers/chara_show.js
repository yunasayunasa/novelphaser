// src/handlers/chara_show.js

/**
 * [chara_show] タグの処理
 * キャラクターを表示し、time属性があればフェードインさせる
 * @param {ScenarioManager} manager - シナリオマネージャーのインスタンス
 * @param {Object} params - タグのパラメータ {storage, x, y, time}
 */
export function handleCharaShow(manager, params) {
    const storage = params.storage;
    if (!storage) {
        console.warn('[chara_show] storage属性は必須です。');
        manager.next();
        return;
    }

    // ★★★ キャラクター定義を取得 ★★★
    const def = manager.characterDefs[name];
    if (!def) {
        console.warn(`キャラクター[${name}]の定義が見つかりません。chara_define.ksを確認してください。`);
        manager.next();
        return;
    }
    
    // ★★★ storageが指定されていなければ、定義情報を使う ★★★
    // これにより、表情差分なども [chara_show name="yuna" storage="yuna_angry.png"] のように上書きできる
    const storage = params.storage || def.storage;


    const x = Number(params.x) || manager.scene.scale.width / 2;
    const y = Number(params.y) || manager.scene.scale.height / 2;
    const time = Number(params.time) || 0; // フェードインの時間（ミリ秒）

    // まずは透明な状態でキャラクターを配置
    const chara = manager.scene.add.image(x, y, storage);
    chara.setAlpha(0); // 透明度を0（完全に見えない）に設定
    manager.layers.character.add(chara);

    // timeが0より大きい場合、フェードインのTweenを実行
    if (time > 0) {
        manager.scene.tweens.add({
            targets: chara,      // 対象オブジェクト
            alpha: 1,            // 目標の透明度 (1 = 完全に見える)
            duration: time,      // アニメーション時間
            ease: 'Linear',      // イージング（変化の仕方）、今回は一定速度
            
            // ★★★ アニメーション完了時に呼ばれるコールバック ★★★
            onComplete: () => {
                console.log('フェードイン完了');
                // アニメーションが終わったら、次のシナリオ行へ進む
                manager.next();
            }
        });
    } else {
        // timeが指定されていない、または0の場合は、すぐに表示して次に進む
        chara.setAlpha(1);
        manager.next();
    }
}