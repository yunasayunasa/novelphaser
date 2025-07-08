
const Container = Phaser.GameObjects.Container;

export default class MessageWindow extends Container {
    constructor(scene, soundManager, configManager) {
        super(scene, 0, 0); // コンテナ自身の位置は(0,0)でOK
        this.soundManager = soundManager;
        this.configManager = configManager;
        
        // --- プロパティの初期化 ---
        this.charByCharTimer = null;
        this.isTyping = false;
        
        // --- UI要素の生成 ---
        this.windowImage = this.scene.add.image(0, 0, 'message_window').setOrigin(0.5);
        
           const padding = 35;
        const textWidth = this.windowImage.width - (padding * 2);
        const textHeight = this.windowImage.height - (padding * 1.5);
        this.textObject = this.scene.add.text(
            -this.windowImage.width / 2 + padding, // ウィンドウ左端から
            -this.windowImage.height / 2 + padding, // ウィンドウ上端から
            '', {
            fontFamily: '"Noto Sans JP", sans-serif',
            fontSize: '36px',
            fill: '#ffffff'
        });
         this.textObject.setWordWrapWidth(textWidth, true).setFixedSize(textWidth, textHeight);
        
        this.nextArrow = this.scene.add.image(
            this.windowImage.width / 2 - (padding * 1.5), // ウィンドウ右端から
            this.windowImage.height / 2 - (padding * 1.5), // ウィンドウ下端から
            'next_arrow'
        ).setScale(0.5);

        
        // --- コンテナに要素を追加 ---
           this.add([this.windowImage, this.textObject, this.nextArrow]);
       
        // --- 初期状態の設定 ---
        this.hideNextArrow();
        
        // --- イベントリスナーの登録 ---
        this.configManager.on('change:textSpeed', (newValue) => {
            this.currentTextDelay = 100 - newValue;
        });
        
        // ★★★ シーンに自身を追加するのを忘れずに ★★★
        this.scene.add.existing(this);
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