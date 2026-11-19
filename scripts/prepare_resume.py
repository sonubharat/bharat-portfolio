"""Prepare the supplied PDF for the portfolio without exposing a phone number."""
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'.local-py'))
import fitz
root=Path(__file__).resolve().parents[1]
source=Path(r'C:\Users\BharatBhushanNathSha\Downloads\Bharat_Sharma_Resume_9-9-26(1).pdf')
target=root/'public/files/Bharat-Sharma-Resume.pdf'
target.parent.mkdir(parents=True,exist_ok=True)
doc=fitz.open(source)
page=doc[0]
lines=[]
for block in page.get_text('dict')['blocks']:
    for line in block.get('lines',[]):
        text=''.join(span['text'] for span in line['spans'])
        if '+91' in text or '6304112757' in text:
            rect=fitz.Rect(line['bbox']);lines.append(rect)
            page.add_redact_annot(rect,fill=(1,1,1))
assert lines,'Contact header not found'
page.apply_redactions()
rect=lines[0]
page.insert_text((rect.x0,rect.y1-2),'Hyderabad, Telangana, India | sonubharath635@gmail.com',fontname='tiro',fontsize=10,color=(0,0,0))
doc.save(target,garbage=4,deflate=True)
doc.close()
check=fitz.open(target)
text='\n'.join(p.get_text() for p in check)
assert '6304112757' not in text
assert 'Hyderabad, Telangana, India' in text
check[0].get_pixmap(matrix=fitz.Matrix(1.5,1.5)).save(root/'preview-resume.png')
print('Saved public PDF:',target,'Pages:',len(check))
