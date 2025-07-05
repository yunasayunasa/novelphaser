export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        console.log("PreloadScene: 準備中...");
           // ★★★ ここでWebフォントローダーを読み込む ★★★
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');

        // アセット定義ファイルも読み込む
        this.load.json('asset_define', 'assets/asset_define.json');
    }
       
    

    create() {
        console.log("PreloadScene: アセット定義を読み込み、ロードを開始します。");
        const assetDefine = this.cache.json.get('asset_define');

        // imagesセクションに基づいて、画像をすべてロードする
        for (const key in assetDefine.images) {
            this.load.image(key, assetDefine.images[key]);
        }

        // soundsセクションに基づいて、音声をすべてロードする (今は空)
        for (const key in assetDefine.sounds) {
            this.load.audio(key, assetDefine.sounds[key]);
        }
        
        // ロードの進捗を監視
        this.load.on('progress', (value) => {
            // ここでロードバーなどを表示できる（今回はログ出力のみ）
            console.log(`Loading... ${Math.round(value * 100)}%`);
        });

        // すべてのアセットのロードが完了したら、次のシーンへ
        this.load.on('complete', () => {
            console.log("すべてのアセットのロードが完了しました。");
            // GameSceneにキャラクター定義を渡して起動する
            this.scene.start('GameScene', { charaDefs: assetDefine.characters });
        });

        // ★★★ ロードを開始する ★★★
        this.load.start();
    }
}