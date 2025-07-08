import { Layout } from '../core/Layout.js';
const Container = Phaser.GameObjects.Container;

export default class MessageWindow extends Container {
    constructor(scene, soundManager, configManager) {
        // 1. 親クラス(Container)を、自身の座標(0,0)で初期化
        super(scene, 0, 0);

        // 2. 外部から渡されたマネージャーをプロパティに保存
        this.soundManager = soundManager;
        this.configManager = configManager;
        
        // 3. このクラスが管理するプロパティを初期化
        this.isTyping = false;
        this.charByCharTimer = null;
        this.arrowTween = null;
        
        // 4. UI要素を生成する (まだコンテナには追加しない)
        this.windowImage = this.scene.add.image(0, 0, 'message_window').setOrigin(0.5);
        this.textObject = this.scene.add.text(0, 0, '', {
            fontFamily: '"Noto Sans JP", sans-serif',
            fontSize: '36px',
            fill: '#ffffff'
        });
        this.nextArrow = this.scene.add.image(0, 0, 'next_arrow').setScale(0.5).setOrigin(0.5);

        // 5. 生成したUI要素を、自身(コンテナ)に追加する
        this.add([this.windowImage, this.textObject, this.nextArrow]);

        // 6. レイアウトを適用して、各要素を正しい位置に配置する
        this.applyLayout();

        // 7. 初期状態を設定
        this.hideNextArrow();

        // 8. コンフィグの変更を監視するリスナーを登録
        this.configManager.on('change:textSpeed', (newValue) => {
            this.currentTextDelay = 100 - newValue;
        });
    }

    /**
     * UI要素を、Layout.jsの定義に従って配置するメソッド
     */
    applyLayout() {
        // 横画面固定なので、常にlandscapeのレイアウトを参照する
        const layout = Layout.ui.messageWindow;
        const padding = layout.padding;

        // ウィンドウ画像はコンテナの中心(0,0)に配置
        this.windowImage.setPosition(0, 0);

        // テキストオブジェクトのサイズと位置を計算
        const textWidth = this.windowImage.width - (padding * 2);
        const textHeight = this.windowImage.height - (padding * 1.5);
        this.textObject.setPosition(
            -this.windowImage.width / 2 + padding,
            -this.windowImage.height / 2 + padding / 2
        );
        this.textObject.setWordWrapWidth(textWidth, true);
        this.textObject.setFixedSize(textWidth, textHeight);
        
        // テキスト速度の初期値を設定
        const textSpeedValue = this.configManager.getValue('textSpeed');
        this.currentTextDelay = 100 - textSpeedValue;

        // クリック待ち矢印の位置
        this.nextArrow.setPosition(
            this.windowImage.width / 2 - padding * 1.5,
            this.windowImage.height / 2 - padding * 1.5
        );
        
        // 矢印のアニメーションを(再)生成
        if (this.arrowTween) this.arrowTween.destroy();
        this.arrowTween = this.scene.tweens.add({
            targets: this.nextArrow,
            y: this.nextArrow.y - 10,
            duration: 400,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
            paused: true
        });
    }

    setText(text, useTyping = true, onComplete = () => {}) {
        this.textObject.setText('');
        if (this.charByCharTimer) this.charByCharTimer.remove();
        
        if (!useTyping || text.length === 0 || this.currentTextDelay <= 0) {
            this.textObject.setText(text);
            this.isTyping = false;
            if(onComplete) onComplete();
            return;
        }
        
        this.isTyping = true;
        let index = 0;
        
        const timerConfig = {
            delay: this.currentTextDelay,
            callback: () => {
                this.soundManager.playSe('popopo');
                this.textObject.text += timerConfig.fullText[index];
                index++;
                if (index === timerConfig.fullText.length) {
                    this.charByCharTimer.remove();
                    this.isTyping = false;
                    if(onComplete) onComplete();
                }
            },
            callbackScope: this,
            loop: true,
            fullText: text
        };
        
        this.charByCharTimer = this.scene.time.addEvent(timerConfig);
    }
    
    skipTyping() {
        if (!this.isTyping) return;

        const fullText = this.charByCharTimer.fullText;
        const onCompleteCallback = this.charByCharTimer.callbackScope.onComplete; // ★ onCompleteを安全に取得

        this.charByCharTimer.remove();
        this.isTyping = false;
        this.textObject.setText(fullText);
        
        if (onCompleteCallback) onCompleteCallback();
    }

    showNextArrow() {
        this.nextArrow.setVisible(true);
        if (this.arrowTween && this.arrowTween.isPaused()) {
            this.arrowTween.resume();
        }
    }

    hideNextArrow() {
        this.nextArrow.setVisible(false);
        if (this.arrowTween && this.arrowTween.isPlaying()) {
            this.arrowTween.pause();
        }
    }

    get textBoxWidth() {
        return this.textObject.width;
    }
}