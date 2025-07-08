; === レスポンシブ対応テストシナリオ ===

; まずは縦向き用の背景を表示
[bg storage="bg_school"]
[wait time=500]

[chara_show name="yuna" pos="left"]
[chara_show name="kaito" pos="right"]
[wait time=500]

yuna:「今は縦長の画面用のレイアウトのはず…。」
[p]
kaito:「ブラウザのウィンドウを横長にしてみてくれ。」
[p]

yuna:「キャラクターやUIの位置が、横長レイアウトに切り替わったかな？」
[p]
kaito:「OK。次は、横長の背景に切り替えてみよう。」
[p]

; 横長の背景に切り替え
[bg storage="bg_wide" time=1000]
[wait time=1000]

yuna:「横長の背景でも、画面いっぱいに表示されてる？」
[p]
kaito:「それじゃあ、今度はこの状態で、ウィンドウを縦長に戻してみてくれ。」
[p]

yuna:「ちゃんと、縦長用のレイアウトに戻ったかな？」
[p]

[s]