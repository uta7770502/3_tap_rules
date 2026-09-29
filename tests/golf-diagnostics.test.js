const { test } = require('node:test');
const assert = require('node:assert/strict');
const handler = require('../api/golf-chat');
const response = () => ({setHeader(){}, status(n){this.code=n;return this;}, json(data){this.data=data;return this;}});
test('diagnostics classify failures without exposing keys, requests, or upstream messages', async () => {
  const original = {fetch:global.fetch, error:console.error, key:process.env.OPENAI_API_KEY};
  const logs=[];
  process.env.OPENAI_API_KEY='sk-secret-key-never-log';
  console.error = value => logs.push(value);
  const req={method:'POST',headers:{},body:{messages:[{role:'user',text:'private-question',image:'data:image/jpeg;base64,cHJpdmF0ZQ=='}]}};
  try {
    const cases=[
      [401,'invalid_api_key','authentication',502], [403,null,'permission',502],
      [429,'insufficient_quota','quota',429], [429,'rate_limit_exceeded','rate_limit',429],
      [400,'unsupported_parameter','request',502], [404,'model_not_found','request',502],
      [500,null,'upstream',502], [502,null,'upstream',502]
    ];
    for (const [status,code,category,http] of cases) {
      global.fetch=async()=>({ok:false,status,json:async()=>({error:{code,type:'invalid_request_error',param:'tools',message:'sk-secret-key-never-log private-question'}})});
      const r=response(); await handler(req,r);
      assert.equal(r.code,http); assert.equal(r.data.code,`AI_${category.toUpperCase()}`);
      const log=JSON.parse(logs.at(-1)); assert.equal(log.category,category); assert.equal(log.upstreamStatus,status);
      assert.equal(log.diagnosticId,r.data.diagnosticId); assert.match(r.data.error,/診断ID/);
      assert.ok(!r.data.error.includes('sk-secret'));
    }
    global.fetch=async()=>({ok:false,status:400,json:async()=>({error:{code:'sk-secret-key-never-log',type:'private-question',param:'cHJpdmF0ZQ=='}})});
    await handler(req,response());
    assert.equal(JSON.parse(logs.at(-1)).upstreamCode,'unknown');
    global.fetch=async()=>({ok:false,status:502,json:async()=>{throw Error('private-question');}});
    let r=response(); await handler(req,r); assert.equal(r.data.code,'AI_UPSTREAM');
    for (const name of ['TimeoutError','AbortError','TypeError']) {
      global.fetch=async()=>{throw Object.assign(Error('sk-secret-key-never-log'),{name});};
      r=response(); await handler(req,r); assert.equal(r.data.code,name==='TypeError'?'AI_NETWORK':'AI_TIMEOUT');
    }
    for (const body of [{status:'incomplete',output:[]},{status:'completed',output:[]},null]) {
      global.fetch=async()=>({ok:true,json:async()=>body});
      r=response();await handler(req,r);assert.equal(r.data.code,'AI_RESPONSE');
    }
    global.fetch=async()=>({ok:true,json:async()=>{throw Error('not json');}});
    r=response();await handler(req,r);assert.equal(r.data.code,'AI_RESPONSE');
    r=response();await handler({method:'GET'},r);assert.equal(r.data.configured,true);assert.equal(r.data.version,'2026-09-29-search-recovery-1');
    delete process.env.OPENAI_API_KEY;
    r=response();await handler({method:'GET'},r);assert.equal(r.data.configured,false);
    const allLogs=logs.join('\n');
    for (const secret of ['sk-secret-key-never-log','private-question','cHJpdmF0ZQ==']) assert.ok(!allLogs.includes(secret));
    assert.equal(new Set(logs.map(x=>JSON.parse(x).diagnosticId)).size,logs.length);
  } finally {
    global.fetch=original.fetch;console.error=original.error;
    if(original.key===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=original.key;
  }
});

