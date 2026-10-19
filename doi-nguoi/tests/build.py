import os
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
R=os.path.dirname(D)
import re
H=D+'/index.html'
s=open(H).read()
srcs={'argon':R+'/argon/dist/argon.iife.js','bridge':D+'/bridge.js','living':D+'/living.js','choice':D+'/choice.js','narrator':D+'/narrator.js','story':D+'/story.js','agency':D+'/agency.js','money':D+'/money.js','canon':D+'/canon.js','phase1':D+'/phase1.js','canonui':D+'/canon-ui.js'}
for k,p in srcs.items():
    code=open(p).read()

    s,n=re.subn(r'(<script id="%s">)(.*?)(</script>)'%k, lambda m: m.group(1)+"\n"+code+"\n"+m.group(3), s, flags=re.S)
    assert n==1,k
open(H,'w').write(s)
blk=lambda k: re.search(r'<script id="%s">(.*?)</script>'%k,s,re.S).group(1)
head=blk('argon')+"\nvar Argon=Argon;\nvar localStorage={getItem(){return null},setItem(){}};\n"
for k in ['engine','bridge','story','living','choice','narrator','agency','money','canon','phase1','canonui']: head+=blk(k)+"\n"
head+="var G={life:null};var esc=s=>String(s);\n"
open(D+'/tests/.head.js','w').write(head)
print('ok',len(s))

# Bản đăng tách file: trang chính chỉ còn khung + giao diện, mỗi khối script là một file đi kèm.
# Đăng: Artifact publish file_path=doi-nguoi/publish/index.html, files={tên: doi-nguoi/publish/tên} (xem CLAUDE.md).
P=D+'/publish'
os.makedirs(P,exist_ok=True)
for f in os.listdir(P): os.remove(os.path.join(P,f))
page=s
names=[]
for k in ['engine','argon','bridge','story','living','choice','narrator','agency','money','canon','phase1','canonui']:
    code=blk(k)
    open(P+'/%s.js'%k,'w').write(code)
    page,n=re.subn(r'<script id="%s">.*?</script>'%k, '<script id="%s" src="%s.js"></script>'%(k,k), page, flags=re.S)
    assert n==1,k
    names.append(k+'.js')
open(P+'/index.html','w').write(page)
open(P+'/files.txt','w').write('\n'.join(names)+'\n')
print('publish',len(page.encode()),'+',len(names),'files')
