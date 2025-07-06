/**
 * [shake] タグの処理
 * 指定されたキャラクターを揺らす
 * @param {Object} params - {name, time, power}
 */
export function handleShake(manager, params) {
    const name = params.name;
    if (!name) { console.warn('[shake] nameは必須です。'); manager.next(); return; }
    
    const chara = manager.scene.characters[name];
    if (!chara) { console.warn(`[shake] キャラクター[${name}]が見つかりません。`); manager.next(); return; }

    const time = Number(params.time) || 500; // 揺れる総時間
    const power = Number(params.power) || 10; // 揺れの強さ（px）
    const duration = 50; // 1回の揺れにかかる時間(ms)
    
    // 元の位置を保存しておく
    const originX = chara.x;

    // ★★★ PhaserのTimeline機能を使って、複数のTweenを連続実行 ★★★
    const timeline = manager.scene.tweens.createTimeline();

    // 総時間(time)が経過するまで、短い揺れを繰り返す
    const repeatCount = Math.floor(time / (duration * 2)); 
    for (let i = 0; i < repeatCount; i++) {
        timeline.add({
            targets: chara,
            x: originX + power, // 右に揺れる
            duration: duration,
            ease: 'Power1',
            yoyo: true, // 元の位置に戻る
        });
        timeline.add({
            targets: chara,
            x: originX - power, // 左に揺れる
            duration: duration,
            ease: 'Power1',
            yoyo: true,
        });
    }

    // ★★★ 最後に元の位置に戻すことを保証する ★★★
    timeline.add({
        targets: chara,
        x: originX,
        duration: duration,
        ease: 'Power1'
    });
    
    // タイムラインを実行
    timeline.play();

    // 揺れが終わるのを待ってから次に進む
    manager.scene.time.delayedCall(time, () => {
        manager.next();
    });
}