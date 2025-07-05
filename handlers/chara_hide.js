/**
 * [chara_hide] タグの処理
 * 指定された名前のキャラクターを非表示にする
 * @param {ScenarioManager} manager - シナリオマネージャーのインスタンス
 * @param {Object} params - {name, time}
 */
export function handleCharaHide(manager, params) {
    const name = params.name;
    if (!name) {
        console.warn('[chara_hide] name属性は必須です。');
        manager.next();
        return;
    }

    // GameSceneに登録されているキャラクターオブジェクトを取得
    const chara = manager.scene.characters[name];
    if (!chara) {
        console.warn(`[chara_hide] 非表示にしようとしたキャラクター[${name}]が見つかりません。`);
        manager.next();
        return;
    }

    const time = Number(params.time) || 0;

    if (time > 0) {
        // フェードアウトのTween（透明度を0にする）
        manager.scene.tweens.add({
            targets: chara,
            alpha: 0,
            duration: time,
            ease: 'Linear',
            onComplete: () => {
                // アニメーション完了後、オブジェクトを破棄してリストからも削除
                chara.destroy();
                delete manager.scene.characters[name];
                manager.next(); // 次のシナリオへ
            }
        });
    } else {
        // 即座に非表示にして、リストから削除
        chara.destroy();
        delete manager.scene.characters[name];
        manager.next(); // 次のシナリオへ
    }
}