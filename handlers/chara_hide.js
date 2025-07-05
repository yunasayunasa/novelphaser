/**
 * [chara_hide] タグの処理
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

    const chara = manager.scene.characters[name];
    if (!chara) {
        console.warn(`[chara_hide] 非表示にしようとしたキャラクター[${name}]が見つかりません。`);
        manager.next();
        return;
    }

    const time = Number(params.time) || 0;

    if (time > 0) {
        manager.scene.tweens.add({
            targets: chara,
            alpha: 0,
            duration: time,
            ease: 'Linear',
            onComplete: () => {
                chara.destroy();
                delete manager.scene.characters[name];
                manager.next();
            }
        });
    } else {
        chara.destroy();
        delete manager.scene.characters[name];
        manager.next();
    }
}