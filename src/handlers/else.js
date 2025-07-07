export function handleElse(manager, params) {
    const ifState = manager.ifStack[manager.ifStack.length - 1];
    if (!ifState) { console.error("[else] 対応する[if]がありません。"); manager.next(); return; }

    // すでに条件が満たされていればスキップ、そうでなければ実行
    ifState.skipping = ifState.conditionMet;
    ifState.conditionMet = true; // elseブロックが実行されるので、条件は満たされた扱い

    manager.next();
}