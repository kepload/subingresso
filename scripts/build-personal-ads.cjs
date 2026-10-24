'use strict';
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),folder=path.join(root,'images/personal-ads');
(async()=>{
 execFileSync('python',[path.join(__dirname,'build-personal-ads.py')],{cwd:root,stdio:'inherit'});
 for(const file of fs.readdirSync(folder).filter(file=>file.endsWith('.svg'))){
  await sharp(path.join(folder,file)).png({compressionLevel:9,palette:true}).toFile(path.join(folder,file.replace('.svg','.png')));
 }
 console.log('PNG pronti, stesse dimensioni e stessi tracciati degli SVG.');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
