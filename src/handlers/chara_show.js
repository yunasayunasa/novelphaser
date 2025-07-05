/**
 * [chara_show] タグの処理
 * @param {Object} params - {name, storage, x, y, time}
 */
export function handleCharaShow(manager, params) {
    const name = params.name;
    if (!name) {
        console.warn('[chara_show] name属性は必須です。');
        manager.next();
        return;
    }

    const def = manager.characterDefs[name];
    if (!def) {
        console.warn(`キャラクター[${name}]の定義が見つかりません。chara_define.ksを確認してください。`);
        manager.next();
        return;
    }

    // storageが指定されていなければ定義情報を使い、指定されていればそれを優先する
    const storage = params.storage || def.storage;

    // ----- ここにあった古い `const storage = params.storage;` は削除する -----

    // もし同じ名前のキャラクターが既にいたら、先に消しておく
    if (manager.scene.characters[name]) {
        manager.scene.characters[name].destroy();
    }
    
    const x = Number(params.x) || manager.scene.scale.width / 2;
    const y = Number(params.y) || manager.scene.scale.height / 2;
    const time = Number(params.time) || 0;

    const chara = manager.scene.add.image(x, y, storage);
    chara.setAlpha(0);
    manager.layers.character.add(chara);
    
    manager.scene.characters[name] = chara;

    if (time > 0) {
        manager.scene.tweens.add({
            targets: chara,
            alpha: 1,
            duration: time,
            ease: 'Linear',
            onComplete: () => manager.next()
        });
    } else {
        chara.setAlpha(1);
        manager.next();
    }
}