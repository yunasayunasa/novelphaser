import { Layout } from '../core/Layout.js';

//import ResponsiveScene from './ResponsiveScene.js'; // ★ インポート
// ...

export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene', active: true });

        // --- UI要素をクラスのプロパティとして初期化 ---
        this.menuButton = null;
        this.panel = null;
        this.saveButton = null;
        this.loadButton = null;
        this.backlogButton = null;
        this.configButton = null;

        // パネルの開閉状態を管理
        this.isPanelOpen = false;
    }

    create() {
        console.log("UIScene: 作成されました。");

        // --- 1. メニューパネルと、その中のボタンを作成 ---
        this.panel = this.add.container(0, 0);
        const panelBg = this.add.rectangle(0, 0, 0, 0, 0x000000, 0.8);
        this.saveButton = this.add.text(0, 0, 'セーブ', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
        this.loadButton = this.add.text(0, 0, 'ロード', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
        this.backlogButton = this.add.text(0, 0, '履歴', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
        this.configButton = this.add.text(0, 0, '設定', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
        // パネルに背景とボタンを追加 (ボタンは配列で渡せる)
        this.panel.add([panelBg, this.saveButton, this.loadButton, this.backlogButton, this.configButton]);
        
        // --- 2. メインの「メニュー」ボタンを作成 ---
        this.menuButton = this.add.text(0, 0, 'MENU', { fontSize: '36px', fill: '#fff' }).setOrigin(0.5).setInteractive();

        // --- 3. イベントリスナーを設定 ---
        this.menuButton.on('pointerdown', this.togglePanel, this);
        this.saveButton.on('pointerdown', () => this.openScene('SaveLoadScene', { mode: 'save' }));
        this.loadButton.on('pointerdown', () => this.openScene('SaveLoadScene', { mode: 'load' }));
        this.backlogButton.on('pointerdown', () => this.openScene('BacklogScene'));
        this.configButton.on('pointerdown', () => this.openScene('ConfigScene'));
        
       
        // ★ 最初のレイアウト適用
        this.applyLayout();
          // ★ リサイズイベントの監視
        this.scale.on('resize', this.applyLayout, this);

    }

    togglePanel() {
        this.isPanelOpen = !this.isPanelOpen;
        this.applyLayout(true); // アニメーション付きでレイアウトを更新
    }
    
    openScene(sceneKey, data = {}) {
        this.scene.pause('GameScene');
        // ConfigとBacklogを開くときは、UISceneも止める
        if (sceneKey === 'ConfigScene' || sceneKey === 'BacklogScene') {
            this.scene.pause();
        }
        this.scene.launch(sceneKey, data);
    }

       applyLayout(withAnimation = false) {
        const orientation = this.scale.isPortrait ? 'portrait' : 'landscape';
        const layout = Layout[orientation];
        
        // ★★★ 720x1280 の座標空間を使う ★★★
        const gameWidth = layout.width;
        const gameHeight = layout.height;

        // メニューボタンの位置
        this.menuButton.setPosition(100, gameHeight - 50);

        // パネルの背景
        const panelBg = this.panel.getAt(0);
        panelBg.setSize(gameWidth, 120).setPosition(gameWidth / 2, 0);
        
        // パネル内のボタン
        const buttons = this.panel.list.slice(1);
        const areaStartX = 200;
        const areaWidth = gameWidth - areaStartX - 50;
        const buttonMargin = areaWidth / buttons.length;
        buttons.forEach((button, index) => {
            button.setX(areaStartX + (buttonMargin * index) + (buttonMargin / 2));
        });

        // パネル全体の位置
        const targetY = this.isPanelOpen ? gameHeight - 60 : gameHeight + 100;
        if (withAnimation) {
            this.tweens.add({ targets: this.panel, y: targetY, duration: 300, ease: 'Cubic.easeInOut' });
        } else {
            this.panel.y = targetY;
        }
    }
}