// ★★★ ファイルの先頭でLayoutをインポート ★★★
import { Layout } from '../core/Layout.js';

/**
 * [chara_show] タグの処理
 * @param {Object} params - {name, storage, pos, x, y, time}
 */
export function handleCharaShow(manager, params) {
    const name = params.name;
    // ... (name, def, storage の取得処理は変更なし) ...

    // ★★★ 座標決定ロジック ★★★
    let x, y;
    const pos = params.pos; // 'left', 'center', 'right'

    // 現在の画面の向きを取得
    const orientation = manager.scene.scale.isPortrait ? 'portrait' : 'landscape';

    if (pos && Layout[orientation].character[pos]) {
        // pos属性が有効な値なら、レイアウト定義から座標を取得
        x = Layout[orientation].character[pos].x;
        y = Layout[orientation].character[pos].y;
    } else {
        // pos属性がない、または無効な場合は、x,y属性を見る
        // x,yもなければ、中央をデフォルトにする
        x = Number(params.x) || Layout[orientation].character.center.x;
        y = Number(params.y) || Layout[orientation].character.center.y;
    }
    
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