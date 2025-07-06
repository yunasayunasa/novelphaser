[bg storage="bg_school"]
[wait time=500]

; 画面外下から、中央にスライドインで登場
[chara_show name="yuna" pos="center" y=1400]
[move name="yuna" y=800 time=1000]

yuna:「スライドインで登場しました！」
[p]

; 少し右に移動
[move name="yuna" x=500 time=800]
[p]

; 左に移動しながら退場
[move name="yuna" x=-200 time=1200]
[wait time=1200]

; シナリオ終了