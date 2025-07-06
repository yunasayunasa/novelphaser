export default class UIScene extends Phaser.Scene {
    constructor() {
        // key: このシーンを呼び出すための名前
        // active: true にすることで、他のシーンと同時に自動で起動・表示される
        super({ key: 'UIScene', active: true });
    }

    create() {
        console.log("UIScene: 作成されました。");
        const gameWidth = this.scale.width;

        // --- セーブボタンを作成 ---
        // 将来的にメニューボタンから開くようにするが、今は直接ボタンを置く
        const saveButton = this.add.text(gameWidth - 100, 50, 'セーブ', { fontSize: '28px', fill: '#fff' })
            .setOrigin(0.5)
            .setInteractive(); // クリック可能にする
        
        saveButton.on('pointerdown', () => {
            console.log("セーブボタンが押されました。");

            // GameSceneの動作を一時停止
            this.scene.pause('GameScene');
            
            // SaveLoadSceneを上に重ねて起動する
            // 起動時に 'save' モードであることを伝えるデータを渡す
            this.scene.launch('SaveLoadScene', { mode: 'save' });
        });

        // --- ロードボタンを作成 ---
        const loadButton = this.add.text(gameWidth - 100, 110, 'ロード', { fontSize: '28px', fill: '#fff' })
            .setOrigin(0.5)
            .setInteractive();

        loadButton.on('pointerdown', () => {
            console.log("ロードボタンが押されました。");
            this.scene.pause('GameScene');
            this.scene.launch('SaveLoadScene', { mode: 'load' });
        });
    }
}