import os
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
R=os.path.dirname(D)
import re
H=D+'/index.html'
s=open(H).read()
srcs={'argon':R+'/argon/dist/argon.iife.js','bridge':D+'/bridge.js','living':D+'/living.js','choice':D+'/choice.js','narrator':D+'/narrator.js','story':D+'/story.js','agency':D+'/agency.js'}
for k,p in srcs.items():
    code=open(p).read()

    s,n=re.subn(r'(<script id="%s">)(.*?)(</script>)'%k, lambda m: m.group(1)+"\n"+code+"\n"+m.group(3), s, flags=re.S)
    assert n==1,k
open(H,'w').write(s)
blk=lambda k: re.search(r'<script id="%s">(.*?)</script>'%k,s,re.S).group(1)
head=blk('argon')+"\nvar Argon=Argon;\nvar localStorage={getItem(){return null},setItem(){}};\n"
for k in ['engine','bridge','story','living','choice','narrator','agency']: head+=blk(k)+"\n"
head+="var G={life:null};var esc=s=>String(s);\n"
open(D+'/tests/.head.js','w').write(head)
print('ok',len(s))
