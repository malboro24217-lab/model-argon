import re
H='/home/claude/doi-nguoi/index.html'
s=open(H).read()
srcs={'argon':'/home/claude/argon/dist/argon.iife.js','bridge':'/home/claude/doi-nguoi/bridge.js','living':'/home/claude/doi-nguoi/living.js','choice':'/home/claude/doi-nguoi/choice.js','narrator':'/home/claude/doi-nguoi/narrator.js','story':'/home/claude/doi-nguoi/story.js','agency':'/home/claude/doi-nguoi/agency.js'}
for k,p in srcs.items():
    code=open(p).read()

    s,n=re.subn(r'(<script id="%s">)(.*?)(</script>)'%k, lambda m: m.group(1)+"\n"+code+"\n"+m.group(3), s, flags=re.S)
    assert n==1,k
open(H,'w').write(s)
blk=lambda k: re.search(r'<script id="%s">(.*?)</script>'%k,s,re.S).group(1)
head=blk('argon')+"\nvar Argon=Argon;\nvar localStorage={getItem(){return null},setItem(){}};\n"
for k in ['engine','bridge','story','living','choice','narrator','agency']: head+=blk(k)+"\n"
head+="var G={life:null};var esc=s=>String(s);\n"
open('/home/claude/doi-nguoi/tests/.head.js','w').write(head)
print('ok',len(s))
