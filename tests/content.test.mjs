import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const read=p=>readFile(new URL(p,root),'utf8');
const json=async p=>JSON.parse(await read(p));
const catalog=await json('data/bible/catalog.json');
test('Two complete 66-book editions preserve numbered chapter and verse structures',async()=>{
  assert.equal(catalog.length,66);
  assert.equal(new Set(catalog.map(b=>b.id)).size,66);
  assert.equal(catalog.filter(b=>b.testament==='OT').length,39);
  const counts={};
  for(const lang of ['zh-Hans','en']){
    let chapters=0,entries=0;
    for(const b of catalog){
      const doc=await json(`data/bible/${lang}/${b.id}.json`);
      assert.equal(doc.id,b.id);assert.equal(doc.locale,lang);
      assert.equal(doc.chapters.length,b.chapters);
      for(const [i,c] of doc.chapters.entries()){
        assert.equal(c.number,i+1);chapters++;
        assert.ok(c.verses.length>0);
        let previousEnd=0;
        for(const v of c.verses){
          assert.ok(Number.isInteger(v.n)&&v.n>previousEnd);
          assert.ok(v.end>=v.n);
          if (!v.text.trim()) { assert.equal(lang,'en'); assert.ok(['ACT/8/37','ACT/15/34','ACT/24/7','LUK/17/36','ROM/16/25'].includes(b.id+'/'+c.number+'/'+v.n)); assert.ok(v.notes?.length); }
          assert.ok(v.label);
          previousEnd=v.end;entries++;
        }
      }
    }
    assert.equal(chapters,1189);
    counts[lang]=entries;
  }
  assert.deepEqual(counts,{'zh-Hans':31021,en:31103});
});
test('All reused scripture, image and font bytes match the preserved source manifest',async()=>{
  for(const f of await json('data/reused-resource-hashes.json')){
    assert.ok(!f.path.includes('..')&&!f.path.startsWith('/'));
    const bytes=await readFile(new URL(f.path,root));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),f.sha256,f.path);
  }
});
async function validReference(ref){
  for(const lang of ['zh-Hans','en']){
    const b=await json(`data/bible/${lang}/${ref.book}.json`);
    assert.ok(b.chapters.find(c=>c.number===ref.chapter)?.verses.some(v=>v.n<=ref.verse&&v.end>=ref.verse),JSON.stringify(ref));
  }
}
test('Five bilingual lessons have valid passage references and answer feedback',async()=>{
  const lessons=await json('data/lessons.json'); assert.equal(lessons.length,5);
  assert.equal(new Set(lessons.map(l=>l.id)).size,5);
  for(const l of lessons){
    await validReference(l.reference);
    for(const lang of ['zh-Hans','en']){
      for(const key of ['title','intro','body','question'])assert.ok(l[key][lang].trim());
      for(const c of l.choices){assert.ok(c.text[lang].trim());assert.ok(c.feedback[lang].trim());}
    }
    assert.equal(l.choices.filter(c=>c.correct).length,1);
  }
});
test('Four distinct attributed artwork files and bilingual guides with explicit sources',async()=>{
  const art=await json('data/art.json');assert.equal(art.length,4);
  assert.equal(new Set(art.map(a=>a.sha256)).size,4);
  for(const a of art){
    assert.equal(a.license,'CC0-1.0');
    assert.ok(a.source.startsWith('https://www.nga.gov/artworks/'));
    assert.ok(a.creditLine&&a.imageSource&&a.reviewedAt);
    const bytes=await readFile(new URL(a.image,root));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),a.sha256);
    for(const k of ['title','description','context','observe'])for(const lang of ['zh-Hans','en'])assert.ok(a[k][lang]);
    await validReference(a.reference);
  }
});
test('Public sources contain no private endpoints, keys, local user paths or backend calls',async()=>{
  const prohibited=[/C:[\\/]+Users[\\/]+/i,/Bearer\s+[A-Za-z0-9_.-]{10,}/,/sk-[A-Za-z0-9_-]{20,}/,/-----BEGIN (?:RSA |OPENSSH )?PRIVATE KEY-----/,/api\/speech\/synthesis/,/windows-protected-config/i];
  for(const file of ['app.js','index.html','styles.css','README.md','PRIVACY.md','THIRD_PARTY_NOTICES.md']){
    const text=await read(file);for(const pattern of prohibited)assert.ok(!pattern.test(text),`${file}: ${pattern}`);
  }
  assert.ok(!(await read('app.js')).includes('fetch("/'));
});
test('Static entry points and declared dependencies fit project Pages hosting',async()=>{
  const pkg=await json('package.json');
  assert.ok(!pkg.dependencies||Object.keys(pkg.dependencies).length===0);
  const html=await read('index.html');
  assert.ok(!/(?:href|src)=["']\//.test(html));
  for(const f of ['app.js','styles.css','assets/logo.svg','PRIVACY.md','THIRD_PARTY_NOTICES.md','LICENSE'])await readFile(new URL(f,root));
});
test('Bookmark range index exactly matches the union of both editions',async()=>{
  const ranges=await json('data/verse-ranges.json');
  for(const book of catalog){
    const expected={};
    for(const lang of ['zh-Hans','en']){
      const doc=await json(`data/bible/${lang}/${book.id}.json`);
      for(const c of doc.chapters){
        expected[c.number]??=new Set();
        for(const v of c.verses)for(let n=v.n;n<=v.end;n++)expected[c.number].add(n);
      }
    }
    for(const [chapter,values] of Object.entries(expected)){
      const indexed=new Set();
      for(const [start,end] of ranges[book.id][chapter])for(let n=start;n<=end;n++)indexed.add(n);
      assert.deepEqual([...indexed].sort((a,b)=>a-b),[...values].sort((a,b)=>a-b),`${book.id}/${chapter}`);
    }
  }
});
