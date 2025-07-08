import { Layout } from '../core/Layout.js';

export default class ResponsiveScene extends Phaser.Scene {
    
    // 画面リサイズ時に呼ばれる共通処理
    onResize() {
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;
        const isPortrait = this.scale.isPortrait;
        const isGamePortrait = gameHeight > gameWidth;

        // 向きが合っていなければ、基準解像度をリサイズする
        if ((isPortrait && !isGamePortrait) || (!isPortrait && isGamePortrait)) {
            this.scale.resize(gameHeight, gameWidth);
            // resizeが再度このonResizeを呼ぶので、一旦終了
            return;
        }

        // ★★★ 継承先で、このメソッドを上書きして使う ★★★
        // applyLayoutは、各シーンが自分自身のUIを配置するために定義する
        if (this.applyLayout) {
            this.applyLayout();
        }
    }

    // applyLayoutメソッドは、各サブクラスで実装する
    // applyLayout() {
    //    // このシーン独自のレイアウト処理
    // }
}