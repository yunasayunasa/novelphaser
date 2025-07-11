export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene', active: true });
        this.panel = null;
        this.isPanelOpen = false;
    }

    create() {
        const gameWidth = 1280;
        const gameHeight = 720;
        
        const menuButton = this.add.text(100, gameHeight - 50, 'MENU', { fontSize: '36px', fill: '#fff' }).setOrigin(0.5).setInteractive();

        this.panel = this.add.container(0, gameHeight + 120);
        const panelBg = this.add.rectangle(gameWidth / 2, 0, gameWidth, 120, 0x000000, 0.8);
        const saveButton = this.add.text(0, 0, 'セーブ', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
        const loadButton = this.add.text(0, 0, 'ロード', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
        const backlogButton = this.add.text(0, 0, '履歴', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
        const configButton = this.add.text(0, 0, '設定', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
        this.panel.add([panelBg, saveButton, loadButton, backlogButton, configButton]);
        
        const buttons = [saveButton, loadButton, backlogButton, configButton];
        const areaStartX = 250;
        const areaWidth = gameWidth - areaStartX - 100;
        const buttonMargin = areaWidth / buttons.length;
        buttons.forEach((button, index) => {
            button.setX(areaStartX + (buttonMargin * index) + (buttonMargin / 2));
        });

        menuButton.on('pointerdown', () => {
            this.isPanelOpen = !this.isPanelOpen;
            const targetY = this.isPanelOpen ? gameHeight - 60 : gameHeight + 120;
            this.tweens.add({ targets: this.panel, y: targetY, duration: 300, ease: 'Cubic.easeInOut' });
        });
        
        saveButton.on('pointerdown', () => this.openScene('SaveLoadScene', { mode: 'save' }));
        loadButton.on('pointerdown', () => this.openScene('SaveLoadScene', { mode: 'load' }));
        backlogButton.on('pointerdown', () => this.openScene('BacklogScene'));
        configButton.on('pointerdown', () => this.openScene('ConfigScene'));
    }

    openScene(sceneKey, data = {}) {
        this.scene.pause('GameScene');
        if (sceneKey === 'ConfigScene' || sceneKey === 'BacklogScene') {
            this.scene.pause();
        }
        this.scene.launch(sceneKey, data);
    }
}