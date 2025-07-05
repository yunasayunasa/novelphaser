/**
 * [p] タグの処理 (クリック待ち)
 * @param {ScenarioManager} manager - シナリオマネージャーのインスタンス
 * @param {Object} params - タグのパラメータ (このタグでは使わない)
 */
export function handlePageBreak(manager, params) {
    manager.isWaitingClick = true;
    // このタグは次の行に進まない
}