// Fixed article promotions were replaced by contextual slots. Keep the index
// card contract here and run the article-serving suite for current behaviour.
'use strict';
const assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
const promo=require('../js/blog-fiere-promo.js'),markup=require('../js/blog-markup.js');
const doc=new JSDOM(promo.card({slug:'',title:''},'index',markup.regions)).window.document;
assert.equal(doc.querySelectorAll('[data-fiere-promo="index"]').length,1);
assert.equal(doc.querySelector('[data-fiere-cta]').getAttribute('href'),'/fiere');
assert.match(doc.querySelector('.bfp-title').textContent,/5\.000/);
assert.equal(promo.context({title:'Fiere in Lombardia',slug:'fiere-lombardia'},markup.regions).region,'Lombardia');
assert.equal(promo.context({title:'Fiere sul Garda',slug:'fiere-garda'},markup.regions).region,null);
console.log('Legacy index card: preserved; articles use contextual ADS.');
if(!process.env.CONTEXTUAL_ADS_QA_DIR&&process.env.BLOG_FIERE_QA_DIR)process.env.CONTEXTUAL_ADS_QA_DIR=process.env.BLOG_FIERE_QA_DIR;
if(!process.env.CONTEXTUAL_ADS_POSTS&&process.env.BLOG_FIERE_POSTS)process.env.CONTEXTUAL_ADS_POSTS=process.env.BLOG_FIERE_POSTS;
require('./test-contextual-ads.cjs');
