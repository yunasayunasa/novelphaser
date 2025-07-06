; === セーブ機能テスト：セーブ用シナリオ ===

[playbgm storage="ronpa_bgm" time=1000]
[bg storage="bg_school" time=1000]
[wait time=1000]

[chara_show name="yuna" pos="left" time=500]
[chara_show name="kaito" pos="right" time=500]
[wait time=500]

yuna:「この会話の途中でセーブしますね。」
[p]

kaito:「了解。背景、キャラクター2人、BGMが流れている状態だね。」
[p]

[save slot="1"]

yuna:「セーブしました。」
[p]
[load slot="1"]
yuna:「ロードが成功すれば、このセリフが表示されます。」
[p]

; --- この先はセーブ後のテストなので、ロード時には実行されない ---
[chara_hide name="yuna"]
[chara_hide name="kaito"]
[stopbgm]