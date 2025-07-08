

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
         const gameWidth = 1280;
        const gameHeight = 720;
        // --- 1. メニューパネルと、その中のボタンを作成 ---
        // ここでは生成するだけで、位置はapplyLayoutで設定する
         const panelBg = this.add.rectangle(gameWidth / 2, 0, gameWidth, 120, 0x000000, 0.8);
        const saveButton = this.add.text(0, 0, 'セーブ', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
        const loadButton = this.add.text(0, 0, 'ロード', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
        const backlogButton = this.add.text(0, 0, '履歴', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
        const configButton = this.add.text(0, 0, '設定', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
        
        this.panel = this.add.container(0, gameheight + 120,  [panelBg, saveButton, loadButton, backlogButton, configButton]);
        
        // --- 2. メインの「メニュー」ボタンを作成 ---
         this.menuButton = this.add.text(100, gameheight - 50,  'MENU', { fontSize: '36px', fill: '#fff' }).setOrigin(0.5).setInteractive();

        // --- 3. イベントリスナーを設定 ---
  menuButton.on('pointerdown', () => {
            this.isPanelOpen = !this.isPanelOpen;
            const targetY = this.isPanelOpen ? gameHeight - 60 : gameHeight + 100;
            this.tweens.add({ targets: this.panel, y: targetY, duration: 300, ease: 'Cubic.easeInOut' });
        });
        saveButton.on('pointerdown', () => this.openScene('SaveLoadScene', { mode: 'save' }));
        loadButton.on('pointerdown', () => this.openScene('SaveLoadScene', { mode: 'load' }));
        backlogButton.on('pointerdown', () => this.openScene('BacklogScene'));
        configButton.on('pointerdown', () => this.openScene('ConfigScene'));
        
     
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