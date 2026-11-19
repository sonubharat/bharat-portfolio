"""Standard-library GLB structural and required-node validation."""
import json,struct,sys
from pathlib import Path
root=Path(__file__).resolve().parents[2]
def webp_dimensions(path):
    raw=path.read_bytes()
    assert raw[:4]==b'RIFF' and raw[8:12]==b'WEBP',path
    offset=12
    while offset<len(raw):
        kind=raw[offset:offset+4];size=struct.unpack_from('<I',raw,offset+4)[0];payload=raw[offset+8:offset+8+size]
        if kind==b'VP8X':return int.from_bytes(payload[4:7],'little')+1,int.from_bytes(payload[7:10],'little')+1
        if kind==b'VP8 ':return tuple(v&0x3fff for v in struct.unpack_from('<HH',payload,6))
        if kind==b'VP8L':
            packed=int.from_bytes(payload[1:5],'little');return (packed&0x3fff)+1,((packed>>14)&0x3fff)+1
        offset+=8+size+(size%2)
    raise ValueError(f'No WebP image chunk: {path}')
final='--final' in sys.argv
for name,poster in [('hero-sculpture','hero-poster'),('developer-studio','studio-poster'),('ai-research','ai-research'),('jobnest','jobnest'),('covid-research','covid-research')]:
    paths=[root/'blender/scenes'/f'{name}.blend',root/'public/models'/f'{name}.glb',root/'public/images'/f'{poster}.webp']
    for p in paths:assert p.exists() and p.stat().st_size>100,p
    raw=paths[1].read_bytes();magic,version,length=struct.unpack_from('<4sII',raw)
    assert magic==b'glTF' and version==2 and length==len(raw)
    chunk_length,chunk_type=struct.unpack_from('<II',raw,12)
    assert chunk_type==0x4e4f534a
    data=json.loads(raw[20:20+chunk_length]);assert data.get('meshes')
    assert all('uri' not in b for b in data['buffers'])
    if name=='developer-studio':
        names={n.get('name') for n in data['nodes']}
        required={'Monitor_Projects','Keyboard_Skills','Notebook_About','Wall_Achievements','Display_Research','CameraTarget_Overview','CameraTarget_Projects','CameraTarget_Skills','CameraTarget_About'}
        assert required<=names,required-names
    dims=webp_dimensions(paths[2])
    expected=(2560,1440) if name=='hero-sculpture' else (1920,1280)
    if final:assert dims==expected,(name,dims,expected)
    print(name, 'OK',len(raw),'bytes',len(data['meshes']),'meshes',dims,'poster')
mobile=root/'public/images/hero-poster-mobile.webp'
assert mobile.exists()
if final:assert webp_dimensions(mobile)==(1080,1350)
print('Hero mobile:',webp_dimensions(mobile))
