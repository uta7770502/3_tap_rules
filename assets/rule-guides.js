/* High-resolution rule illustrations. No SVG or low-resolution fallback. */
(function (root) {
  'use strict';
  const version = '20260923-visuals3';
  const guides = {
    'ob-boundary': { image:'ob-boundary', title:'OBの境界は、球全体で判定', label:'球の一部でもコース内にあればOBではない', steps:['白杭だけの場合は、地表面での杭のコース側の点を結ぶ線が境界。白線の場合はコース側の縁が境界で、線自体はOB側。','球全体が境界の外にあればOB。球の一部でもコース内にあればOBではない。','コース内の球をOB側に立って打つことはできる。白杭を抜いたり動かしたりしてはいけない。'] },
    'tee-area': { image:'tee-area', title:'ティーイングエリアの範囲', label:'球の位置を確認。足はエリア外でもよい', steps:['指定された2つのティーマーカーの最も前方の点を結ぶ線が前縁。側縁はそれぞれのマーカーの外側。','後方2クラブレングスの長方形がエリア。携帯する最も長いクラブ（パターを除く）で測る。','球の一部がエリアに触れるか、その上にあればエリア内。区域外から打った場合の処置は競技形式によって異なるため本文を確認。'] },
    'cart-stance': { image:'cart-stance', title:'球は芝の上でも、足がカート道にかかる', label:'通常の構えで足に障害があれば、救済の対象', steps:['ジェネラルエリアの球で、通常のスタンスや意図するスイングに動かせない道路が干渉するか確認する。','ホールに近づかず、障害を完全に避けられる最も近い地点を基準点にする。好きな側を自由に選ぶことはできない。','基準点から1クラブレングス以内、ホールに近づかず、完全な救済が得られるジェネラルエリアへ無罰でドロップする。'] },
    'penalty-area': { image: 'red', title: 'ペナルティーエリアからの救済', label: 'まず、境界を横切った場所を確認', steps: ['最後に球が境界を横切った地点を確認する。', '赤・黄の境界に応じて、使える救済方法を選ぶ。', '救済を受ける場合は1罰打。そのまま打てる場合は無罰でプレーできる。'] },
    'red-penalty': { image: 'red', title: '赤杭・赤線からの救済', label: '赤い境界：横方向の救済も選べる', steps: ['球が最後に赤い境界を横切った地点を確認する。', '1罰打で、打ち直し・後方線上・ラテラル救済から選ぶ。', 'ラテラル救済は基準点から2クラブレングス以内。ホールに近づかず、エリアの外へ。'] },
    'yellow-penalty': { image: 'yellow', title: '黄杭・黄線からの救済', label: '黄色い境界：横2クラブの救済はない', steps: ['球が最後に黄色の境界を横切った地点を確認する。', '1罰打で、前の場所から打ち直すか、後方線上の救済を選ぶ。', '後方線上では、ホールと境界の横断点を結ぶ線を後ろへ延ばしてドロップする。'] },
    unplayable: { image: 'unplayable', title: 'アンプレヤブルの3つの選択肢', label: '木の根元など、打てないと判断したら', steps: ['1罰打で、前に打った場所から打ち直す。', 'または、ホールと元の球を結ぶ後方線上で救済を受ける。', 'または、元の球から2クラブレングス以内で、ホールに近づかない救済エリアへドロップ。'] },
    abnormal: { image: 'abnormal', title: '異常なコース状態からの救済', label: 'カート道などの障害を完全に避ける', steps: ['救済が認められる障害か確認する。', 'ホールに近づかず、障害を完全に避けられる最も近い地点を基準点にする。', 'ジェネラルエリアでは、基準点から1クラブレングス以内の救済エリアに無罰でドロップ。'] },
    embedded: { image: 'embedded', title: '地面にくい込んだ球の救済', label: '自分のピッチマークにくい込んだ球', steps: ['ジェネラルエリアで、球が自分のピッチマークにくい込んでいるか確認する。', '救済できる場合は、球のすぐ後ろの地点を基準にする。', '基準点から1クラブレングス以内、ホールに近づかない救済エリアへ無罰でドロップ。'] },
    'bunker-abnormal': { image: 'bunker', title: 'バンカー内の一時的な水', label: 'バンカー内と外で、罰が異なる', steps: ['無罰で救済を受ける場合は、バンカー内で救済エリアを決める。', '完全な救済ができない場合は、最大限の救済が得られる地点を確認する。', 'バンカー外を選ぶ場合は、1罰打で後方線上の救済を受ける。'] },
    'bunker-unplayable': { image: 'bunker', title: 'バンカーでアンプレヤブル', label: '外への後方線上救済は2罰打', steps: ['1罰打で、前の場所から打ち直すことができる。', '1罰打の後方線上・ラテラル救済では、バンカー内にドロップする。', 'バンカー外の後方線上救済を選ぶ場合は、合計2罰打。'] },
    'ob-lost': { image: 'ob', title: 'OB・紛失球の基本処置', label: '基本は、前に打った場所へ戻る', steps: ['OBまたは紛失球であることを確認する。', '1罰打を加え、直前にストロークした場所からプレーする。', '球があった場所のエリアに応じて、ティーアップ・ドロップ・プレースの方法を確認する。'] },
    'local-e5': { image: 'ob', title: 'E-5採用時の前進救済', label: 'ローカルルールの採用確認が先', steps: ['競技・コースでローカルルールE-5が採用されているか確認する。', '球の基準点とフェアウェイの基準点から、規定の救済エリアを特定する。', '適用できる場合に限り、2罰打でその救済エリアへドロップする。'] },
    'local-tee': { image: 'ob', title: '特設ティー・前進4打', label: 'E-5とは別の、コース独自の取り決め', steps: ['そのコースの掲示・ローカルルールを確認する。', '利用が任意か必須か、次が何打目かを確認する。', '指定された特設ティーと方法に従ってプレーする。'] },
    replace: { image: 'replace', title: '球を元の箇所へリプレース', label: 'ドロップせず、元の箇所へ置く', steps: ['元の箇所を確認する。分からない場合は推定する。', '規則に従い、球をその箇所に置いてリプレースする。', '球が動いた原因・拾い上げた理由に応じた罰を、本文で確認する。'] },
    'drop-method': { image: 'drop', title: '正しいドロップの方法', label: '立った状態の、膝の高さから', steps: ['適用する規則に従って、救済エリアを決める。', 'プレーヤー本人が、膝の高さから球を真下に落とす。', '球が救済エリアに落ち、その中に止まったことを確認する。'] },
    redrop: { image: 'drop', title: '救済エリアの外に止まったら', label: '再ドロップ → それでも外ならプレース', steps: ['正しくドロップした球が救済エリアの外に止まったら、再ドロップする。', '2回目も外に止まったら、2回目に球が最初に地面に触れた箇所を確認する。', 'その箇所に球をプレースする。'] }
  };
  Object.assign(guides, {
    'wrong-green': {image:'wrong-green',title:'目的外グリーンからの救済',label:'球だけでなく、足・スイングも確認',steps:['プレー中のホールとは別のグリーンへの干渉を確認。','そのまま打たず、同じコース区域内で完全救済の基準点を決める。','ホールに近づかず1クラブレングス以内の救済エリアに無罰でドロップ。']},
    'double-hit': {image:'double-hit',title:'偶然の二度打ち',label:'1回のスイング中なら、追加罰なし・1打',steps:['同じ1回のストローク中の偶然の複数接触か確認。','該当する場合は1打だけを数える。','球が止まった場所から続ける。故意の別ストロークとは区別。']},
    'drop-contact': {image:'drop',title:'ドロップした球が靴に当たった',label:'地面に触れる前と後で、処置が変わる',steps:['地面に触れる前の接触なら正しくドロップし直す。','地面に触れた後の偶然の接触なら、止まった場所で判断。','救済エリア外に止まったら再ドロップの手順を確認。']},
    'wind-green': {image:'wind-green',title:'グリーン上で風に動かされた球',label:'「マークしただけ」と「拾って戻した後」は別',steps:['風など自然の力で動いたか確認。','すでに拾ってリプレースしていたら、元の箇所へ戻す。','まだ拾って戻していなければ、原則として新しい箇所から。']}
  });
  const detailKeys = {'cart-stance':'nearest',abnormal:'nearest','penalty-area':'penalty','red-penalty':'penalty','yellow-penalty':'penalty',redrop:'redrop','bunker-unplayable':'bunker','wrong-green':'wrong-green','double-hit':'double-hit','drop-contact':'drop-contact',embedded:'embedded','wind-green':'wind-green'};
  // IDs are scoped to the dataset. Exceptions must not be chosen by a word
  // appearing only in explanatory text (e.g. unplayable inside a penalty area).
  const standard = {
    'wrong-green':[156,203], 'double-hit':[127], 'wind-green':[47],
    'ob-boundary':[109,182,183], 'tee-area':[2,3,107,139], 'cart-stance':[191],
    'penalty-area':[25,116,189], 'red-penalty':[69,110,185,186,187],
    'yellow-penalty':[70,171,172,173,174,175,176,177],
    unplayable:[24,66,113,124,192], abnormal:[59,60,114,115,159,178,179,180,181,194,201,204],
    embedded:[141,163], 'bunker-abnormal':[65], 'bunker-unplayable':[164],
    'ob-lost':[5,67,68,108,188,205], 'local-e5':[166], 'local-tee':[6,206,207],
    replace:[16,26,27,46,49,55,77,78,79,103,104,112,129,134,162,193,197,199],
    'drop-method':[195], redrop:[196]
  };
  const competition = {
    'double-hit':[154], 'drop-contact':[244,245], 'wind-green':[93,148],
    'ob-boundary':[78,166,208], 'tee-area':[52], 'cart-stance':[183],
    'penalty-area':[14], 'red-penalty':[70,187], 'yellow-penalty':[71],
    unplayable:[17,40,192,193], abnormal:[12], embedded:[13,124,185],
    'bunker-unplayable':[74,191], 'ob-lost':[15,39], 'local-e5':[122,215],
    replace:[63,177], 'drop-method':[11,64,96,174,178,247], redrop:[65]
  };
  function select(rule, mode) {
    const table = mode === 'competition' ? competition : standard;
    return Object.keys(table).find(key => table[key].includes(Number(rule.id))) || null;
  }
  function render(container, rule, mode) {
    const key = select(rule, mode);
    if (!key) { container.hidden = true; return; }
    const guide = guides[key];
    container.classList.add('rule-guide');
    container.dataset.guide = key;
    container.replaceChildren();
    const heading = document.createElement('h2');
    heading.textContent = '処置を図で確認';
    const title = document.createElement('h3');
    title.textContent = guide.title;
    const figure = document.createElement('figure');
    const image = document.createElement('img');
    image.src = `assets/drop-guides/${guide.image}-hd.${guide.ext || 'webp'}?v=${version}`;
    image.alt = `${guide.title}：青いポロシャツ・白いキャップのゴルファーによる場面イラスト`;
    image.width = 1536; image.height = 1024;
    image.decoding = 'async';
    const caption = document.createElement('figcaption');
    caption.textContent = guide.label;
    const scene = document.createElement('div');
    scene.className = 'rule-guide-scene';
    scene.dataset.scene = guide.image;
    scene.append(image);
    const labels = {
      'ob-boundary':'球全体で判定', 'tee-area':'球と足の位置を区別', 'cart-stance':'球は芝・足は道路',
      red: '赤い境界', yellow: '黄色い境界', unplayable: '元の球の位置を確認',
      abnormal: '障害を完全に避ける', embedded: '自分のピッチマーク',
      bunker: 'バンカー内・外を確認', ob: '白杭はOBの境界',
      replace: '元の箇所へ置く', drop: '膝の高さから真下へ'
    };
    const callout = document.createElement('span');
    callout.className = 'rule-guide-callout';
    callout.textContent = labels[guide.image] || guide.label;
    scene.append(callout);
    if (guide.image === 'drop') {
      const arrow = document.createElement('span');
      arrow.className = 'rule-guide-drop-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      scene.append(arrow);
    }
    figure.append(scene, caption);
    const steps = document.createElement('ol');
    steps.className = 'rule-guide-steps';
    guide.steps.forEach(text => { const li = document.createElement('li'); li.textContent = text; steps.append(li); });
    const note = document.createElement('p');
    note.className = 'rule-guide-note';
    note.textContent = '図は場面のイメージです。このケースの条件・例外・罰は、本文の処置方法とあわせて確認してください。';
    image.addEventListener('error', () => {
      figure.hidden = true;
      note.textContent = '図を読み込めませんでした。処置手順と本文を確認してください。';
    }, { once: true });
    container.append(heading, title, figure);
    const detail = document.createElement('div');
    detail.className = 'rule-guide-detail';
    if (key === 'ob-boundary') {
      detail.innerHTML = '<h4>真上から見た判定例</h4><div class="boundary-examples">' + [
        ['inside','コース内','球全体が内側'], ['crossing','コース内','球の一部が内側'], ['outside','OB','球全体が外側']
      ].map(([c,result,caption]) => `<div class="boundary-example"><div class="boundary-map ${c}" role="img" aria-label="${caption}：${result}"><span class="course-word">コース内</span><span class="ob-word">OB側</span><i class="example-ball"></i></div><strong>${result}</strong><p>${caption}</p></div>`).join('') + '</div><p>緑とベージュの境目が境界。杭・白線そのものではなく、境界と球の位置関係を示しています。</p>';
    } else if (key === 'tee-area') {
      detail.innerHTML = '<h4>上から見た範囲（模式図）</h4><div class="tee-map" role="img" aria-label="ホール方向は上。2つのマーカーの前縁から後方2クラブレングスの長方形がティーイングエリア"><span class="hole-direction">↑ ホール方向</span><div class="tee-rectangle"><i class="tee-marker left"></i><i class="tee-marker right"></i><span>ティーイング<br>エリア</span><b>後方2クラブ<br>レングス</b></div></div><p>長方形の範囲で球の位置を確認。スタンスは外側でも構いません。</p>';
    } else if (key === 'cart-stance') {
      detail.innerHTML = '<h4>救済前 → 救済後の確認</h4><div class="stance-check"><p><strong>救済前</strong><br>球は芝の上でも、通常の構えで足が道路にかかる。</p><p><strong>救済後</strong><br>球・足・スイングのすべてで、道路の障害がなくなる位置へ。</p></div><p>ペナルティーエリア内の球や、不合理な構えだけで生じる障害などは対象外。ローカルルールも確認してください。</p>';
    }
    if (root.RuleGuideDetails && detailKeys[key]) detail.innerHTML = root.RuleGuideDetails.render(detailKeys[key]);
    if (detail.childNodes.length) {
      const refs = {nearest:16,penalty:17,redrop:14,bunker:19,'wrong-green':13,'double-hit':10,'drop-contact':14,embedded:16,'wind-green':13};
      if (refs[detailKeys[key]]) { const source = document.createElement('a'); source.href = 'https://www.randa.org/en/rog/the-rules-of-golf/rule-' + refs[detailKeys[key]]; source.textContent = '根拠：R&A公式規則 ' + refs[detailKeys[key]] + '（英語）'; source.target = '_blank'; source.rel = 'noopener noreferrer'; detail.append(source); }
      container.append(detail);
    }
    container.append(steps, note);
    container.hidden = false;
  }
  const api = { guides, standard, competition, select, render, version };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RuleGuides = api;
})(typeof window !== 'undefined' ? window : globalThis);
