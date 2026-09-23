/* Deterministic diagrams: dimensions are schematic, text supplies conditions. */
(function(root){
 const ball=(x,y)=>`<circle cx="${x}" cy="${y}" r="8" fill="white" stroke="#173f35" stroke-width="2"/>`;
 const txt=(x,y,s)=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="14" fill="#173f35">${s}</text>`;
 const svg=(label,body)=>`<svg viewBox="0 0 320 190" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="190" rx="12" fill="#eaf6ef"/>${body}</svg>`;
 const arrow=(x1,y1,x2,y2)=>`<path d="M${x1} ${y1} L${x2} ${y2}" stroke="#087f68" stroke-width="3" stroke-dasharray="5 4"/><circle cx="${x2}" cy="${y2}" r="4" fill="#087f68"/>`;
 const card=(title,picture,text)=>`<section class="guide-card"><h5>${title}</h5>${picture}<p>${text}</p></section>`;
 const group=(title,cards,note)=>`<h4>${title}</h4><div class="guide-card-grid">${cards.join('')}</div><p>${note||'位置関係を説明する模式図です。実際の距離・地形は異なります。'}</p>`;
 const green=svg('球または足が目的外グリーンにかかる場合は救済を確認',`<ellipse cx="230" cy="94" rx="78" ry="72" fill="#8cce87"/>${txt(227,55,'目的外グリーン')}${ball(181,119)}<ellipse cx="196" cy="91" rx="7" ry="15" fill="#163e34"/><ellipse cx="172" cy="83" rx="7" ry="15" fill="#163e34"/>${arrow(155,119,105,119)}${ball(86,119)}${txt(85,153,'完全に外れる')}`);
 const details={
 'nearest':()=>group('球・足・スイングを全部確認',[
 card('救済前：足が道路にかかる',svg('球は芝、足の一部は道路',`<rect x="140" width="80" height="190" fill="#adb6b5"/>${txt(180,30,'道路')}${ball(108,115)}<ellipse cx="146" cy="80" rx="8" ry="17" fill="#163e34"/><ellipse cx="173" cy="80" rx="8" ry="17" fill="#163e34"/>`),'通常の構えで障害があるかを確認。'),
 card('基準点：最も近い完全救済',svg('道路から離れ球と両足とスイングが芝の上にある',`<rect x="230" width="65" height="190" fill="#adb6b5"/>${txt(262,30,'道路')}${ball(102,115)}<ellipse cx="147" cy="80" rx="8" ry="17" fill="#163e34"/><ellipse cx="177" cy="80" rx="8" ry="17" fill="#163e34"/><path d="M65 140 Q165 130 203 40" fill="none" stroke="#087f68" stroke-dasharray="5 4"/>${txt(115,172,'すべて芝の上')}`),'好きな側・打ちやすい場所を選ぶのではありません。')
 ],'球がジェネラルエリアにある場合：基準点から1クラブレングス以内で、ホールに近づかず、完全救済となる範囲へドロップ。図は基準点の計測図ではありません。'),
 'penalty':()=>group('赤と黄で選択肢が変わる',[
 card('赤：3つの選択肢',svg('赤は打ち直し、後方線上、ラテラル救済',`<rect x="195" y="25" width="110" height="140" rx="40" fill="#a1dcf3"/><path d="M195 25V165" stroke="#cf4040" stroke-width="5"/>${ball(195,89)}${arrow(190,100,110,138)}${txt(97,168,'横：2クラブ以内')}${txt(104,47,'後方線上')}`),'打ち直し／後方線上／ラテラル。いずれも1罰打。'),
 card('黄：2つの選択肢',svg('黄は打ち直しと後方線上。ラテラル救済はない',`<rect x="195" y="25" width="110" height="140" rx="40" fill="#a1dcf3"/><path d="M195 25V165" stroke="#d7ad00" stroke-width="5"/>${ball(195,89)}${txt(98,85,'打ち直し')}${txt(98,117,'後方線上')}`),'打ち直し／後方線上。いずれも1罰打。横2クラブの選択肢はありません。')
 ],'最後に境界を横切った地点が基準。赤のラテラル救済はホールに近づかず区域外へ。後方線上はホールと横断点を結ぶ線を後ろへ延長します。'),
 'redrop':()=>group('「落ちた場所」と「止まった場所」を区別',[
 card('① 正しく落としたが外へ',svg('救済エリア内の着地点から外の停止位置へ転がる',`<rect x="30" y="28" width="175" height="120" rx="15" fill="#b5dfbf" stroke="#087f68" stroke-dasharray="6 4"/>${txt(118,53,'救済エリア')}${ball(85,94)}${arrow(97,94,252,126)}${ball(265,130)}`),'再ドロップする。'),
 card('② 2回目も外へ',svg('2回目に最初に地面に触れた地点へ球を置く',`<rect x="30" y="28" width="175" height="120" rx="15" fill="#b5dfbf" stroke="#087f68" stroke-dasharray="6 4"/>${ball(110,95)}<circle cx="110" cy="95" r="18" fill="none" stroke="#087f68" stroke-width="3"/>${txt(155,172,'2回目の着地点に置く')}`),'2回目に最初に地面に触れた箇所へプレース。')
 ],'膝の高さなど方法を誤ったドロップは、この「2回」に数えません。後方線上救済は専用の救済エリアの決め方を確認。'),
 'bunker':()=>group('アンプレヤブル：外へ出す方法で罰が違う',[
 card('バンカー内で救済',svg('球をバンカー内で救済',`<ellipse cx="160" cy="95" rx="130" ry="67" fill="#edce98"/>${ball(130,85)}${arrow(144,90,190,125)}${ball(202,132)}${txt(160,38,'バンカー内')}`),'後方線上・ラテラルは1罰打。バンカー内へ。'),
 card('外への後方線上救済',svg('ホール、元の球、後方の救済位置の順に一直線',`<ellipse cx="160" cy="80" rx="100" ry="44" fill="#edce98"/><path d="M160 25V172" stroke="#087f68" stroke-dasharray="5 4"/>${txt(160,20,'ホール方向 ↑')}${ball(160,80)}${ball(160,158)}`),'バンカー外の後方線上は合計2罰打。')
 ],'直前の場所からの打ち直しは1罰打。直前の場所がバンカー外なら、1罰打で外へ戻れます。一時的な水による救済とは別の規則です。'),
 'wrong-green':()=>group('足だけがかかっても確認',[
 card('目的外グリーンの干渉',green,'球・通常のスタンス・意図するスイングへの干渉を確認。'),
 card('そのまま打たず、無罰救済',svg('元の球と同じコース区域に完全救済の基準点を決める',`<ellipse cx="240" cy="80" rx="65" ry="55" fill="#8cce87"/>${ball(94,112)}<ellipse cx="130" cy="83" rx="7" ry="15" fill="#163e34"/><ellipse cx="150" cy="83" rx="7" ry="15" fill="#163e34"/>${txt(157,165,'球・足・スイングを外す')}`),'同じコース区域内のニアレストポイントから、1クラブレングス以内へ。')
 ],'ホールに近づかず、完全な救済が必要。スタンスだけの障害についてはローカルルールD-3採用の有無も確認。'),
 'double-hit':()=>group('同じ1回のスイングの中で起きた？',[
 card('① 最初の接触',svg('クラブが球に最初に当たる',`<path d="M105 27L157 131L185 126" fill="none" stroke="#37474f" stroke-width="8"/>${ball(194,124)}${txt(158,167,'1回のスイングが続く')}`),'球を打ってクラブが振り抜かれる。'),
 card('② 振り抜き中に偶然再接触',svg('同じスイングでクラブが再び球に接触',`<path d="M105 25L184 98L210 90" fill="none" stroke="#37474f" stroke-width="8"/>${ball(219,86)}${arrow(140,140,235,105)}${txt(158,168,'追加罰なし・1打')}`),'偶然なら追加罰なし。1ストロークとして数える。')
 ],'故意に動いている球へ別のストロークをする場合は別扱い（規則10.1dと例外を確認）。'),
 'drop-contact':()=>group('地面に触れる前？ 後？',[
 card('地面に触れる前に靴へ',svg('落下する球が地面より先に靴に当たる',`<path d="M20 148H300" stroke="#087f68" stroke-width="4"/><path d="M145 108h37l28 24v13h-65z" fill="#52666b"/>${ball(165,99)}${arrow(165,35,165,80)}${txt(160,175,'やり直し')}`),'正しい方法でドロップし直す。この失敗は再ドロップの回数に数えない。'),
 card('地面に触れた後に偶然靴へ',svg('着地後に転がって靴に当たる',`<path d="M20 148H300" stroke="#087f68" stroke-width="4"/><path d="M220 108h37l28 24v13h-65z" fill="#52666b"/>${ball(90,140)}${arrow(103,139,202,139)}${txt(160,175,'止まった位置を確認')}`),'救済エリア内に止まればそのまま。外に止まれば再ドロップの手順へ。')
 ],'本人が正しい高さ・場所から落とした場合。故意に止めた場合は別の規則が適用されます。'),
 'embedded':()=>group('草ではなく、地面にくい込んでいる？',[
 card('自分の着弾跡にくい込む',svg('球の一部が地面の高さより下にある断面',`<path d="M15 98H135 Q160 146 185 98H305V175H15Z" fill="#b99265"/>${ball(160,104)}${txt(160,50,'元の地面の高さ')}`),'自分のピッチマークで、球の一部が地面の高さより下にあるか確認。'),
 card('草に沈んでいるだけ',svg('草の間の球は地面の上にある断面',`<rect x="15" y="132" width="290" height="43" fill="#b99265"/><path d="M120 131l-8-50m28 50l-5-57m47 57l9-48m15 48l8-58" stroke="#65a953" stroke-width="7"/>${ball(160,123)}${txt(160,50,'球は地面より上')}`),'草が深いだけ、他人の古い着弾跡に入っただけでは、この救済の対象にならない。')
 ],'ジェネラルエリアが基本。砂地などの例外、救済を制限するローカルルールを確認。'),
 'wind-green':()=>group('グリーンで、拾って戻した後かどうか',[
 card('まだ拾って戻していない',svg('風で球が元の場所から新しい場所へ移る',`${ball(78,95)}${arrow(92,95,226,95)}${ball(245,95)}${txt(160,145,'移動先からプレー')}`),'風による移動なら、原則として新しい場所から。'),
 card('拾ってリプレースした後',svg('風で移動しても元の位置へ球を戻す',`${ball(78,95)}${ball(245,95)}${arrow(226,115,92,115)}${txt(160,155,'元の箇所へ戻す')}`),'風で動いても元の箇所へ無罰でリプレース。マークだけとは区別。')
 ],'グリーン上で止まっていた球が自然の力で動いた場合の比較です。バックスイング中に動いた場合などは本文の例外を確認。')
 };
 root.RuleGuideDetails={render:key=>details[key]?details[key]():''};
})(typeof window!=='undefined'?window:globalThis);
