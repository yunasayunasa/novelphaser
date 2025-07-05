import { Layout } from '../core/Layout.js';

/**
 * [chara_show] タグの処理
 * @param {Object} params - {name, storage, pos, x, y, time}
 */
export function handleCharaShow(manager, params) {
    // --- 1. 必要なパラメータを取得 ---
    const name = params.name;
    if (!name) {
        console.warn('[chara_show] name属性は必須です。');
        manager.next();
        return;
    }

    const def = manager.characterDefs[name];
    if (!def) {
        console.warn(`キャラクター[${name}]の定義が見つかりません。`);
        manager.next();
        return;
    }
    
    // ★★★ storageの定義をここで行う ★★★
    // 表情差分などでstorageが指定されていればそれを使い、なければ定義情報を使う
    const storage = params.storage || def.storage;
    if (!storage) {
        console.warn(`キャラクター[${name}]のstorageが見つかりません。`);
        manager.next();
        return;
    }

    // --- 2. 座標を決定 ---
    let x, y;
    const pos = params.pos; // 'left', 'center', 'right'
    const orientation = manager.scene.scale.isPortrait ? 'portrait' : 'landscape';

    if (pos && Layout[orientation].character[pos]) {
        x = Layout[orientation].character[pos].x;
        y = Layout[orientation].character[pos].y;
    } else {
        x = Number(params.x) || Layout[orientation].character.center.x;
        y = Number(params.y) || Layout[orientation].character.center.y;
    }
    
    // --- 3. 表示処理 ---
    const time = Number(params.time) || 0;

    // もし同じ名前のキャラクターが既にいたら、先に消しておく
    if (manager.scene.characters[name]) {
        manager.scene.characters[name].destroy();
    }

    const chara = manager.scene.add.image(x, y, storage);
    chara.setAlpha(0);
    manager.layers.character.add(chara);
    manager.scene.characters[name] = chara;

    // --- 4. アニメーション ---
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