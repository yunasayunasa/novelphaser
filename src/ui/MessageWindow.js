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
        // 現在の向きとレイアウト定義を取得
        const orientation = this.scene.scale.isPortrait ? 'portrait' : 'landscape';
        const layout = Layout[orientation];
        const uiLayout = layout.ui.messageWindow;
        
        // ★★★ ゲーム世界の固定サイズを使う ★★★
        const gameWidth = layout.width;

        // 1. ウィンドウ画像の位置を更新
        this.windowImage.setPosition(gameWidth / 2, uiLayout.y);

        // 2. テキストオブジェクトの位置とサイズを更新
        // ★★★ .width と .height を使う ★★★
        const textWidth = this.windowImage.width - (uiLayout.padding * 2);
        const textHeight = this.windowImage.height - (uiLayout.padding * 1.5);
        
        this.textObject.setPosition(
            this.windowImage.x - (this.windowImage.width / 2) + uiLayout.padding,
            this.windowImage.y - (this.windowImage.height / 2) + (uiLayout.padding / 2)
        );
        this.textObject.setWordWrapWidth(textWidth, true);
        this.textObject.setFixedSize(textWidth, textHeight);

        // 3. クリック待ち矢印の位置を更新
        this.nextArrow.setPosition(
            this.windowImage.x + (this.windowImage.width / 2) - (uiLayout.padding * 1.5),
            this.windowImage.y + (this.windowImage.height / 2) - (uiLayout.padding * 1.5)
        );
        this.nextArrow.setScale(0.5);

        // 4. 矢印のアニメーションを再生成
        if (this.arrowTween) {
            this.arrowTween.stop();
            this.arrowTween.remove(); // 完全に削除
        }
        this.arrowTween = this.scene.tweens.add({
            targets: this.nextArrow,
            y: this.nextArrow.y - 10,
            duration: 400,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
            paused: !this.nextArrow.visible
        });
    }

    setText(text, useTyping = true, onComplete = () => {}) {
        // 既存のテキストとタイマーをクリア
        this.textObject.setText('');
        if (this.charByCharTimer) {
            this.charByCharTimer.remove();
        }
        
        // テロップ表示を使わない条件を判定
        if (!useTyping || text.length === 0 || this.currentTextDelay <= 0) {
            this.textObject.setText(text);
            this.isTyping = false;
            onComplete();
            return;
        }
        
        // --- ここからテロップ表示処理 ---
        this.isTyping = true;
        let index = 0;
        
        const timerConfig = {
            delay: this.currentTextDelay,
            callback: () => {
                // タイプ音を再生
                this.soundManager.playSe('popopo');
                // 文字を追加
                this.textObject.text += timerConfig.fullText[index];
                index++;
                // 終了判定
                if (index === timerConfig.fullText.length) {
                    this.charByCharTimer.remove();
                    this.isTyping = false;
                    onComplete();
                }
            },
            callbackScope: this,
            loop: true,
            fullText: text // カスタムプロパティとして全文を保存
        };
        
        this.charByCharTimer = this.scene.time.addEvent(timerConfig);
    }

    skipTyping() {
        if (!this.isTyping) return;

        // タイマーに保存した全文を取得
        const fullText = this.charByCharTimer.fullText;
        
        this.textObject.setText(fullText);
        this.charByCharTimer.remove();
        this.isTyping = false;
        
        // ★ スキップ時は、テロップ完了時のコールバックを自分で呼ぶ必要がある
        // ただし、onClickでシナリオが進まないように、isWaitingClickはtrueのまま
        const onComplete = this.charByCharTimer.onComplete;
        if(onComplete) onComplete();
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