export function handleStopBgm(manager, params) {
    const time = Number(params.time) || 0; // フェードアウト時間
    manager.soundManager.stopBgm(time);
    manager.next();
}