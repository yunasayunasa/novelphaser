/**
 * [cm] タグの処理
 * メッセージウィンドウのテキストをクリアする
 */
export function handleClearMessage(manager, params) {
    manager.messageWindow.setText('', false); // テロップを使わずに即時クリア
    manager.messageWindow.hideNextArrow(); // クリック待ち矢印も消す
    
    // 状態としてはクリック待ちではないので、フラグも更新しておく
    manager.isWaitingClick = false;

    // このタグは一瞬で終わる処理なので、すぐに次の行へ
    manager.next();
}