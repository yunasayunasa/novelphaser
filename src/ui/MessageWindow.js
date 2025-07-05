// ★★★ 先頭の import 文を削除し、この行を代わりに追加 ★★★
const Container = Phaser.GameObjects.Container;

// MessageWindowクラスを定義し、エクスポート
export default class MessageWindow extends Container{

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

        // ★★★ ここからデバッグ ★★★

    // 1. アイコンの座標を、画面中央などの絶対的な位置に固定してみる
    const iconX = scene.scale.width / 2;
    const iconY = scene.scale.height / 2;
    
    this.nextArrow = scene.add.image(iconX, iconY, 'next_arrow');

    // 2. setVisible(false) を外して、最初から強制的に表示させる
    // this.nextArrow.setVisible(false); 

    // 3. 念のため、アイコンが一番手前に来るように深度を設定する
    this.nextArrow.setDepth(100); 

    // 4. アニメーションの定義を一時的にコメントアウトする
    /*
    this.arrowTween = scene.tweens.add({ ... });
    */

    this.add(this.nextArrow);
    scene.add.existing(this);

    // ★★★ デバッグここまで ★★★
    }
    
       // ★★★ アイコンを制御するメソッドを追加 ★★★
    /**
     * クリック待ちアイコンを表示し、アニメーションを開始する
     */
    showNextArrow() {
    console.log("showNextArrow 呼び出し");
    // this.nextArrow.setVisible(true);
    // if (this.arrowTween.isPaused()) { this.arrowTween.resume(); }
}

hideNextArrow() {
    console.log("hideNextArrow 呼び出し");
    // this.nextArrow.setVisible(false);
    // if (this.arrowTween.isPlaying()) { this.arrowTween.pause(); }
}

    /**
     * テキストを設定するメソッド (大改造)
     * @param {string} text - 表示する全文
     * @param {boolean} useTyping - テロップ表示を使うかどうか
     * @param {function} onComplete - 表示完了時に呼ばれるコールバック関数
     */
    setText(text, useTyping = true, onComplete = () => {}) {
        // 既存のテキストとタイマーをクリア
        this.textObject.setText('');
        if (this.charByCharTimer) {
            this.charByCharTimer.remove();
        }
        
        if (!useTyping || text.length === 0) {
            // テロップ表示を使わない場合、またはテキストが空の場合は即時表示
            this.textObject.setText(text);
            this.isTyping = false;
            onComplete(); // 即座に完了コールバックを呼ぶ
            return;
        }
        
        this.isTyping = true;
        let index = 0;
        
       // ★★★ タイマーイベントを作成 ★★★
        this.charByCharTimer = this.scene.time.addEvent({
            delay: 50,
            callback: () => {
                // ★★★ this.charByCharTimer から直接 fullText を参照する ★★★
                this.textObject.text += this.charByCharTimer.fullText[index];
                index++;

                if (index === this.charByCharTimer.fullText.length) {
                    this.charByCharTimer.remove();
                    this.isTyping = false;
                    onComplete();
                }
            },
            callbackScope: this,
            loop: true
        });
        
        // ★★★ 作成したタイマーオブジェクトに、後からプロパティを追加する ★★★
        this.charByCharTimer.fullText = text;
    }
    
    skipTyping() {
        if (!this.isTyping) return;

        // ★★★ タイマーオブジェクトから直接 fullText プロパティを取得 ★★★
        this.textObject.setText(this.charByCharTimer.fullText);

        this.charByCharTimer.remove();
        this.isTyping = false;
    }

    /**
     * テキストオブジェクトの横幅を返すプロパティ (getter)
     */
    get textBoxWidth() {
        return this.textObject.width;
    }
}