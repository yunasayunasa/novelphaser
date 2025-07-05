/**
 * [wait] タグの処理
 * 指定された時間、シナリオの進行を待つ
 * @param {Object} params - {time}
 */
export function handleWait(manager, params) {
    const time = Number(params.time) || 0;
    if (time > 0) {
        manager.scene.time.delayedCall(time, () => {
            manager.next();
        });
    } else {
        manager.next();
    }
}