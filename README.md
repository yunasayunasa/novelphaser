# novelphaser


このドキュメントは、自作ノベルゲームエンジン「My Novel Engine」の基本的な使い方をまとめたものです。

## 1. 基本的な考え方

このエンジンは、シナリオファイル(.ks)と、アセット定義ファイル(asset_define.json)の2つを主に編集することでゲームを制作します。

- **`assets/asset_define.json`**: ゲームで使用する画像や音声などの素材をすべて登録します。
- **`assets/*.ks`**: ゲームの物語やキャラクターの動きを、タグを使って記述します。

---

## 2. アセットの登録方法

すべてのアセットは、まず `assets/asset_define.json` に登録する必要があります。

### 画像の登録

`images` セクションに、**ユニークなキー**と**ファイルへのパス**を記述します。

```json
{
  "images": {
    "message_window": "assets/message_window.png",
    "bg_school": "assets/bg_school.jpg",
    "next_arrow": "assets/next_arrow.png"
  }
}
content_copy
download
Use code with caution.
Markdown
キャラクター画像の登録 (重要)
キャラクターの立ち絵や表情差分は、特別な命名規則に従ってキーを付けることで、エンジンにキャラクターとして自動認識されます。

命名規則: キャラクター名_表情名

このルールに従って images セクションに登録します。

Generated json
{
  "images": {
    "yuna_normal": "assets/chara/yuna/normal.png",
    "yuna_smile": "assets/chara/yuna/smile.png",
    "yuna_angry": "assets/chara/yuna/angry.png",
    "kaito_normal": "assets/chara/kaito/normal.png"
  }
}
content_copy
download
Use code with caution.
Json
yuna_normal は、「yuna」というキャラクターの「normal」という表情として自動的に登録されます。
ファイルのパスは自由に設定できますが、assets/chara/キャラクター名/表情名.png のように整理すると管理がしやすくなります。
この方法により、キャラクターに関する情報をjsonに二重に書く必要がなくなり、管理が非常にシンプルになります。
3. 基本的なタグの使い方
シナリオファイル(.ks)では、以下のタグを使ってゲームを制御します。

キャラクターの表示：[chara_show]
キャラクターを画面に表示します。

基本形:

Generated code
; yunaをnormal表情(デフォルト)で、中央に表示
[chara_show name="yuna"]
content_copy
download
Use code with caution.
属性一覧:

name (必須): 表示するキャラクター名。asset_define.jsonのキーの接頭辞 (yuna_...のyuna部分)と一致させます。
face: 表示する表情名。省略した場合は normal になります。
例: [chara_show name="yuna" face="smile"]
pos: 大まかな立ち位置を指定します。left, center, rightが使用可能です。
例: [chara_show name="yuna" pos="left"]
time: フェードインにかける時間（ミリ秒）を指定します。
例: [chara_show name="yuna" time="1000"]
キャラクターの表情変更：[chara_mod]
すでに表示されているキャラクターの表情を変更します。

基本形:

Generated code
; yunaの表情をangryに切り替え
[chara_mod name="yuna" face="angry"]
content_copy
download
Use code with caution.
属性一覧:

name (必須): 表情を変更するキャラクター名。
face (必須): 新しい表情名。
time: 切り替え（クロスフェード）にかける時間（ミリ秒）。省略した場合は 200 になります。
キャラクターの非表示：[chara_hide]
キャラクターを画面から消します。

基本形:

Generated code
[chara_hide name="yuna"]
content_copy
download
Use code with caution.
属性一覧:

name (必須): 非表示にするキャラクター名。
time: フェードアウトにかける時間（ミリ秒）。
背景の表示/切り替え：[bg]
背景画像を表示、またはクロスフェードで切り替えます。

基本形:

Generated code
[bg storage="bg_school"]
content_copy
download
Use code with caution.
属性一覧:

storage (必須): 表示する背景のキー。asset_define.jsonのimagesで定義したキーと一致させます。
time: 表示/切り替えにかける時間（ミリ秒）。
待機/ウェイト：[wait] と [p]
シナリオの進行を止めます。

[p]: プレイヤーのクリックを待ちます。クリックされるまで次に進みません。
[wait time="1000"]: 指定した時間（ミリ秒）だけ、自動的に進行を止めます。
Generated code
どうでしょうか？
この内容で、エンジンの基本的な使い方は十分に伝わるかと思います。
もっと追加したい項目や、修正したい表現があれば、遠慮なくお申し付けください！
content_copy
download
Use code with caution.
