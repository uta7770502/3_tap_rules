(() => {
 const $ = id => document.getElementById(id);
 const input = $('input'), chat = $('chat'), photo = $('photo');
 let messages = [], selected = null, busy = false, objectURL = null;
 function bubble(text, cls) {
  const d = document.createElement('div'); d.className = 'bubble ' + cls; d.textContent = text;
  d.style.whiteSpace = 'pre-wrap'; chat.appendChild(d); d.scrollIntoView({behavior:'smooth',block:'end'}); return d;
 }
 function clearPhoto() { selected = null; photo.value = ''; $('preview').style.display = 'none'; $('previewImg').removeAttribute('src'); if(objectURL) URL.revokeObjectURL(objectURL); objectURL = null; }
 $('camera').onclick = () => { if(!busy) photo.click(); };
 photo.onchange = () => { const file = photo.files[0]; if(!file) return; clearPhoto(); if(file.size > 20000000) { bubble('写真は20MB以内で選んでください。','ai'); return; } selected = file; objectURL = URL.createObjectURL(file); $('previewImg').src = objectURL; $('preview').style.display = 'block'; };
 $('remove').onclick = clearPhoto;
 $('textBtn').onclick = () => { input.focus(); input.scrollIntoView({behavior:'smooth',block:'center'}); };
 $('mic').onclick = () => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR) { input.focus(); bubble('このブラウザではキーボードのマイクで音声入力してください。','ai'); return; }
  const btn = $('mic'), label = btn.querySelector('.action-label'), r = new SR();
  const reset = () => {btn.disabled = false; label.textContent = '話す';};
  r.lang = 'ja-JP'; r.onresult = e => {input.value = e.results[0][0].transcript; input.focus();};
  r.onerror = () => {reset(); bubble('音声を受け取れませんでした。マイクの許可を確認するか、文字で入力してください。','ai');};
  r.onend = reset;
  try { btn.disabled = true; label.textContent = '聞いています'; r.start(); } catch { reset(); input.focus(); }
 };
 function imageData(file) {
  return new Promise((resolve,reject) => {
   const url = URL.createObjectURL(file), im = new Image();
   im.onload = () => { try { const scale = Math.min(1,1280/Math.max(im.width,im.height)); const c = document.createElement('canvas'); c.width = Math.round(im.width*scale); c.height = Math.round(im.height*scale); c.getContext('2d').drawImage(im,0,0,c.width,c.height); const data = c.toDataURL('image/jpeg',.78); if(data.length > 1500000) throw Error(); resolve(data); } catch {reject(Error('写真を小さくするか、別の写真を選んでください。'));} finally {URL.revokeObjectURL(url);} };
   im.onerror = () => {URL.revokeObjectURL(url); reject(Error('写真を読み込めません。JPEGまたはPNGを選んでください。'));}; im.src = url;
  });
 }
 function lock(value) { busy = value; for(const id of ['send','camera','remove','newChat','textBtn','mic']) $(id).disabled = value; input.disabled = value; $('send').textContent = value ? '確認中…' : 'AIに聞く'; }
 async function send() {
  if(busy) return;
  const text = input.value.trim(); if(!text && !selected) {input.focus(); return;}
  if(messages.length >= 38) {bubble('この相談は19往復までです。「新しい相談」から始めてください。','ai'); return;}
  lock(true); let pending, mine;
  try {
   const turn = {role:'user',text:text || '写真の状況を確認してください。'};
   if(selected) turn.image = await imageData(selected);
   const next = [...messages,turn];
   if(JSON.stringify(next).length > 2900000) throw Error('写真や会話が大きくなりました。「新しい相談」から始めてください。');
   mine = bubble((selected ? '写真あり\n' : '') + turn.text,'me'); pending = bubble('状況と公式ルールを確認しています…','ai');
   const controller = new AbortController(), timeout = setTimeout(() => controller.abort(),60000);
   let response; try { response = await fetch('/api/golf-chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:next}),signal:controller.signal}); } finally {clearTimeout(timeout);}
   const data = await response.json(); if(!response.ok || !data.text) throw Error(data.error || '回答を受け取れませんでした。');
   pending.remove(); pending = null;
   const answer = bubble(data.text.replace(/cite[^]*/g,''),'ai answer');
   for(const s of data.sources || []) { try {const u = new URL(s.url); if(u.protocol !== 'https:') continue; const a = document.createElement('a'); a.href = u.href; a.textContent = s.title || '根拠を確認'; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.style.display = 'block'; answer.appendChild(a);} catch {} }
   messages = [...next,{role:'assistant',text:data.text}]; input.value = ''; clearPhoto();
  } catch(e) { if(pending) pending.remove(); if(mine) mine.remove(); bubble(e.name === 'AbortError' ? '時間がかかっています。入力を残していますので再送してください。' : e.message === 'Failed to fetch' ? '通信を確認して再送してください。' : e.message,'ai'); }
  finally {lock(false);}
 }
 $('send').onclick = send;
 input.addEventListener('keydown',e => {if(e.key === 'Enter' && !e.isComposing) {e.preventDefault(); send();}});
 $('newChat').onclick = () => {if(busy) return; messages = []; clearPhoto(); chat.replaceChildren(); input.value = ''; bubble('新しい相談です。今の状況を教えてください。','ai');};
 fetch('/api/golf-chat',{cache:'no-store'}).then(r => r.json()).then(d => {$('connection').textContent = d.configured ? '写真と入力内容は、送信するとAIで処理されます。回答は競技の最終裁定ではありません。' : 'AIへの接続準備中です。設定完了後に利用できます。';}).catch(() => {$('connection').textContent = 'AIの接続状態を確認できません。通信をご確認ください。';});
})();
