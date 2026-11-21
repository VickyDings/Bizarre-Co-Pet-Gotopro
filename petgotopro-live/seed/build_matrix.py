#!/usr/bin/env python3
"""Builds the Pet-GoToPro freshwater fish compatibility matrix.

Values: Y = generally fine · C = only with care/conditions · N = don't mix
The matrix is declared row by row and then checked for symmetry, so a pairing
can never disagree with itself.
"""
import pathlib

SPECIES = [
    ("Betta (male)",                 "Betta"),
    ("Small tetras &amp; rasboras",  "Sm tetra/rasbora"),
    ("Fin-nippers (tiger barb, serpae)", "Fin-nippers"),
    ("Danios",                       "Danios"),
    ("Guppies &amp; Endlers",        "Guppy/Endler"),
    ("Platies, mollies, swordtails", "Platy/molly/sword"),
    ("Corydoras catfish",            "Corydoras"),
    ("Bristlenose pleco",            "Bristlenose"),
    ("Otocinclus",                   "Otocinclus"),
    ("Kuhli loach",                  "Kuhli loach"),
    ("Snail-eating loaches (clown, yoyo)", "Clown/yoyo loach"),
    ("Gouramis (dwarf, honey, pearl)", "Gouramis"),
    ("Angelfish",                    "Angelfish"),
    ("Rams &amp; apistogramma",      "Rams/apistos"),
    ("African cichlids (mbuna)",     "African cichlids"),
    ("Large American cichlids (oscar, JD)", "Large cichlids"),
    ("Goldfish",                     "Goldfish"),
    ("Cherry shrimp (neocaridina)",  "Cherry shrimp"),
    ("Amano shrimp",                 "Amano shrimp"),
    ("Snails (nerite, mystery)",     "Snails"),
    ("Freshwater crabs",             "Crabs"),
    ("Crayfish / 'lobsters'",        "Crayfish"),
]

# 22x22, in the order above. Diagonal = same species with its own kind.
ROWS = [
    "SCNCNCYYYYYNNCNNNCCYCN",  # 1  Betta
    "CYCCYYYYYYYYCYNNNCYYCN",  # 2  Small tetras & rasboras
    "NCYYNCYYCCYNNCNCNNCYNN",  # 3  Fin-nippers
    "CCYYCYYYYYYCCYNNCCYYCN",  # 4  Danios
    "NYNCYYYYYYYCCYNNNCYYCN",  # 5  Guppies & Endlers
    "CYCYYYYYYYYYCYNNNCYYCN",  # 6  Platies/mollies/swordtails
    "YYYYYYYYYYYYYYNNNYYYCN",  # 7  Corydoras
    "YYYYYYYCYYYYYYCCNYYYCN",  # 8  Bristlenose pleco
    "YYCYYYYYYYYYCYNNNYYYCN",  # 9  Otocinclus
    "YYCYYYYYYYYYYYNNNCYYCN",  # 10 Kuhli loach
    "YYYYYYYYYYYYYYNNNCCNNN",  # 11 Snail-eating loaches
    "NYNCCYYYYYYCCYNNNCYYCN",  # 12 Gouramis
    "NCNCCCYYCYYCCYNCNNCYNN",  # 13 Angelfish
    "CYCYYYYYYYYYYCNNNCYYNN",  # 14 Rams & apistos
    "NNNNNNNCNNNNNNCNNNNNNN",  # 15 African cichlids
    "NNCNNNNCNNNNCNNCNNNNNN",  # 16 Large American cichlids
    "NNNCNNNNNNNNNNNNCNNCNN",  # 17 Goldfish
    "CCNCCCYYYCCCNCNNNYYYCN",  # 18 Cherry shrimp
    "CYCYYYYYYYCYCYNNNYYYCN",  # 19 Amano shrimp
    "YYYYYYYYYYNYYYNNCYYYCN",  # 20 Snails
    "CCNCCCCCCCNCNNNNNCCCCN",  # 21 Freshwater crabs
    "NNNNNNNNNNNNNNNNNNNNNC",  # 22 Crayfish
]

