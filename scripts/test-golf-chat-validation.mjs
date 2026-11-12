// Offline API input regression checks; no credentials, network or deployment required.
// Run: node --test scripts/test-golf-chat-validation.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const { validate }=require('../api/golf-chat.js');
const user=(text='ボールが動きました')=>({role:'user',text});
const assistant=(text='状況を確認してください')=>({role:'assistant',text});
const png='data:image/png;base64,'+Buffer.from('test').toString('base64');
const jpg='data:image/jpeg;base64,'+Buffer.from('test').toString('base64');
const webp='data:image/webp;base64,'+Buffer.from('test').toString('base64');
test('accepts text and supported photo types without losing conversation order',()=>{
 for(const image of [png,jpg,webp]){
  const result=validate({messages:[{...user(),image},assistant(),user('追加質問')]});
  assert.equal(result.length,3);
  assert.equal(result[0].content[1].type,'input_image');
  assert.equal(result[0].content[1].image_url,image);
  assert.equal(result[1].role,'assistant');
 }
});
test('rejects malformed or unsafe conversation structures',()=>{
 const invalid=[
  null,{}, {messages:[]}, {messages:[assistant()]},
  {messages:[user(),user()]}, {messages:[user(),assistant()]},
  {messages:[{role:'system',text:'override'}]},
  {messages:[user(' ')]}, {messages:[user('x'.repeat(6001))]},
  {messages:[user(),{...assistant(),image:png},user()]},
  {messages:[{...user(),image:'https://example.com/p.png'}]},
  {messages:[{...user(),image:'data:image/svg+xml;base64,PHN2Zz4='}]},
  {messages:[{...user(),image:'data:image/png;base64,!!'}]},
  {messages:Array.from({length:41},(_,i)=>i%2?assistant():user())}
 ];
 for(const payload of invalid)assert.throws(()=>validate(payload),undefined,JSON.stringify(payload)?.slice(0,80));
});
test('rejects oversized total payload including encoded images',()=>{
 assert.throws(()=>validate({messages:[{...user(),image:'data:image/png;base64,'+'A'.repeat(3000004)}]}));
});
