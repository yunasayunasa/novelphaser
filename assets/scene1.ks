; まず背景を表示
[bg storage="bog_schol" time=500]
[wait time=500]
[playbgm storage="ronpa_bgm" time="1500" volume="0.4"]


; 二人を登場させる
[chara_show name="yuna" pos="left"]
[chara_show name="kaito" pos="right"]
[wait time=500]

; yunaが話す -> yunaが明るく、kaitoが暗くなる
yuna:「こんにちは、海斗くん！bgmごい！>
[p]

; kaitoが話す -> kaitoが明るく、yunaが暗くなる
kaito:「やあ、優奈さん。いい天気だね。」
[p]

; 地の文 -> 全員が明るくなる
二人はしばらく空を見上げていた。
[p]
スマッシュ音が鳴ります
[playse storage="smash"]

; yunaが再び話す -> yunaが明るく、kaitoが暗くなる
yuna:「そうだ、どこかに出かけない？」
[p]
; 2秒かけてBGMをフェードアウト
[stopbgm time="2000"]
[wait time=2000]
yuna:「あ、音が消えた…」
[chara_hide name="yuna" time=500]
[chara_hide name="kaito" time=500]