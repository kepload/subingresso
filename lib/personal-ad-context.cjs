'use strict';
const allowed=new Set(['article_slug','article_region','creative_version','device_class','source','referrer_type','topics','keywords','priority_matches','selection_weight','match_basis','engine_version','candidate_count','post_rule_revision','ad_rule_revision','article_published_at','visible_ms','page_ms','scroll_percent','motion']);
module.exports=function context(query={},headers={}){
 let value={};try{if(typeof query.ctx==='string'&&query.ctx.length<=4096){const parsed=JSON.parse(query.ctx);if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed)&&Object.keys(parsed).every(k=>allowed.has(k)))value=parsed;}}catch(_){}
 // Referrer fallback reads only the own blog slug; full URLs never reach the database.
 try{const ref=new URL(headers.referer||headers.referrer||'');if(['subingresso.it','www.subingresso.it'].includes(ref.hostname)&&ref.pathname==='/blog'&&!value.article_slug){const slug=ref.searchParams.get('post');if(/^[a-z0-9-]{1,200}$/.test(slug||''))value.article_slug=slug;}}catch(_){}
 if(value.article_slug)value.source='blog';return value;
};
