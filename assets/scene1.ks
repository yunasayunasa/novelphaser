*start
yuna:「画像を使ったボタンをテストします。」
[p]

; 画面右上にタイトルへ戻るボタンを配置
[button graphic="button_title" x=620 y=80 target="*title_screen"]

yuna:「右上にボタンが表示されていれば成功です。」
[p]
yuna:「クリックすると、*title_screenラベルにジャンプします。」
[s] ; ここで停止

*title_screen
yuna:「タイトル画面へようこそ！（ジャンプ成功）」
[s]