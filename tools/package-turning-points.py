"""Create a reviewable local build, source patch and source archive after verification."""
import argparse, difflib, hashlib, json, pathlib, shutil, subprocess, zipfile
ROOT=pathlib.Path(__file__).resolve().parents[1]
args=argparse.ArgumentParser();args.add_argument('--out',required=True);args.add_argument('--remote-commit');options=args.parse_args();out=pathlib.Path(options.out).resolve()
report=json.loads((ROOT/'qa/turning-points/results.json').read_text(encoding='utf8'))
assert report['failed']==0 and report['passed']==17,'All 17 headless checks must finish successfully before packaging.'
out.mkdir(parents=True,exist_ok=True)
def git(*argv):return subprocess.check_output(['git',*argv],cwd=ROOT)
commit=git('rev-parse','HEAD').decode().strip()
patch=out/'200-buoc-ngoat-source.patch'
baseline=git('rev-list','--max-parents=0','HEAD').decode().strip()
chunks=[]
for name in git('ls-files','-z').decode('utf8').split('\0'):
    if not name or name=='doi-nguoi/index.html' or name.startswith('argon/dist/'):continue
    incoming=ROOT/'qa/incoming'/name
    if incoming.exists():old=incoming.read_text(encoding='utf8')
    else:
        raw=subprocess.run(['git','show',baseline+':'+name],cwd=ROOT,capture_output=True)
        old=raw.stdout.decode('utf8') if raw.returncode==0 else ''
    new=(ROOT/name).read_text(encoding='utf8')
    if old!=new:chunks.extend(difflib.unified_diff(old.splitlines(True),new.splitlines(True),fromfile='a/'+name if old else '/dev/null',tofile='b/'+name))
patch.write_text(''.join(chunks),encoding='utf8',newline='\n')
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
        if p.is_file() and p.relative_to(ROOT).as_posix() not in files:z.write(p,'model-argon/qa/turning-points/'+p.name)
with zipfile.ZipFile(archive) as z:assert z.testzip() is None
manifest={'upstreamBase':report['upstreamBase'],'localCommit':commit,'remoteCommit':options.remote_commit,'pullRequest':'https://github.com/malboro24217-lab/model-argon/pull/1','draft':True,'livePublished':False,'narrativeQualityGate':'NOT MET: one delayed card per route; see divergence-baseline.json','sourcePatchReverseCheck':'PASS','files':{}}
for p in [patch,archive,out/'game.html',out/'200-buoc-ngoat.md',out/'ket-qua-kiem-tra.json']:
    manifest['files'][p.name]={'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'out':str(out),'localCommit':commit,'files':{k:v['bytes'] for k,v in manifest['files'].items()}},ensure_ascii=False))
