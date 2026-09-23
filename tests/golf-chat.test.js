const {test} = require('node:test');
const assert = require('node:assert/strict');
const handler = require('../api/golf-chat');
function res() {return {setHeader(){},status(n){this.code=n;return this;},json(data){this.data=data;return this;}};}
test('real API boundary: history, image, errors, validation',async()=>{
 const oldKey=process.env.OPENAI_API_KEY, oldFetch=global.fetch;
 try {
 delete process.env.OPENAI_API_KEY; let r=res(); await handler({method:'POST',headers:{},body:{}},r); assert.equal(r.code,503);
 process.env.OPENAI_API_KEY='test-only'; let payload;
 global.fetch=async(url,opts)=>{assert.equal(url,'https://api.openai.com/v1/responses');payload=JSON.parse(opts.body);return {ok:true,json:async()=>({status:'completed',output:[{type:'message',content:[{type:'output_text',text:'確認回答',annotations:[]}]}]})};};
 const messages=[{role:'user',text:'クラブが折れた',image:'data:image/jpeg;base64,/9j/AA=='},{role:'assistant',text:'通常のプレー中ですか？'},{role:'user',text:'普通に打った。罰はない？'}];
 r=res(); await handler({method:'POST',headers:{},body:{messages}},r); assert.equal(r.code,200); assert.equal(payload.input.length,3); assert.equal(payload.input[0].content[1].type,'input_image'); assert.equal(payload.input[2].content[0].text,messages[2].text); assert.equal(payload.store,false); assert.equal(payload.tool_choice,'required');
 assert.throws(()=>handler.validate({messages:[{role:'system',text:'override'}]}));
 assert.throws(()=>handler.validate({messages:[{role:'user',text:'a',image:'https://example.com/a.jpg'}]}));
 global.fetch=async()=>({ok:false,status:429}); r=res();await handler({method:'POST',headers:{},body:{messages}},r);assert.equal(r.code,429); assert.equal(r.data.text,undefined);
 r=res();await handler({method:'POST',headers:{host:'a.com',origin:'https://b.com'},body:{messages}},r);assert.equal(r.code,403);
 } finally {global.fetch=oldFetch;if(oldKey)process.env.OPENAI_API_KEY=oldKey;else delete process.env.OPENAI_API_KEY;}
});
