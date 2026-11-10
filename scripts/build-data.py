# Converts KFGQPC Qaloon v10 JSON into compact app data.
import json, sys
src, out = sys.argv[1], sys.argv[2]
d = json.load(open(src, encoding='utf-8'))
ayahs = []  # [sura, aya, page, juz, text]
suras = {}
for x in d:
    page = int(str(x['page']).split('-')[0])
    t = x['aya_text'].replace('‏', '')
    # split off trailing ayah number
    body, _, num = t.rpartition('\xa0')
    ayahs.append([x['sura_no'], x['aya_no'], page, x['jozz'], body.strip()])
    s = suras.setdefault(x['sura_no'], {'n': x['sura_no'], 'ar': x['sura_name_ar'], 'en': x['sura_name_en'], 'page': page, 'count': 0})
    s['count'] += 1
madani = {2,3,4,5,8,9,22,24,33,47,48,49,55,57,58,59,60,61,62,63,64,65,66,76,98,99,110}
for s in suras.values():
    s['type'] = 'مدنية' if s['n'] in madani else 'مكية'
juz = []
seen = set()
for a in ayahs:
    if a[3] not in seen:
        seen.add(a[3]); juz.append({'n': a[3], 'sura': a[0], 'aya': a[1], 'page': a[2], 'text': a[4][:40]})
json.dump({'ayahs': ayahs, 'suras': [suras[k] for k in sorted(suras)], 'juz': juz}, open(out, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print(len(ayahs), len(suras), len(juz))
