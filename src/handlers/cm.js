/**
 * [cm] タグの処理
 * メッセージウィンドウのテキストをクリアし、クリックを待つ
 */
export function handleClearMessage(manager, params) {
    // 1. メッセージウィンドウ関連の処理
    manager.messageWindow.setText('', false); // テキストを即時クリア
    manager.messageWindow.hideNextArrow();    // 念のため矢印も消す
    
    // 2. 状態を「クリック待ち」に設定する
    // これにより、テロップ表示中でもなく、通常のクリック待ちでもない、
    // 新しい「cm待ち」状態になる。
    manager.isWaitingClick = true;
    
    // ★★★ next() は呼ばない！ ★★★
    // 次のクリックがonClick()をトリガーするのを待つ。
}