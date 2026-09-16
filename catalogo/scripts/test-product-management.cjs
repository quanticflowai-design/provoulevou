const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async()=>{
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:390,height:844}});
page.on('pageerror',e=>{throw e});
await page.setContent(fs.readFileSync('index.html','utf8').replace(/<script[\s\S]*?<\/script>/g,''));
await page.addStyleTag({content:fs.readFileSync('styles.css','utf8')});
const src=fs.readFileSync('app.js','utf8');
await page.evaluate(src=>{
window.$=s=>document.querySelector(s);window.$$=s=>Array.from(document.querySelectorAll(s));
Object.assign(window,{SB_URL:'https://test',SB_ANON:'anon',sessao:{token:'owner'},storeRow:{id:'store'},STORE_SLUG:'demo',
MAX_FOTOS_PRODUTO:5,WH_ADD_IMAGE:'image',WH_DEL_PRODUCT:'delete',adminCategoriasSelecionadas:[],catalog:[]});
window.ehDono=()=>true;window.renderTema=window.renderAdminCategorias=window.renderOrdemCategorias=()=>{};
window.toast=x=>{window.lastToast=x};window.novoRequestId=()=>String(Math.random());window.normalizaCategorias=x=>x.filter(Boolean);
window.numeroPositivo=x=>Number(x)>0;window.temOferta=p=>p.price>0&&p.originalPrice>p.price;
window.precoProduto=p=>p.price||p.originalPrice;window.brl=x=>'R$ '+x;window.bindImg=(e,u)=>{e.src=u||''};
window.linkProduto=()=>'';window.compressImage=async()=> 'ZmFrZQ==';
window.save=window.renderCatalog=()=>{};window.loadCatalog=async()=>{};
window.adicionaCategoriaDigitada=()=>{};
window.mapCatalogRows=rows=>rows.map(p=>({id:p.id,name:p.name,active:p.is_active,featured:p.is_featured,price:p.price,originalPrice:p.original_price,desc:p.description,
cats:p.categories||[],parcelas:p.parcelas,installmentInterestRate:p.installment_interest_rate,
img:(p.pl_catalog_product_images[0]||{}).url,imgIds:p.pl_catalog_product_images.map(i=>i.id),
imageMeta:p.pl_catalog_product_images.map(i=>({id:i.id,url:i.url,variantName:i.variant_name}))}));
window.rows=[];window.calls=[];
window.fetch=async(url,opt)=>{
const {p_action:a,p_data:d}=JSON.parse(opt.body);calls.push({a,d});
let result;
if(a==='list')result=rows;
if(a==='stage'){const r={id:'p'+rows.length,name:d.name,is_active:false,pl_catalog_product_images:[]};rows.push(r);result={id:r.id};}
if(a==='save'){const r=rows.find(x=>x.id===d.id);Object.assign(r,d);r.pl_catalog_product_images=d.images.map(im=>({...r.pl_catalog_product_images.find(i=>i.id===im.id),variant_name:im.variant_name}));result={id:r.id};}
if(a==='duplicate'){const r=JSON.parse(JSON.stringify(rows.find(x=>x.id===d.id)));r.id='copy';r.name+=' (cópia)';r.is_active=false;rows.push(r);result={id:r.id};}
if(a==='bulk'){for(const r of rows)if(d.ids.includes(r.id))Object.assign(r,d);result={count:d.ids.length};}
return {ok:true,json:async()=>result};
};
window.postJsonComRetry=async(url,data)=>{const r=rows.find(x=>x.id===data.product_id);r.pl_catalog_product_images.push({id:'i'+Math.random(),url:'data:image/jpeg;base64,ZmFrZQ==',variant_name:data.variant_name,client_request_id:data.request_id});return {ok:true}};
const start=src.indexOf("  let adminPhoto = '';",src.indexOf('// ─────────── Admin'));
eval(src.slice(start,src.indexOf('  // ─────────── Navegação (botões fixos)',start))+';window.qa={save:salvarProduto,edit:entraEdicao,render:renderAdmin,reset:saiEdicao};');
$('#screen-admin').style.display='block';
},src);
// A blank draft must save without a price or image and stay unpublished.
await page.evaluate(()=>qa.save(false));
assert.equal(await page.evaluate(()=>rows[0].is_active),false);
assert.equal(await page.locator('.ai-status').first().textContent(),'Rascunho');
// Populate draft with two named photos; choose second as cover before publication.
await page.evaluate(()=>qa.edit(mapCatalogRows(rows)[0]));
for(const name of ['Preto','Azul']){
await page.locator('#btn-add-variant').dispatchEvent('click');
await page.locator('#admin-variacoes-lista input[type=text]').last().fill(name,{force:true});
await page.locator('#admin-variacoes-lista input[type=file]').last().setInputFiles({name:'photo.jpg',mimeType:'image/jpeg',buffer:Buffer.from('image')});
await page.waitForTimeout(80);
}
await page.locator('.variant-order').nth(1).locator('button').first().dispatchEvent('click');
await page.evaluate(()=>{$('#admin-name').value='Armação';$('#admin-original-price').value='99,90';$('#admin-featured').checked=true;});
await page.evaluate(()=>qa.save(true));
assert.equal(await page.evaluate(()=>rows[0].is_active),true);
assert.equal(await page.evaluate(()=>rows[0].pl_catalog_product_images[0].variant_name),'Azul');
assert.equal(await page.evaluate(()=>rows[0].is_featured),true);
await page.locator('.ai-duplicate').first().dispatchEvent('click');await page.waitForTimeout(100);
assert.equal(await page.evaluate(()=>rows.length),2);
assert.equal(await page.evaluate(()=>rows[1].is_active),false);
assert.equal(await page.locator('#admin-name').inputValue(),'Armação (cópia)');
assert.equal(await page.locator('.admin-variacao').count(),2);
// Batch requires explicit review; only checked field is sent.
await page.locator('#bulk-all').dispatchEvent('click');
await page.evaluate(()=>{$('#bulk-all').checked=true;$('#bulk-all').dispatchEvent(new Event('change'));$('#bulk-featured').value='false'});
page.once('dialog',d=>d.accept());
await page.locator('#bulk-apply').dispatchEvent('click');await page.waitForTimeout(100);
const bulk=await page.evaluate(()=>calls.filter(x=>x.a==='bulk').at(-1).d);
assert.equal(bulk.ids.length,2);assert.equal(bulk.is_featured,false);assert(!('price' in bulk));
await page.screenshot({path:path.join(require('os').tmpdir(),'catalog-product-management.png'),fullPage:true});
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=390),'Mobile overflow');
console.log('PASS browser: incomplete draft, publication, variant cover, highlight, duplicate draft, bulk review, mobile width');
await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
