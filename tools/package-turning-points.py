"""Create a reviewable local build, source patch and source archive after verification."""
import argparse, hashlib, json, pathlib, shutil, subprocess, zipfile
ROOT=pathlib.Path(__file__).resolve().parents[1]
args=argparse.ArgumentParser();args.add_argument('--out',required=True);out=pathlib.Path(args.parse_args().out).resolve()
report=json.loads((ROOT/'qa/turning-points/results.json').read_text(encoding='utf8'))
assert report['failed']==0 and report['passed']==15,'All 15 headless checks must finish successfully before packaging.'
out.mkdir(parents=True,exist_ok=True)
def git(*argv):return subprocess.check_output(['git',*argv],cwd=ROOT)
commit=git('rev-parse','HEAD').decode().strip()
paths=['README.md','argon/src','argon/docs','doi-nguoi/living.js','doi-nguoi/tests/turning-points-test.js','doi-nguoi/tests/scheduled-followup-test.js','doi-nguoi/tests/turning-sim-test.js','tools']
patch=out/'200-buoc-ngoat-source.patch'
subprocess.run(['git','diff','--binary','--output='+str(patch),'HEAD~1','HEAD','--',*paths],cwd=ROOT,check=True)
subprocess.run(['git','apply','--reverse','--check',str(patch)],cwd=ROOT,check=True,capture_output=True)
shutil.copy2(ROOT/'doi-nguoi/index.html',out/'game.html')
shutil.copy2(ROOT/'argon/docs/content/2026-10-18-200-buoc-ngoat.md',out/'200-buoc-ngoat.md')
shutil.copy2(ROOT/'qa/turning-points/results.json',out/'ket-qua-kiem-tra.json')
shutil.copytree(ROOT/'doi-nguoi/publish',out/'publish',dirs_exist_ok=True)
files=[p for p in git('ls-files','-z').decode('utf8').split('\0') if p]
archive=out/'model-argon-source.zip'
with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED) as z:
    for name in files:z.write(ROOT/name,'model-argon/'+name)
    for p in (ROOT/'qa/turning-points').glob('*'):
        if p.is_file():z.write(p,'model-argon/qa/turning-points/'+p.name)
with zipfile.ZipFile(archive) as z:assert z.testzip() is None
manifest={'upstreamBase':report['upstreamBase'],'localCommit':commit,'remotePublished':False,'sourcePatchReverseCheck':'PASS','files':{}}
for p in [patch,archive,out/'game.html',out/'200-buoc-ngoat.md',out/'ket-qua-kiem-tra.json']:
    manifest['files'][p.name]={'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'out':str(out),'localCommit':commit,'files':{k:v['bytes'] for k,v in manifest['files'].items()}},ensure_ascii=False))
