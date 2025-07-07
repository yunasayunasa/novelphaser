export function handleElsif(manager, params) {
    const ifState = manager.ifStack[manager.ifStack.length - 1];
    if (!ifState) { console.error("[elsif] 対応する[if]がありません。"); manager.next(); return; }

    // すでに前のif/elsifで条件が満たされている場合は、無条件でスキップを続ける
    if (ifState.conditionMet) {
        ifState.skipping = true;
        manager.next();
        return;
    }

    const exp = params.exp;
    const result = manager.stateManager.eval(exp);

    if (result) {
        ifState.conditionMet = true; // 条件が満たされたことを記録
        ifState.skipping = false;    // スキップを解除
    } else {
        ifState.skipping = true;     // スキップを継続
    }

    manager.next();
}