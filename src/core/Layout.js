// 横画面(1280x720)を基準としたレイアウト定義
export const Layout = {
    character: {
        left:   { x: 320, y: 450, scale: 1 },
        center: { x: 640, y: 450, scale: 1 },
        right:  { x: 960, y: 450, scale: 1 }
    },
    ui: {
        messageWindow: {
            y: 600,
            padding: 35
        },
        menuButton:    { // これはUISceneで直接指定しても良い
            x: 1220,
            y: 670
        },
        choiceButton: {
            startY: 200,
            stepY: 90
        }
    }
};