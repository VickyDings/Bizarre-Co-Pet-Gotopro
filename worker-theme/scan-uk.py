# -*- coding: utf-8 -*-
import io, re, sys, collections
UK = [
 r'colou?r(?=s?\b|ed\b|ing\b|ful\b)', r'\bcolour\w*', r'\bbehaviou?r\w*', r'\bfavourite\w*',
 r'\bodour\w*', r'\bflavour\w*', r'\bneighbour\w*', r'\bhonour\w*', r'\bhumour\w*',
 r'\breali[sz]e\w*', r'\brecognis\w*', r'\borganis\w*', r'\bapologis\w*', r'\banalys\w*',
 r'\bparalys\w*', r'\bcentre\w*', r'\bmetre\w*', r'\blitre\w*', r'\bfibre\w*',
 r'\bgrey\b', r'\bgreyish\b', r'\bpractise\w*', r'\blicence\b', r'\bdefence\b', r'\boffence\b',
 r'\btravell\w*', r'\bcancell\w*', r'\blabell\w*', r'\bmodell\w*', r'\bmarvellous\b',
 r'\bjewellery\b', r'\baluminium\b', r'\bdraught\w*', r'\bmould\w*', r'\bplough\w*',
 r'\bstorey\w*', r'\btyre\w*', r'\bkerb\w*', r'\bprogramme\w*', r'\bsceptic\w*',
 r'\bcatalogue\w*', r'\btowards\b', r'\bamongst\b', r'\bwhilst\b', r'\blearnt\b',
 r'\bspelt\b', r'\bburnt\b', r'\bdreamt\b', r'\bleapt\b', r'\bsmelt\b', r'\bspoilt\b',
 r'\bfulfil\b', r'\bfulfilment\b', r'\binstalment\b', r'\benrol\b', r'\bskilful\b',
 r'\bwilful\b', r'\bappal\b', r'\bdistil\b', r'\binstil\b', r'\bspeciality\w*',
 r'\baeroplane\b', r'\bmaths\b', r'\bsulphur\w*', r'\boestrog\w*', r'\bpaediatric\w*',
 r'\bfoetus\w*', r'\banaemi\w*', r'\bdiarrhoea\b', r'\boesophag\w*', r'\bhaemorrhag\w*',
 r'\bcaesarean\b', r'\banaesthe\w*', r'\bfaec\w*', r'\bmoult\w*', r'\bcosy\b',
 r'\bpyjama\w*', r'\bskirting board\w*', r'\bcupboard\w*', r'\bhoover\w*', r'\brubbish\b',
 r'\bpavement\w*', r'\bnappy\b', r'\btorch\b', r'\btap\b', r'\bflat\b(?! floor| bottom| shiny| platform| surface| wood| against| out)',
 r'\bbath\b(?!room|tub| mat)', r'\bbathed\b', r'\bbathing\b',
 r'\bjumper\b', r'\btrousers\b', r'\bautumn\b', r'\bpetrol\b', r'\bspanner\b',
 r'\bbin\b(?!s\b)', r'\bbinned\b', r'\bpostcode\b', r'\bqueue\w*', r'\bcheque\b',
]
pat = re.compile('|'.join(UK), re.I)
for path in sys.argv[1:]:
    txt = io.open(path, encoding='utf-8').read()
    body = re.sub(r'<[^>]+>', ' ', txt)          # ignore tags/urls/classes
    hits = collections.Counter(m.group(0) for m in pat.finditer(body))
    print('\n=== %s ===' % path)
    if not hits: print('  clean'); continue
    for w, n in sorted(hits.items(), key=lambda kv: (-kv[1], kv[0].lower())):
        print('  %-22s %d' % (w, n))
