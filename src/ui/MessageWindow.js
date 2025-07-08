import { Layout } from '../core/Layout.js';
const Container = Phaser.GameObjects.Container;

export default class MessageWindow extends Container {
    constructor(scene, soundManager, configManager) {
        super(scene, 0, 0);
        this.soundManager = soundManager;
        this.configManager = configManager;

        // --- UI要素をプロパティとして定義 ---
        this.windowImage = this.scene.add.image(0, 0, 'message_window');
        this.textObject = this.scene.add.text(0, 0, '', {
            fontFamily: '"Noto Sans JP", sans-serif',
            fontSize: '36px',
            fill: '#ffffff'
        });
        this.nextArrow = this.scene.add.image(0, 0, 'next_arrow');
        this.arrowTween = null;
        
        // --- テロップ関連のプロパティ ---
        this.charByCharTimer = null;
        this.isTyping = false;
        this.currentTextDelay = 50;

        // --- 初期化 ---
        this.add([this.windowImage, this.textObject, this.nextArrow]);
        this.applyLayout();
        this.hideNextArrow();
        this.scene.add.existing(this);

        // --- イベントリスナー ---
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

        const textWidth = this.windowImage.width - (uiLayout.padding * 2);
        const textHeight = this.windowImage.height - (uiLayout.padding * 1.5);
        this.textObject.setPosition(
            this.windowImage.x - (this.windowImage.width / 2) + uiLayout.padding,
            this.windowImage.y - (this.windowImage.height / 2) + (uiLayout.padding / 2)
        );
        this.textObject.setWordWrapWidth(textWidth, true);
        this.textObject.setFixedSize(textWidth, textHeight);
        
        const textSpeedValue = this.configManager.getValue('textSpeed');
        this.currentTextDelay = 100 - textSpeedValue;

        this.nextArrow.setPosition(
            this.windowImage.x + (this.windowImage.width / 2) - (uiLayout.padding * 1.5),
            this.windowImage.y + (this.windowImage.height / 2) - (uiLayout.padding * 1.5)
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
          // ★★★ ここからデバッグ ★★★
        console.log('--- applyLayout 完了 ---');
        console.log('テキストオブジェクト:', this.textObject);
        console.log(`テキスト座標: x=${this.textObject.x}, y=${this.textObject.y}`);
        console.log(`テキスト表示状態: visible=${this.textObject.visible}, alpha=${this.textObject.alpha}`);
        
        // 強制的に表示させてみる
        this.textObject.setText('ここに表示されるはず！');
        this.textObject.setAlpha(1);
        this.textObject.setVisible(true);
        // ★★★ デバッグここまで ★★★
    }

    setText(text, useTyping = true, onComplete = () => {}) {
        this.textObject.setText('');
        if (this.charByCharTimer) this.charByCharTimer.remove();
        
        if (!useTyping || text.length === 0 || this.currentTextDelay <= 0) {
            this.textObject.setText(text);
            this.isTyping = false;
            onComplete();
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
                    onComplete();
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
        this.textObject.setText(this.charByCharTimer.getConfig().fullText);
        this.charByCharTimer.remove();
        this.isTyping = false;
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