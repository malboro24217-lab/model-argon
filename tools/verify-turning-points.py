"""Run the headless regression suite and save exact commands, exits and outputs."""
import concurrent.futures, json, os, pathlib, subprocess, time
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'qa/turning-points'
OUT.mkdir(parents=True,exist_ok=True)
jobs=[('typecheck',['npm.cmd','run','typecheck'],ROOT/'argon')]
for name in ['micro-test','repeat-test','path-test','agency-host-test','review-fixes-test','money-test','replay-test','turning-points-test','scheduled-followup-test','turning-sim-test']:
    jobs.append((name,['node',f'doi-nguoi/tests/{name}.js'],ROOT))
for name in ['agency-test','holdings-test','narrative-test','turning-content-test']:
    jobs.append((name,['node','--experimental-strip-types',f'src/{name}.ts'],ROOT/'argon'))
def run(job):
    name,cmd,cwd=job;start=time.monotonic()
    proc=subprocess.run(cmd,cwd=cwd,capture_output=True,text=True,encoding='utf8',errors='replace',env={**os.environ,'PYTHONUTF8':'1'},timeout=600)
    (OUT/(name+'.log')).write_text(proc.stdout+proc.stderr,encoding='utf8')
    result={'name':name,'command':cmd,'exit':proc.returncode,'seconds':round(time.monotonic()-start,2)}
    print(name, 'PASS' if proc.returncode==0 else 'FAIL',flush=True)
    return result
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    results=list(pool.map(run,jobs))
report={'upstreamBase':'206e831f5498c3505fff5afd5319ac0d8bc9e8a3','tests':results,'passed':sum(r['exit']==0 for r in results),'failed':sum(r['exit']!=0 for r in results),'browserTests':'Not run: existing scripts hardcode Claude Linux browser paths; interactive browser unavailable in current sidebar mode.'}
(OUT/'results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'passed':report['passed'],'failed':report['failed']}),flush=True)
raise SystemExit(1 if report['failed'] else 0)
