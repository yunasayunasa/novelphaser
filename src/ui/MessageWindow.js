// PhaserのContainerクラスをインポート
import Container = Phaser.GameObjects.Container;

// MessageWindowクラスを定義し、エクスポート
export default class MessageWindow extends Container {

    constructor(scene) {
        // 親クラス(Container)のコンストラクタを呼び出す
        // コンテナ自体の位置は(0,0)でOK。中の要素の位置で調整する。
        super(scene, 0, 0);
        
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;

        // --- ウィンドウ画像 ---
        // ★★★ 位置を調整しましょう！ ★★★
        // 画面下端から、ウィンドウの高さの半分だけ上に配置するイメージ
        const windowY = gameHeight - 180; // 例：画面下から180pxの位置
        this.windowImage = scene.add.image(gameWidth / 2, windowY, 'message_window');

        // --- テキストオブジェクト ---
        const padding = 35; // ウィンドウの内側の余白
        const textWidth = this.windowImage.width - (padding * 2);
        const textHeight = this.windowImage.height - (padding * 2);

        this.textObject = scene.add.text(
            this.windowImage.x - (this.windowImage.width / 2) + padding,
            this.windowImage.y - (this.windowImage.height / 2) + padding,
            '',
            {
                fontFamily: '"Noto Sans JP", sans-serif',
                fontSize: '36px',
                fill: '#ffffff',
                fixedWidth: textWidth,
                fixedHeight: textHeight
            }
        );

        // ★★★ 自身（コンテナ）に、作った要素を追加する ★★★
        this.add([this.windowImage, this.textObject]);

        // ★★★ シーンの表示リストに自身を追加する ★★★
        scene.add.existing(this);
    }

    /**
     * テキストを設定するメソッド
     * @param {string} text 
     */
    setText(text) {
        this.textObject.setText(text);
    }

    /**
     * テキストオブジェクトの横幅を返すプロパティ (getter)
     */
    get textBoxWidth() {
        return this.textObject.width;
    }
}