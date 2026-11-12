#!/usr/bin/env python3
"""Story-mode photos: Photo Scenes (PANEL_PHOTO) and photo galleries (PANEL_GALLERY).

  media/story/index.json        what each photo is (written by Claude when syncing the Storyboard Room)
  media/story/<path>            originals, committed at full quality. Location and camera metadata
                                are removed LOSSLESSLY (JPEG: EXIF/XMP segments dropped, image data
                                untouched; PNG: text/eXIf chunks dropped). The untouched originals,
                                metadata included, stay in the Storyboard Room's private storage.
  public/story/media/<id>.webp  web copy for the site (long edge <= 2400 px, quality 90)
  src/story/media.json          what the site reads

  python3 scripts/story/media.py            process new/changed photos
  python3 scripts/story/media.py --strip F  strip metadata from one file in place (lossless)
"""
import hashlib
import json
import os
import struct
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'media', 'story')
INDEX = os.path.join(SRC, 'index.json')
OUT_DIR = os.path.join(ROOT, 'public', 'story', 'media')
OUT_JSON = os.path.join(ROOT, 'src', 'story', 'media.json')
LONG_EDGE = 2400
QUALITY = 90


def strip_jpeg(data):
    """Drop APP1 (EXIF/XMP) and APP13 (IPTC) segments; keep everything else byte-for-byte."""
    if data[:2] != b'\xff\xd8':
        raise ValueError('not a JPEG')
    out, i = bytearray(b'\xff\xd8'), 2
    while i < len(data):
        if data[i] != 0xFF:
            raise ValueError('bad JPEG marker')
        marker = data[i + 1]
        if marker == 0xDA:  # start of scan: the rest is image data
            out += data[i:]
            break
        length = struct.unpack('>H', data[i + 2:i + 4])[0]
        seg = data[i:i + 2 + length]
        if marker not in (0xE1, 0xED):
            out += seg
        i += 2 + length
    return bytes(out)


def strip_png(data):
    """Drop tEXt/zTXt/iTXt/eXIf/tIME chunks; image chunks untouched."""
    if data[:8] != b'\x89PNG\r\n\x1a\n':
        raise ValueError('not a PNG')
    out, i = bytearray(data[:8]), 8
    while i < len(data):
        length = struct.unpack('>I', data[i:i + 4])[0]
        ctype = data[i + 4:i + 8]
        chunk = data[i:i + 12 + length]
        if ctype not in (b'tEXt', b'zTXt', b'iTXt', b'eXIf', b'tIME'):
            out += chunk
        i += 12 + length
    return bytes(out)


def strip_file(path):
    data = open(path, 'rb').read()
    low = path.lower()
    if low.endswith(('.jpg', '.jpeg')):
        new = strip_jpeg(data)
    elif low.endswith('.png'):
        new = strip_png(data)
    else:
        raise ValueError(f'{path}: only JPEG and PNG originals are accepted (convert HEIC first)')
    if new != data:
        open(path, 'wb').write(new)
    return len(data) - len(new)


def web_copy(src, dest):
    from PIL import Image, ImageOps
    im = Image.open(src)
    im = ImageOps.exif_transpose(im)
    if im.mode not in ('RGB', 'RGBA'):
        im = im.convert('RGB')
    w, h = im.size
    scale = min(1, LONG_EDGE / max(w, h))
    if scale < 1:
        im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
    icc = im.info.get('icc_profile')
    im.save(dest, 'WEBP', quality=QUALITY, method=6, **({'icc_profile': icc} if icc else {}))
    return im.size


def main():
    if len(sys.argv) > 2 and sys.argv[1] == '--strip':
        print(f'removed {strip_file(sys.argv[2])} bytes of metadata')
        return 0
    index = json.load(open(INDEX, encoding='utf-8')) if os.path.exists(INDEX) else {'photos': {}, 'gallery': {}}
    os.makedirs(OUT_DIR, exist_ok=True)
    out = {'photos': {}, 'gallery': {}}

    def process(pid, rel):
        src = os.path.join(SRC, rel)
        digest = hashlib.sha1(open(src, 'rb').read()).hexdigest()[:10]
        name = f'{pid}-{digest}.webp'
        dest = os.path.join(OUT_DIR, name)
        if not os.path.exists(dest):
            strip_file(src)
            size = web_copy(src, dest)
        else:
            from PIL import Image
            size = Image.open(dest).size
        return {'src': f'/story/media/{name}', 'w': size[0], 'h': size[1]}

    for pid, p in sorted(index.get('photos', {}).items()):
        entry = {'scene': p.get('scene'), 'panel': p.get('panel'), 'alt': p.get('alt', ''),
                 'original': process(pid, p['file'])}
        if p.get('comic'):
            entry['comic'] = process(pid + '-comic', p['comic'])
        out['photos'][pid] = entry
    for gid, items in sorted(index.get('gallery', {}).items()):
        out['gallery'][gid] = [{'id': it['id'], 'caption': it.get('caption', ''), **process(it['id'], it['file'])}
                               for it in items]
    used = {os.path.basename(v['src']) for p in out['photos'].values() for v in (p['original'], p.get('comic')) if v}
    used |= {os.path.basename(it['src']) for items in out['gallery'].values() for it in items}
    for f in os.listdir(OUT_DIR):
        if f.endswith('.webp') and f not in used:
            os.remove(os.path.join(OUT_DIR, f))
    open(OUT_JSON, 'w', encoding='utf-8').write(json.dumps(out, ensure_ascii=False, indent=1) + '\n')
    print(f"media: {len(out['photos'])} photo-scene image(s), "
          f"{sum(len(v) for v in out['gallery'].values())} gallery photo(s)")
    return 0


if __name__ == '__main__':
    sys.exit(main())
