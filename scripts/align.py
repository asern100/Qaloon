import json, re, sys
def skel(w):
    w = w.replace('\u06d2', 'ي')
    w = re.sub(r'[^\u0621-\u063A\u0641-\u064A\u0671]', '', w)
    w = re.sub('[أإآٱ]', 'ا', w).replace('ى', 'ي').replace('ة', 'ه')
    return re.sub('[اويءئؤ]', '', w)
def qwords(q, s):
    out = []
    for i, a in enumerate(q):
        if a[0] != s: continue
        pend = ''
        for w in a[4].split():
            if w == '۞': continue
            out.append((pend + w, i)); pend = ''
    return out

LETTERS = re.compile(r'[ء-غف-يٱ]')
DIG = '٠١٢٣٤٥٦٧٨٩'

def letter_tokens(w):
    return [t for t in w.split() if LETTERS.search(t)]

def kufi_number(w):
    m = re.search('[٠-٩]+', w)
    return int(''.join(str(DIG.index(c)) for c in m.group())) if m else 0

def build(layout_dir, quran_json, pages, out):
    """Re-flow the Qalun text into the 15-line Madinah page layout, word by word."""
    data = json.load(open(quran_json, encoding='utf-8'))
    q = data['ayahs']
    basmala = 'بِسْمِ اِ۬للَّهِ اِ۬لرَّحْمَٰنِ اِ۬لرَّحِيمِ'.split()
    streams = {}
    for s in (1, 2):
        ws = qwords(q, s)
        if s == 1:
            ws = [(w, -1) for w in basmala] + ws
        streams[s] = ws
    pos = {1: 0, 2: 0}
    result = []
    ayah_page = {}
    for p in pages:
        lines = []
        for l in json.load(open(f'{layout_dir}/page-{p:03d}.json', encoding='utf-8'))['lines']:
            if l['type'] == 'surah-header':
                lines.append({'h': int(l['surah'])})
            elif l['type'] == 'basmala':
                lines.append({'b': 1})
            else:
                row = []
                for w in l['words']:
                    s = int(w['location'].split(':')[0])
                    n = len(letter_tokens(w['word']))
                    take = streams[s][pos[s]:pos[s] + n]
                    pos[s] += n
                    text = ' '.join(t for t, _ in take)
                    idx = take[-1][1]
                    for _, i in take:
                        if i >= 0:
                            ayah_page.setdefault(i, max(p, 2))
                    row.append([text, idx, kufi_number(w['word'])])
                lines.append({'w': row})
        result.append({'p': p, 'lines': lines})
    assert pos[1] == len(streams[1]) and pos[2] == len(streams[2]), (pos, len(streams[1]), len(streams[2]))
    # The printed mushaf shows Al-Fatiha and the opening of Al-Baqara together on page 2.
    if result and result[0]['p'] == 1 and len(result) > 1 and result[1]['p'] == 2:
        result[1]['lines'] = result[0]['lines'] + result[1]['lines']
        result = result[1:]
    result = {'pages': result, 'ayahPage': ayah_page}
    json.dump(result, open(out, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))

if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2], range(1, 50), sys.argv[3])
