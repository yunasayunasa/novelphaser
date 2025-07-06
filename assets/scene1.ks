[bg storage="bg_school"]
[chara_show name="yuna" pos="left" y=1400 visible=false]

; スライドインで登場
[move name="yuna" y=800 alpha=1 time=1000]
[wait time=500]

yuna:「じゃあ、ちょっとあそこまで歩いてみるね。」
[p]

; 右端まで歩かせる
[walk name="yuna" x=600 time=3000]
[wait time=3000]

yuna:「着いたー！」
[p]

; 反転して
[flip name="yuna" time=500]
[wait time=500]

yuna:「今度は小走りで戻るよ！」
[p]

; 左端まで小走りで戻る (speedを速く、heightを小さく)
[walk name="yuna" x=180 time=1500 speed=100 height=5]
[wait time=1500]

yuna:「ただいま！」
[p]