# Notes for the trickiest pairings — shown under the chart in the article
CAVEATS = [
    ("Betta + small tetras", "Usually fine in 10 gal+ with plenty of plants, but it depends on the individual betta. Have a backup plan."),
    ("Betta + guppies", "The classic mistake — male guppies' bright flowing fins read as a rival betta. Expect attacks."),
    ("Angelfish + neon tetras", "Fine while the angel is small; a full-grown angelfish will eat neon-sized fish. Pair angels with larger tetras instead."),
    ("Any fish + cherry shrimp", "Adult shrimp usually survive; shrimplets get eaten by almost anything. Heavy planting and moss are what let a colony breed."),
    ("Clown/yoyo loaches + snails", "Snail-eating loaches are sold as a snail solution — they will clear out your nerites and mystery snails too."),
    ("Goldfish + tropical fish", "A temperature and mess mismatch. Goldfish want cooler water and produce far more waste than a tropical community can absorb."),
    ("Fin-nippers + gouramis or angels", "Tiger barbs and serpae tetras shred long fins and gourami feelers. Keep nippers in groups of 8+ with other fast, robust fish."),
    ("Crayfish + anything", "Crayfish hunt sleeping fish at night and eat shrimp and snails. Keep them alone."),
]

LEGEND = {"Y": ("✓", "Generally fine", "y"), "C": ("~", "Only with care", "c"),
          "N": ("✗", "Don't mix", "n"), "S": ("◆", "Keep one only", "s")}


def validate():
    n = len(SPECIES)
    assert len(ROWS) == n, f"expected {n} rows, got {len(ROWS)}"
    problems = []
    for i, r in enumerate(ROWS):
        if len(r) != n:
            problems.append(f"row {i+1} ({SPECIES[i][1]}) has {len(r)} cells, expected {n}")
    if problems:
        raise SystemExit("MATRIX ERRORS:\n" + "\n".join(problems))
    for i in range(n):
        for j in range(n):
            if ROWS[i][j] != ROWS[j][i]:
                problems.append(
                    f"asymmetric: {SPECIES[i][1]} vs {SPECIES[j][1]} = {ROWS[i][j]} "
                    f"but {SPECIES[j][1]} vs {SPECIES[i][1]} = {ROWS[j][i]}")
    if problems:
        raise SystemExit("MATRIX ERRORS:\n" + "\n".join(problems))
    return n


def html_matrix(compact=False):
    n = validate()
    head = "".join(f'<th class="cx" title="{SPECIES[j][1]}">{j+1}</th>' for j in range(n))
    body = []
    for i in range(n):
        cells = []
        for j in range(n):
            sym, _, cls = LEGEND[ROWS[i][j]]
            cells.append(f'<td class="m {cls}">{sym}</td>')
        body.append(
            f'<tr><th class="rn">{i+1}</th><th class="rl">{SPECIES[i][0]}</th>{"".join(cells)}</tr>')
    return (
        '<table class="compat">'
        f'<thead><tr><th class="rn"></th><th class="rl">Species</th>{head}</tr></thead>'
        f'<tbody>{"".join(body)}</tbody></table>'
    )


def stats():
    n = validate()
    tot = y = c = nn = 0
    for i in range(n):
        for j in range(i + 1, n):
            v = ROWS[i][j]; tot += 1
            y += v == "Y"; c += v == "C"; nn += v == "N"
    return dict(pairs=tot, good=y, care=c, no=nn)


if __name__ == "__main__":
    s = stats()
    print(f"✓ matrix valid — {len(SPECIES)} species, {s['pairs']} unique pairings")
    print(f"  {s['good']} compatible · {s['care']} with care · {s['no']} incompatible")
    pathlib.Path("seed/matrix.html").write_text(html_matrix())
    print("  wrote seed/matrix.html")
