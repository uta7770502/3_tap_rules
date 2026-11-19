// Offline API input regression checks; no credentials, network or deployment required.
// Run: node --test scripts/test-golf-chat-validation.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const { validate }=require('../api/golf-chat.js');
const user=(text='ボールが動きました')=>({role:'user',text});
const assistant=(text='状況を確認してください')=>({role:'assistant',text});
// Minimal signature-and-dimension fixtures: validate() checks container metadata,
// not pixel decoding. Never use arbitrary text pretending to be an image.
const pngBytes=Buffer.alloc(24);
Buffer.from([137,80,78,71,13,10,26,10]).copy(pngBytes);
pngBytes.write('IHDR',12,'ascii');
pngBytes.writeUInt32BE(1,16); pngBytes.writeUInt32BE(1,20);
const png='data:image/png;base64,'+pngBytes.toString('base64');
const jpgBytes=Buffer.from([0xff,0xd8,0xff,0xc0,0x00,0x11,0x08,0x00,0x01,0x00,0x01,0x03,0x01,0x11,0x00,0x02,0x11,0x00,0x03,0x11,0x00]);
const jpg='data:image/jpeg;base64,'+jpgBytes.toString('base64');
const webpBytes=Buffer.alloc(30);
webpBytes.write('RIFF',0,'ascii'); webpBytes.writeUInt32LE(22,4);
webpBytes.write('WEBPVP8X',8,'ascii'); webpBytes.writeUInt32LE(10,16);
const webp='data:image/webp;base64,'+webpBytes.toString('base64');
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
  {messages:[{...user(),image:'data:image/png;base64,A'}]},
  {messages:[{...user(),image:'data:image/png;base64,AAAA='}]},
  {messages:Array.from({length:41},(_,i)=>i%2?assistant():user())}
 ];
 for(const payload of invalid)assert.throws(()=>validate(payload),undefined,JSON.stringify(payload)?.slice(0,80));
});
test('rejects oversized total payload including encoded images',()=>{
 assert.throws(()=>validate({messages:[{...user(),image:'data:image/png;base64,'+'A'.repeat(3000004)}]}));
});

test('rejects forged MIME types and impossible image dimensions',()=>{
 const pngOversized=Buffer.from(pngBytes);
 pngOversized.writeUInt32BE(9000,16);
 const pngZero=Buffer.from(pngBytes);
 pngZero.writeUInt32BE(0,20);
 const jpgOversized=Buffer.from(jpgBytes);
 jpgOversized.writeUInt16BE(9000,7);
 const webpOversized=Buffer.from(webpBytes);
 webpOversized[24]=0xff; webpOversized[25]=0xff; webpOversized[26]=0xff;
 const invalid=[
  'data:image/jpeg;base64,'+pngBytes.toString('base64'),
  'data:image/png;base64,'+jpgBytes.toString('base64'),
  'data:image/png;base64,'+pngOversized.toString('base64'),
  'data:image/png;base64,'+pngZero.toString('base64'),
  'data:image/jpeg;base64,'+jpgOversized.toString('base64'),
  'data:image/webp;base64,'+webpOversized.toString('base64')
 ];
 for(const image of invalid)assert.throws(()=>validate({messages:[{...user(),image}]}),undefined,image.slice(0,40));
});
test('limits a single conversation to three photos',()=>{
 const messages=[
  {...user(),image:png},assistant(),{...user(),image:png},assistant(),
  {...user(),image:png},assistant(),{...user(),image:png}
 ];
 assert.throws(()=>validate({messages}));
});
