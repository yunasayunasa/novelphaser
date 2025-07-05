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

        // ★★★ 自身（コンテナ）に、作った要素を追加する ★★★
        this.add([this.windowImage, this.textObject]);
    // ★★★ テロップ表示用のプロパティを追加 ★★★
        this.charByCharTimer = null; // 文字ごとのタイマーイベント
        this.isTyping = false;       // 現在テロップ表示中かどうかのフラグ
        // ★★★ シーンの表示リストに自身を追加する ★★★
        scene.add.existing(this);
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
        
      // ★★★ タイマーに、後で使う情報を追加 ★★★
        const timerConfig = {
            delay: 50,
            callback: () => {
                // callbackScope(this)から全文を取得して、表示テキストに追加
                this.textObject.text += timerConfig.fullText[index];
                index++;
                if (index === timerConfig.fullText.length) {
                    this.charByCharTimer.remove();
                    this.isTyping = false;
                    onComplete();
                }
            },
            callbackScope: this,
            loop: true,
            
            // ★★★ カスタムプロパティとして全文を保存 ★★★
            fullText: text 
        };
        
        this.charByCharTimer = this.scene.time.addEvent(timerConfig);
    }
    
    skipTyping() {
        if (!this.isTyping) return;

        // タイマーに保存した全文を取得
        const fullText = this.charByCharTimer.getConfig().fullText;
        
        this.charByCharTimer.remove();
        this.isTyping = false;
        this.textObject.setText(fullText);
        // ★★★ スキップ時は完了コールバックを呼ばないのが一般的 ★★★
        // なぜなら、次の行に進んでしまうとプレイヤーが文章を読む時間がないため。
    }

    /**
     * テキストオブジェクトの横幅を返すプロパティ (getter)
     */
    get textBoxWidth() {
        return this.textObject.width;
    }
}