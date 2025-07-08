export const Layout = {
    // 縦向き (portrait)
    portrait: {
        width: 720,
        height: 1280,
        character: {
            // Y座標は共通にしておくと綺麗に見える
            left:   { x: 180, y: 800 },
            center: { x: 360, y: 800 },
            right:  { x: 540, y: 800 }
        },
        ui: {
            messageWindow: {
                y: 1100, // ウィンドウの中心Y座標
                padding: 35
            },
            menuButton:    {
                x: 660, // 画面右端から少し内側
                y: 50
            },
            choiceButton: {
                startY: 500, // 選択肢ボタンが表示され始めるY座標
                stepY: 100   // 各ボタンのY座標の間隔
            }
        }
    },
    // 横向き (landscape)
    landscape: {
        width: 1280,
        height: 720,
        character: {
            left:   { x: 320, y: 450 },
            center: { x: 640, y: 450 },
            right:  { x: 960, y: 450 }
        },
        ui: {
            messageWindow: {
                y: 600,
                padding: 35
            },
            menuButton:    {
                x: 1220,
                y: 50
            },
            choiceButton: {
                startY: 200,
                stepY: 90
            }
        }
    }
};
