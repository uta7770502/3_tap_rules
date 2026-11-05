# グリップ・クラブ方向の横断点検

ユーザーの「同じ事案は必ずチェックすること」に基づく点検記録。
基準：ILLUSTRATION_STYLE_APPROVED.md と承認参照2枚。線・色の基準変更なし。

今回、scene-guides.js からクラブ使用関連21場面を抽出し、実画像の一覧を確認。9点を詳細確認・再制作（先行4点＋今回5点）。残り12点は一覧確認のみで、手元・ヘッドの詳細判定は未完了。いろは等の別経路も対象であり、この21点が全アプリの総数ではない。

| 場面キー | 状態 |
|---|---|
| stroke | 一覧確認済み。手元・ヘッドの詳細点検は継続対象 |
| tee-falling | 一覧確認済み。手元・ヘッドの詳細点検は継続対象 |
| fringe-putter | 一覧確認済み。手元・ヘッドの詳細点検は継続対象 |
| flag-held-putt | 手元・ヘッドを拡大確認し再制作、参照を差し替え |
| own-umbrella-stroke | 手元・ヘッドを拡大確認し再制作、参照を差し替え |
| practice-divot | 手元・ヘッドを拡大確認し再制作、参照を差し替え |
| play-inside-pa | 一覧確認済み。手元・ヘッドの詳細点検は継続対象 |
| anchor-putter | 胸に上側の手を固定する動作とヘッドを拡大確認し再制作 |
| self-standing-putter | 一覧確認済み。手元・ヘッドの詳細点検は継続対象 |
| practice-hit-ball | 手元・ヘッドを拡大確認し再制作、参照を差し替え |
| raincoat-contact | 手元・ヘッドを拡大確認し再制作、参照を差し替え |
| clothes-anchor | 衣服を握って固定する手元を拡大確認し再制作。ヘッドは画角外 |
| wrong-tee-hole | 一覧確認済み。手元・ヘッドの詳細点検は継続対象 |
| moving-ball-stroke | 手元・ヘッドを拡大確認し再制作、参照を差し替え |
| push-ball | 一覧確認済み。手元・ヘッドの詳細点検は継続対象 |
| caddie-behind | 一覧確認済み。手元・ヘッドの詳細点検は継続対象 |
| straddle-putting-line | 一覧確認済み。手元・ヘッドの詳細点検は継続対象 |
| wrong-partner-ball | 一覧確認済み。手元・ヘッドの詳細点検は継続対象 |
| blind-alignment | 一覧確認済み。手元・ヘッドの詳細点検は継続対象 |
| partner-behind | 一覧確認済み。手元・ヘッドの詳細点検は継続対象 |
| stopped-downswing | 手元・ヘッドを拡大確認し再制作、参照を差し替え |

先行修正：tee-air-shot は grip-corrected-20261105.webp を維持。旧不自然版へ戻さない。

## 追加5点の確認
- flag-held-putt / own-umbrella-stroke：片手で実際のグリップを握る。旗竿・傘を自分で保持する場面を維持。
- anchor-putter：上の手を胸に固定し、下の手を離して添える意図的なアンカリングを維持。
- raincoat-contact：通常の両手グリップと雨具の接触を描き、衣服を握り込む図とは区別。
- clothes-anchor：衣服を握って固定する局所図。ヘッドが見えないためヘッド点検済みとは扱わない。
- ヘッドの見える4点は初回出力のヘッドが球へトウを向けていたため不採用。打球方向を横切る向きへ再修正して確認。
- scene-guides.js を実行し、末尾上書きを含む5点の有効参照を検証。

## 照合資料
- 実写インパクト3視点：https://hackmotion.com/wp-content/uploads/P7-position-in-golf-impact.jpg （表示して確認）
- 実写フィニッシュ：https://hackmotion.com/wp-content/uploads/Finish.png （先行修正で表示して確認）
- 片手パット実写：https://www.golfpass.com/watch/daily-video-tips/one-handed-gate-drill （写真を表示して確認）
- アンカリング公式図：https://assets.randa.org/c42c7bf4-dca7-00ea-4f2e-373223f80f76/3648dd3d-ebdd-4278-bf45-45f0bda2534e/Diagram%2010.1b.png （表示して確認。構造の照合のみ）
- 写真・人物の顔・背景・ブランドはアプリへ転載しない。匿名の線画として手・クラブの構造を確認する。

## 今回の確認内容
- 左手はグリップ端側、右手はシャフト側。両手が同じグリップを握り、シャフトの途中を握らない。
- 一本のクラブを端からヘッドまで追跡。実写に対して身体・手・ヘッドの関係が不自然な場合は再制作。
- practice-hit-ball は最初の出力で広い溝面が球の横を向いたため不採用とし、ヘッドを再修正。
- 特殊行為（アンカリング、片手パット、服を握る等）を通常の握りに勝手に変更しない。今後の詳細点検でも本文との整合を保つ。

## 表示参照の不具合
末尾の .src 再代入が flag-left-in / reviewed-flag-handling / green-water を旧画像へ上書きしていた。実際の scenes を実行して検証し、修正版へ統一。
4点の新しい有効参照、3点の末尾上書き後の有効参照を Node.js で確認。単なる文字列の存在だけで反映済みと判定しない。

本番表示・スマホ全件点検は未完了。全図の完了やユーザーの新規承認を意味しない。
