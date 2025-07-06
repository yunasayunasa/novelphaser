export function handlePageBreak(manager, params) {
    // もし選択肢が表示されている最中なら、それを消去する
    if (manager.isWaitingChoice) {
        manager.scene.clearChoiceButtons();
    }
    
    manager.isWaitingClick = true;
    manager.messageWindow.showNextArrow();
}