/**
 * [link] タグの処理
 * 選択肢ボタンを生成する
 * @param {Object} params - {target}
 */
export function handleLink(manager, params) {
    const target = params.target;
    if (!target) { console.warn('[link] target属性は必須です。'); return; }

    // ★★★ [link]...[/link] の間のテキストを取得する処理が必要 ★★★
    // これは parseTag を改造する必要があり、少し複雑
    // 今回は、仮で `text` 属性で指定できるようにする
    const text = params.text;
    if (!text) { console.warn('[link] text属性は必須です。'); return; }

    // GameSceneにボタン生成を依頼
    manager.scene.addChoiceButton(text, target);

    // ★★★ 選択肢表示中はシナリオを進めない ★★★
    manager.isWaitingChoice = true; 
    // next()は呼ばない！
}