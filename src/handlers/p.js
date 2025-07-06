export function handlePageBreak(manager, params) {
    // ★★★ もし溜まっている選択肢があれば、それを表示する ★★★
    if (manager.scene.pendingChoices.length > 0) {
        manager.isWaitingChoice = true; // 選択肢待ち状態にする
        manager.scene.displayChoiceButtons();
        // ここでreturn。クリック待ち矢印は出さない
        return;
    }
    
    // 選択肢がなければ、通常のクリック待ち処理
    manager.isWaitingClick = true;
    manager.messageWindow.showNextArrow();
}