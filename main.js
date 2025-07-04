// Phaserのゲーム設定
const config = {
    type: Phaser.AUTO, // WebGLが使えるならWebGLを、そうでなければCanvasを使う
    width: 800,        // ゲーム画面の幅
    height: 600,       // ゲーム画面の高さ
    scene: {
        preload: preload, // 準備処理
        create: create    // 生成処理
    }
};

// ゲームインスタンスの作成
const game = new Phaser.Game(config);

// --- Phaserのシーン関数 ---

// preload: ゲームで使う素材を読み込む関数
function preload() {
    console.log("Preload: 準備中...");
    // ここでシナリオファイルを読み込む
    this.load.text('scene1', 'assets/scene1.ks'); // 'scenario'フォルダの'scene1.ks'を'scene1'という名前で読み込む
}

// create: ゲーム画面が作られた時に一度だけ呼ばれる関数
function create() {
    console.log("Create: ゲーム開始！");

    // ここからゲームのロジックが始まる
    // 背景を黒く塗りつぶす
    this.cameras.main.setBackgroundColor('#000000');
    
    // シナリオデータを取得
    const scenarioText = this.cache.text.get('scene1');
    if (scenarioText) {
        console.log("シナリオ読み込み成功！");
        console.log(scenarioText); // ブラウザのコンソールに内容を表示してみる
    } else {
        console.error("シナリオ読み込み失敗...");
    }
}