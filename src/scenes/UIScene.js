

export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene', active: true });

        // --- UI要素をクラスのプロパティとして初期化 ---
        this.menuButton = null;
        this.panel = null;
        this.isPanelOpen = false;
    }

    create() {
        console.log("UIScene: 作成されました。");
 // ★★★ 最初にレイアウト定義を取得 ★★★
        const layout = Layout.landscape;
        // --- 1. メニューパネルと、その中のボタンを作成 ---
        // ここでは生成するだけで、位置はapplyLayoutで設定する
         const panelBg = this.add.rectangle(layout.width / 2, 0, layout.width, 120, 0x000000, 0.8);
        const saveButton = this.add.text(0, 0, 'セーブ', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
        const loadButton = this.add.text(0, 0, 'ロード', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
        const backlogButton = this.add.text(0, 0, '履歴', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
        const configButton = this.add.text(0, 0, '設定', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
        
        this.panel = this.add.container(0, layout.height + 120,  [panelBg, saveButton, loadButton, backlogButton, configButton]);
        
        // --- 2. メインの「メニュー」ボタンを作成 ---
         this.menuButton = this.add.text(100, layout.height - 50,  'MENU', { fontSize: '36px', fill: '#fff' }).setOrigin(0.5).setInteractive();

        // --- 3. イベントリスナーを設定 ---
        this.menuButton.on('pointerdown', this.togglePanel, this);
        saveButton.on('pointerdown', () => this.openScene('SaveLoadScene', { mode: 'save' }));
        loadButton.on('pointerdown', () => this.openScene('SaveLoadScene', { mode: 'load' }));
        backlogButton.on('pointerdown', () => this.openScene('BacklogScene'));
        configButton.on('pointerdown', () => this.openScene('ConfigScene'));
        
        // --- 4. 初期レイアウトを一度だけ適用 ---
        this.applyLayout();
    }

    applyLayout(withAnimation = false) {
        // 横画面固定なので、常にlandscapeのレイアウトを参照する
       
        const gameWidth = layout.width;  // 1280
        const gameHeight = layout.height; // 720

        // メニューボタンの位置 (あなたの希望に合わせて左下に)
        this.menuButton.setPosition(100, gameHeight - 50);

        // パネルの背景サイズと位置
        const panelBg = this.panel.getAt(0);
        panelBg.setSize(gameWidth, 120).setPosition(gameWidth / 2, 0);
        
        // パネル内のボタンを再配置
        const buttons = this.panel.list.slice(1);
        const areaStartX = 200;
        const areaWidth = gameWidth - areaStartX - 50;
        const buttonMargin = areaWidth / buttons.length;
        buttons.forEach((button, index) => {
            const buttonX = areaStartX + (buttonMargin * index) + (buttonMargin / 2);
            button.setX(buttonX);
        });

        // パネル全体の表示/非表示位置を更新
        const targetY = this.isPanelOpen ? gameHeight - 60 : gameHeight + 120; // 隠れる位置を少し調整
        if (withAnimation) {
            this.tweens.add({ targets: this.panel, y: targetY, duration: 300, ease: 'Cubic.easeInOut' });
        } else {
            // 初期状態では隠しておく
            this.panel.y = targetY;
        }
    }

    togglePanel() {
        this.isPanelOpen = !this.isPanelOpen;
        this.applyLayout(true); // アニメーション付きでレイアウトを更新
    }
    
    openScene(sceneKey, data = {}) {
        this.scene.pause('GameScene');
        if (sceneKey === 'ConfigScene' || sceneKey === 'BacklogScene') {
            this.scene.pause();
        }
        this.scene.launch(sceneKey, data);
    }
}