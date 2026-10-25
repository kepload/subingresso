'use strict';
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),folder=path.join(root,'images/personal-ads');
(async()=>{
 execFileSync(process.execPath,[path.join(__dirname,'build-contextual-ads.cjs')],{cwd:root,stdio:'inherit'});
 execFileSync('python',[path.join(__dirname,'build-personal-ads.py')],{cwd:root,stdio:'inherit'});
 for(const file of fs.readdirSync(folder).filter(file=>file.endsWith('.svg')&&!file.endsWith('.animated.svg'))){
  const scale=file.includes('-1080x')?1:2;
  await sharp(path.join(folder,file),{density:72*scale}).png({compressionLevel:9,palette:false}).toFile(path.join(folder,file.replace('.svg','.png')));
 }
 console.log('PNG a colori pieni pronti: web 2×, social nativi; SVG statici e animati vettoriali.');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
