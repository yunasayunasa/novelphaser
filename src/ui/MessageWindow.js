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