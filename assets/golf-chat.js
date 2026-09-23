(() => {
 const $ = id => document.getElementById(id);
 const input = $('input'), chat = $('chat'), photo = $('photo');
 let messages = [], selected = null, busy = false, objectURL = null, configured = null;
 function bubble(text, cls) {
  const d = document.createElement('div'); d.className = 'bubble ' + cls; d.textContent = text;
  d.style.whiteSpace = 'pre-wrap'; chat.appendChild(d); d.scrollIntoView({behavior:'smooth',block:'end'}); return d;
 }
 function clearPhoto() { selected = null; photo.value = ''; $('preview').style.display = 'none'; $('previewImg').removeAttribute('src'); if(objectURL) URL.revokeObjectURL(objectURL); objectURL = null; }
 $('camera').onclick = () => { if(!busy) photo.click(); };
 photo.onchange = () => { const file = photo.files[0]; if(!file) return; clearPhoto(); if(file.size > 20000000) { bubble('写真は20MB以内で選んでください。','ai'); return; } selected = file; objectURL = URL.createObjectURL(file); $('previewImg').src = objectURL; $('preview').style.display = 'block'; };
 $('remove').onclick = clearPhoto;
 $('textBtn').onclick = () => { input.focus(); input.scrollIntoView({behavior:'smooth',block:'center'}); };
 let recognition = null, voiceTimer = null;
 const voiceStatus = document.createElement('p'); voiceStatus.className='hint'; voiceStatus.setAttribute('role','status'); voiceStatus.id='voiceStatus'; $('mic').closest('.actions').after(voiceStatus);
 function voiceMessage(text) {voiceStatus.textContent=text;}
 function stopVoice() {
  const old=recognition; recognition=null; clearTimeout(voiceTimer);
  $('mic').querySelector('.action-label').textContent='話す'; $('mic').setAttribute('aria-pressed','false');
  if(old) {old.onend=null; old.onerror=null; old.onresult=null; try {old.abort();} catch {}}
 }
 $('mic').onclick = () => {
  if(busy) return;
  if(recognition) {stopVoice(); voiceMessage('音声入力を停止しました。入力内容を確認して送信してください。'); return;}
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR) {input.focus(); voiceMessage('このブラウザは音声認識に対応していません。入力欄をタップし、iPhoneのキーボードのマイクで入力するか、Safariで開いてください。'); return;}
  let r, received=false;
  try {
   r=new SR(); recognition=r; r.lang='ja-JP'; r.continuous=false; r.interimResults=false;
   $('mic').querySelector('.action-label').textContent='停止'; $('mic').setAttribute('aria-pressed','true');
   voiceMessage('マイクの確認中です。許可が表示されたら許可してください。もう一度押すと停止できます。');
   r.onstart=()=>voiceMessage('聞いています。話し終わると入力欄に反映します。');
   r.onresult=e=>{const text=Array.from(e.results).map(x=>x[0].transcript).join(''); if(text.trim()){received=true; input.value=(input.value.trim() ? input.value.trim()+' ' : '')+text; voiceMessage('音声を入力しました。内容を確認して「AIに聞く」を押してください。'); input.focus();}};
   r.onerror=e=>{const kind=e.error; stopVoice(); const errors={
    'not-allowed':'マイクまたは音声認識が許可されていません。Safariのページメニューから、このWebサイトのマイク設定を確認して再試行してください。設定が見つからない場合はiPhoneのキーボードのマイクで入力できます。',
    'service-not-allowed':'このブラウザでは音声認識サービスを利用できません。Safariで開くか、キーボードのマイクで入力してください。',
    'audio-capture':'マイクを利用できません。ほかの録音・通話を終了し、マイクの許可を確認してください。',
    'no-speech':'音声が聞き取れませんでした。「話す」を押してもう一度お話しください。',
    'network':'音声認識の通信に失敗しました。通信を確認するか、文字で入力してください。',
    'aborted':'音声入力を停止しました。文字でも入力できます。'
   }; voiceMessage(errors[kind]||'音声入力に失敗しました。もう一度試すか、文字で入力してください。');};
   r.onend=()=>{stopVoice(); if(!received) voiceMessage('音声が入力されませんでした。もう一度「話す」を押すか、キーボードで入力してください。');};
   voiceTimer=setTimeout(()=>{stopVoice();voiceMessage('音声入力を終了しました。許可・通信を確認し、再試行するか文字で入力してください。');},30000);
   r.start();
  } catch {stopVoice(); voiceMessage('音声入力を開始できませんでした。Safariで開くか、入力欄のキーボードのマイクをご利用ください。'); input.focus();}
 };
 document.addEventListener('visibilitychange',()=>{if(document.hidden && recognition) {stopVoice();voiceMessage('画面を離れたため音声入力を停止しました。');}});
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
  if(configured === false) { $('connection').scrollIntoView({behavior:'smooth',block:'center'}); return; }
  const text = input.value.trim(); if(!text && !selected) {input.focus(); return;}
  if(messages.length >= 38) {bubble('この相談は19往復までです。「新しい相談」から始めてください。','ai'); return;}
  if(text.length > 6000) {bubble('1回の質問は6000文字以内で入力してください。','ai'); return;}
  stopVoice(); lock(true); let pending, mine;
  try {
   const turn = {role:'user',text:text || '写真の状況を確認してください。'};
   if(selected) turn.image = await imageData(selected);
   const next = [...messages,turn];
   if(JSON.stringify(next).length > 2900000) throw Error('写真や会話が大きくなりました。「新しい相談」から始めてください。');
   mine = bubble((selected ? '写真あり\n' : '') + turn.text,'me'); pending = bubble('状況と公式ルールを確認しています…','ai');
   const controller = new AbortController(), timeout = setTimeout(() => controller.abort(),60000);
   let response; try { response = await fetch('/api/golf-chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:next}),signal:controller.signal}); } finally {clearTimeout(timeout);}
   const data = await response.json(); if(response.status === 503) {configured=false; $('connection').textContent='AIはまだ接続されていません。入力は保存されています。運営側の設定完了後に接続を再確認してください。'; retryConnection.hidden=false;} if(!response.ok || !data.text) throw Error(data.error || '回答を受け取れませんでした。');
   pending.remove(); pending = null;
   const answer = bubble(data.text.replace(/cite[^]*/g,''),'ai answer');
   for(const s of data.sources || []) { try {const u = new URL(s.url); if(u.protocol !== 'https:') continue; const a = document.createElement('a'); a.href = u.href; a.textContent = s.title || '根拠を確認'; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.style.display = 'block'; answer.appendChild(a);} catch {} }
   messages = [...next,{role:'assistant',text:data.text}]; input.value = ''; clearPhoto();
  } catch(e) { if(pending) pending.remove(); if(mine) mine.remove(); bubble(e.name === 'AbortError' ? '時間がかかっています。入力を残していますので再送してください。' : e.message === 'Failed to fetch' ? '通信を確認して再送してください。' : e.message,'ai'); }
  finally {lock(false);}
 }
 $('send').onclick = send;
 input.addEventListener('keydown',e => {if(e.key === 'Enter' && !e.isComposing) {e.preventDefault(); send();}});
 $('newChat').onclick = () => {if(busy) return; stopVoice(); voiceMessage(''); messages = []; clearPhoto(); chat.replaceChildren(); input.value = ''; bubble('新しい相談です。今の状況を教えてください。','ai');};
 const retryConnection=document.createElement('button'); retryConnection.type='button'; retryConnection.className='remove'; retryConnection.textContent='接続を再確認'; retryConnection.hidden=true; $('connection').after(retryConnection);
 async function checkConnection() {
  retryConnection.disabled=true;
  const controller=new AbortController(), timeout=setTimeout(()=>controller.abort(),8000);
  try {const response=await fetch('/api/golf-chat',{cache:'no-store',signal:controller.signal}); if(!response.ok) throw Error(); const data=await response.json(); if(typeof data.configured!=='boolean') throw Error(); configured=data.configured;
   $('connection').textContent=configured ? '写真と入力内容は、送信するとAIで処理されます。回答は競技の最終裁定ではありません。' : 'AIはまだ接続されていません。運営側の設定完了後に「接続を再確認」を押してください。入力や写真は準備できます。';
   retryConnection.hidden=configured;
  } catch {configured=null; $('connection').textContent='AIの接続状態を確認できません。通信を確認し、再確認または再送してください。'; retryConnection.hidden=false;}
  finally {clearTimeout(timeout);retryConnection.disabled=false;}
 }
 retryConnection.onclick=checkConnection; checkConnection();
})();
