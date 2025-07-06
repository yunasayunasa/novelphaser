/**
 * [flip] タグの処理
 * 指定されたキャラクターをペーパーマリオ風に反転させる
 * @param {Object} params - {name, time}
 */
export function handleFlip(manager, params) {
    const name = params.name;
    if (!name) { console.warn('[flip] nameは必須です。'); manager.next(); return; }

    const chara = manager.scene.characters[name];
    if (!chara) { console.warn(`[flip] キャラクター[${name}]が見つかりません。`); manager.next(); return; }

    const time = Number(params.time) || 500; // 反転にかかる総時間
    const halfTime = time / 2; // 半分の時間

    // ★★★ PhaserのTimeline機能を使用 ★★★
    const timeline = manager.scene.tweens.timeline({
        // タイムライン全体の完了時に呼ばれる
        onComplete: () => {
            // アニメーション完了後に状態を更新する必要があればここで行う
            // (今回は見た目が変わるだけなので、状態更新は不要)
            manager.next();
        }
    });

    // --- 1. 半分の時間かけて、画像を横に潰す ---
    timeline.add({
        targets: chara,
        scaleX: 0, // Xスケールを0に
        duration: halfTime,
        ease: 'Linear'
    });
    
    // --- 2. 潰れた瞬間に、画像を左右反転させる ---
    timeline.add({
        targets: chara,
        // 何かダミーのプロパティを0時間で動かすことで、コールバックを挟むテクニック
        alpha: chara.alpha, 
        duration: 0, 
        onComplete: () => {
            chara.toggleFlipX(); // 現在の反転状態を切り替える
        }
    });

    // --- 3. 残り半分の時間かけて、画像を元の幅に戻す ---
    timeline.add({
        targets: chara,
        scaleX: 1, // Xスケールを1に
        duration: halfTime,
        ease: 'Linear'
    });
    
    // ★★★ タイムラインを実行 ★★★
    timeline.play();
}