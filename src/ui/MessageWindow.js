import { Layout } from '../core/Layout.js';
const Container = Phaser.GameObjects.Container;

export default class MessageWindow extends Container {
    constructor(scene, soundManager, configManager) {
        super(scene, 0, 0); // まず親クラスを初期化
        this.soundManager = soundManager;
        this.configManager = configManager;

        // --- プロパティの初期化 ---
        this.windowImage = null;
        this.textObject = null;
        this.nextArrow = null;
        this.arrowTween = null;
        this.charByCharTimer = null;
        this.isTyping = false;
        this.currentTextDelay = 50;

        // ★★★ シーンに追加されたら、initializeメソッドを一度だけ呼ぶよう予約 ★★★
        this.once('addedtoscene', this.initialize, this);
        
        // ★★★ 最後に、自身をシーンに追加するよう要求する ★★★
        this.scene.add.existing(this);
    }

    /**
     * このコンテナがシーンに完全に追加された後に呼ばれる、本当の初期化処理
     */
    initialize() {
        console.log("MessageWindow: シーンに追加され、初期化を開始します。");

        // --- UI要素を生成 ---
        this.windowImage = this.scene.add.image(0, 0, 'message_window');
        this.textObject = this.scene.add.text(0, 0, '', {
            fontFamily: '"Noto Sans JP", sans-serif',
            fontSize: '36px',
            fill: '#ffffff'
        });
        this.nextArrow = this.scene.add.image(0, 0, 'next_arrow');
        
        // --- 要素をコンテナに追加 ---
        this.add([this.windowImage, this.textObject, this.nextArrow]);

        // --- 初期レイアウトの適用とイベントリスナーの登録 ---
        this.applyLayout();
        this.hideNextArrow();
        this.configManager.on('change:textSpeed', (newValue) => {
            this.currentTextDelay = 100 - newValue;
        });
        this.scene.scale.on('resize', this.applyLayout, this);
    }

    applyLayout() {
        const orientation = this.scene.scale.isPortrait ? 'portrait' : 'landscape';
        const layout = Layout[orientation];
        const uiLayout = layout.ui.messageWindow;
        const gameWidth = this.scale.width;

        this.windowImage.setPosition(gameWidth / 2, uiLayout.y);

        const textWidth = this.windowImage.displayWidth - (uiLayout.padding * 2);
        const textHeight = this.windowImage.displayHeight - (uiLayout.padding * 1.5);
        this.textObject.setPosition(
            this.windowImage.x - (this.windowImage.displayWidth / 2) + uiLayout.padding,
            this.windowImage.y - (this.windowImage.displayHeight / 2) + (uiLayout.padding / 2)
        );
        this.textObject.setWordWrapWidth(textWidth, true);
        this.textObject.setFixedSize(textWidth, textHeight);
        
        const textSpeedValue = this.configManager.getValue('textSpeed');
        this.currentTextDelay = 100 - textSpeedValue;

        this.nextArrow.setPosition(
            this.windowImage.x + (this.windowImage.displayWidth / 2) - (uiLayout.padding * 1.5),
            this.windowImage.y + (this.windowImage.displayHeight / 2) - (uiLayout.padding * 1.5)
        );
        this.nextArrow.setScale(0.5);

        if (this.arrowTween) this.arrowTween.stop();
        this.arrowTween = this.scene.tweens.add({
            targets: this.nextArrow,
            y: this.nextArrow.y - 10,
            duration: 400,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
            paused: !this.nextArrow.visible
        });
          // ★★★ ここからデバッグログを追加 ★★★
        console.log(`--- MessageWindow applyLayout ---`);
        
        // ★★★ constを削除。gameHeightだけ新しく定義 ★★★
        const gameHeight = this.scale.height; 
        console.log(`画面サイズ: ${gameWidth} x ${gameHeight}`);

        // 1. ウィンドウ画像の状態
        console.log(`[Window Image]
          - x, y: ${this.windowImage.x}, ${this.windowImage.y}
          - 表示サイズ: ${this.windowImage.displayWidth} x ${this.windowImage.displayHeight}
          - 表示状態: visible=${this.windowImage.visible}, alpha=${this.windowImage.alpha}`
        );
        
        // 2. テキストオブジェクトの状態
        console.log(`[Text Object]
          - x, y: ${this.textObject.x}, ${this.textObject.y}
          - 表示サイズ: ${this.textObject.displayWidth} x ${this.textObject.displayHeight}
          - 表示状態: visible=${this.textObject.visible}, alpha=${this.textObject.alpha}
          - テキスト内容: "${this.textObject.text}"`
       ); 
    }

    setText(text, useTyping = true, onComplete = () => {}) {
        // ... (このメソッドはあなたのコードのままでOK)
    }

    skipTyping() {
        // ... (このメソッドもあなたのコードのままでOK)
    }

    showNextArrow() {
        if (!this.nextArrow) return;
        this.nextArrow.setVisible(true);
        if (this.arrowTween && this.arrowTween.isPaused()) {
            this.arrowTween.resume();
        }
    }

    hideNextArrow() {
        if (!this.nextArrow) return;
        this.nextArrow.setVisible(false);
        if (this.arrowTween && this.arrowTween.isPlaying()) {
            this.arrowTween.pause();
        }
    }

    get textBoxWidth() {
        if (!this.textObject) return 0;
        return this.textObject.width;
    }
}