[eval exp="f.test = 10"]
[eval exp="f.name = 'yuna'"]

; --- パターン1: ifがtrue ---
[if exp="f.test === 10"]
yuna:「f.testは10です。正しく表示されました。」
[endif]

; --- パターン2: ifがfalse, elsifがtrue ---
[if exp="f.test === 99"]
yuna:「この行は表示されません。」
[elsif exp="f.name === 'yuna'"]
yuna:「elsifが正しく評価されました。」
[else]
yuna:「この行も表示されません。」
[endif]

; --- パターン3: if/elsifがfalse, elseが実行 ---
[if exp="f.test < 0"]
yuna:「この行は表示されません。」
[elsif exp="f.name === 'kaito'"]
yuna:「この行も表示されません。」
[else]
yuna:「elseが正しく実行されました。」
[endif]