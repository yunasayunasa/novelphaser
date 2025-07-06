[eval exp="f.player_name = '才城'"]
[eval exp="f.level = 10"]
[eval exp="sf.play_count = (sf.play_count || 0) + 1"]

; コンソールに変数の値を出力
[log exp="f.player_name"]
[log exp="f.level"]
[log exp="sf.play_count"]

; テキストに変数を埋め込む
yuna:「ようこそ、&f.player_name さん。あなたのレベルは &f.level ね。」
[p]
yuna:「このゲームをプレイするのは、&sf.play_count 回目よ。」
[p]