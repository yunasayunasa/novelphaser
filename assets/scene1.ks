; 変数を設定する
[eval exp="f.test_flag = true"]
[eval exp="f.player_name = '勇者'"]
[eval exp="sf.play_count = (sf.play_count || 0) + 1"]

yuna:「変数を設定しました。コンソールとセーブデータを確認してください。」
[p]
yuna:「プレイ回数は[eval exp="sf.play_count"]回目です。」
[p]

[save slot=1]