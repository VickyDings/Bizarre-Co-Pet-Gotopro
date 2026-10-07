/* ===================================================
   Pet Go Pro - Admin SEO Knowledge Base
   Keyword corpus, platform specs and hashtag sets for
   the AI SEO Assistant. Pure data, no DOM access.
   =================================================== */

window.PGP_SEO_DATA = (function () {

    /* ---------- Search-intent modifiers ----------
       Combined with seeds + species to build long-tail keyphrases. */
    const MODIFIERS = {
        informational: [
            'how to get {seed} right', '{seed} for beginners', '{seed} guide', '{species} care sheet',
            '{topic} explained', '{topic} for {species}', 'what {topic} does a {species} need',
            'why is my {species} {behaviour}', '{species} lifespan', '{species} diet',
            '{seed} mistakes to avoid', '{seed} step by step', 'is {topic} safe for a {species}',
            'signs of {problem} in a {species}', '{species} care for beginners',
            '{topic} chart for {species}'
        ],
        // Buying-intent templates use {gear} - a real product line from the
        // category - because a focus like "basking temperature" is a measurement,
        // and "cheap basking temperature" is not a search anyone performs.
        commercial: [
            'best {gear} for a {species}', 'best {gear} for {seed}', 'top rated {gear}',
            '{gear} on a budget', 'cheap {gear} worth buying', '{gear} worth the money',
            'best {gear} 2026', 'vet recommended {gear}', '{species} starter kit',
            '{species} setup cost'
        ],
        comparison: [
            '{alt} vs {alt2} for a {species}', 'is {alt} better than {alt2}',
            '{species} vs {altSpecies} which is easier to keep', 'cheapest vs best {gear}',
            '{alt} or {alt2} for {seed}'
        ],
        transactional: [
            'buy {gear} online', '{gear} near me', '{species} for sale',
            '{gear} next day delivery', 'where to buy {gear}'
        ],
        local: [
            '{gear} near me', 'exotic vet near me', '{species} breeder near me',
            '{species} supplies store open now'
        ]
    };

    /* ---------- Hashtags every pet post can safely carry ---------- */
    const GENERIC_TAGS = [
        '#petcare', '#pets', '#petsofinstagram', '#petlovers', '#petparents',
        '#animallovers', '#petadvice', '#responsiblepetownership', '#petgopro',
        '#bizarreco', '#exoticpets', '#petsupplies', '#pettips', '#vetapproved'
    ];

    /* ---------- Words never worth ranking for ---------- */
    const STOPWORDS = ('a an and are as at be but by for from has have how i in is it its of on or ' +
        'that the this to was were what when where which who will with you your my our do does did ' +
        'can could should would about into over under so if then than them they there here more most ' +
        'best top new also just very much many some any all no not only own same too s t don now').split(' ');

    /* ---------- Per-platform publishing + share specs ----------
       `share` describes how a post can leave this admin:
         intent  - official web share/compose URL, opens prefilled
         compose - no public prefill API, so we copy the caption and open the composer
         webhook - fans out through the user's own automation endpoint            */
    const PLATFORMS = [
        {
            id: 'facebook', label: 'Facebook', icon: 'fab fa-facebook-f', colour: '#1877F2',
            share: 'intent', captionLimit: 63206, idealLength: 300, tagCount: 3,
            urlTemplate: 'https://www.facebook.com/sharer/sharer.php?u={url}',
            prefillsCaption: false,
            note: 'Facebook strips pre-filled text from the share dialog. Caption is copied to your clipboard so you can paste it into the dialog.',
            bestTimes: 'Tue-Thu 9-11am, Sat 10am', linkInBody: true
        },
        {
            id: 'x', label: 'X / Twitter', icon: 'fab fa-x-twitter', colour: '#000000',
            share: 'intent', captionLimit: 280, idealLength: 200, tagCount: 2,
            urlTemplate: 'https://twitter.com/intent/tweet?text={text}&url={url}',
            prefillsCaption: true,
            note: 'Keep to 2 hashtags. The link eats 23 characters no matter its real length.',
            bestTimes: 'Weekdays 8-10am, 6-8pm', linkInBody: false
        },
        {
            id: 'instagram', label: 'Instagram', icon: 'fab fa-instagram', colour: '#E1306C',
            share: 'compose', captionLimit: 2200, idealLength: 150, tagCount: 25,
            urlTemplate: 'https://www.instagram.com/',
            prefillsCaption: false,
            note: 'No public prefill API. Caption + hashtags are copied; paste into the app or Creator Studio. Put the link in your bio or Stories sticker.',
            bestTimes: 'Mon-Fri 11am-1pm, 7-9pm', linkInBody: false
        },
        {
            id: 'threads', label: 'Threads', icon: 'fab fa-threads', colour: '#000000',
            share: 'intent', captionLimit: 500, idealLength: 300, tagCount: 1,
            urlTemplate: 'https://www.threads.net/intent/post?text={textWithUrl}',
            prefillsCaption: true,
            note: 'Threads shows one topic tag. Lead with the hook, link at the end.',
            bestTimes: 'Daily 7-9am, 8-10pm', linkInBody: true
        },
        {
            id: 'pinterest', label: 'Pinterest', icon: 'fab fa-pinterest-p', colour: '#E60023',
            share: 'intent', captionLimit: 500, idealLength: 300, tagCount: 5,
            urlTemplate: 'https://pinterest.com/pin/create/button/?url={url}&media={image}&description={text}',
            prefillsCaption: true,
            note: 'Pinterest is a search engine: the description should read like a keyword-rich sentence, not a caption. Needs a tall 1000x1500 image.',
            bestTimes: 'Evenings 8-11pm, Sat morning', linkInBody: false
        },
        {
            id: 'tiktok', label: 'TikTok', icon: 'fab fa-tiktok', colour: '#010101',
            share: 'compose', captionLimit: 2200, idealLength: 100, tagCount: 5,
            urlTemplate: 'https://www.tiktok.com/tiktokstudio/upload',
            prefillsCaption: false,
            note: 'No prefill API. Caption is copied for the upload screen. 3-5 searchable tags beat 20 generic ones.',
            bestTimes: 'Tue-Thu 6-10pm', linkInBody: false
        },
        {
            id: 'youtube', label: 'YouTube', icon: 'fab fa-youtube', colour: '#FF0000',
            share: 'compose', captionLimit: 5000, idealLength: 400, tagCount: 15,
            urlTemplate: 'https://studio.youtube.com/',
            prefillsCaption: false,
            note: 'Use the generated tag list in the video Tags field and the first two lines as the visible description.',
            bestTimes: 'Thu-Sun 2-4pm', linkInBody: true
        },
        {
            id: 'linkedin', label: 'LinkedIn', icon: 'fab fa-linkedin-in', colour: '#0A66C2',
            share: 'intent', captionLimit: 3000, idealLength: 600, tagCount: 3,
            urlTemplate: 'https://www.linkedin.com/sharing/share-offsite/?url={url}',
            prefillsCaption: false,
            note: 'Caption is copied for the composer. Angle it at the trade: breeders, groomers, exotic vets, retailers.',
            bestTimes: 'Tue-Thu 8-10am', linkInBody: true
        },
        {
            id: 'reddit', label: 'Reddit', icon: 'fab fa-reddit-alien', colour: '#FF4500',
            share: 'intent', captionLimit: 300, idealLength: 120, tagCount: 0,
            urlTemplate: 'https://www.reddit.com/submit?url={url}&title={text}',
            prefillsCaption: true,
            note: 'No hashtags, no marketing voice. Pick the species subreddit and read its self-promo rule first.',
            bestTimes: 'Weekdays 6-9am ET', linkInBody: false
        },
        {
            id: 'tumblr', label: 'Tumblr', icon: 'fab fa-tumblr', colour: '#36465D',
            share: 'intent', captionLimit: 4096, idealLength: 300, tagCount: 10,
            urlTemplate: 'https://www.tumblr.com/widgets/share/tool?canonicalUrl={url}&caption={text}&tags={tagsCsv}',
            prefillsCaption: true,
            note: 'Tumblr tags are its whole discovery system - use all 10, first 5 matter most.',
            bestTimes: 'Evenings 7-10pm', linkInBody: false
        },
        {
            id: 'whatsapp', label: 'WhatsApp', icon: 'fab fa-whatsapp', colour: '#25D366',
            share: 'intent', captionLimit: 1000, idealLength: 200, tagCount: 0,
            urlTemplate: 'https://api.whatsapp.com/send?text={textWithUrl}',
            prefillsCaption: true,
            note: 'For broadcast lists and customer groups.',
            bestTimes: 'Anytime', linkInBody: true
        },
        {
            id: 'telegram', label: 'Telegram', icon: 'fab fa-telegram', colour: '#26A5E4',
            share: 'intent', captionLimit: 4096, idealLength: 300, tagCount: 3,
            urlTemplate: 'https://t.me/share/url?url={url}&text={text}',
            prefillsCaption: true,
            note: 'Good for a channel of regulars who want new care guides first.',
            bestTimes: 'Anytime', linkInBody: false
        },
        {
            id: 'email', label: 'Email / Newsletter', icon: 'fas fa-envelope', colour: '#6C2BD9',
            share: 'intent', captionLimit: 5000, idealLength: 400, tagCount: 0,
            urlTemplate: 'mailto:?subject={subject}&body={textWithUrl}',
            prefillsCaption: true,
            note: 'Opens your mail client with the subject line and body ready.',
            bestTimes: 'Tue/Thu 10am', linkInBody: true
        }
    ];

    /* ---------- Species / niche knowledge base ----------
       seeds      = head terms worth building posts around
       entities   = semantic terms Google expects on a page about this niche
       behaviours / problems feed the long-tail question templates
       amazon     = product lines that genuinely pair with the niche          */
    const CATEGORIES = {
        dogs: {
            label: 'Dogs', icon: 'fas fa-dog', internal: ['pets.html#supplies'],
            species: ['Labrador Retriever', 'French Bulldog', 'German Shepherd', 'Golden Retriever',
                'Dachshund', 'Border Collie', 'Poodle', 'Shih Tzu', 'Husky', 'senior dog', 'puppy'],
            seeds: ['dog training', 'puppy socialisation', 'crate training', 'dog nutrition',
                'dog grooming', 'leash training', 'dog dental care', 'separation anxiety',
                'dog enrichment', 'dog joint health', 'puppy vaccination schedule', 'dog recall training'],
            entities: ['kibble', 'raw feeding', 'positive reinforcement', 'clicker', 'hip dysplasia',
                'kennel cough', 'heartworm prevention', 'flea and tick', 'dew claw', 'body condition score',
                'high-value treats', 'desensitisation', 'counter-conditioning', 'mental stimulation',
                'brachycephalic', 'spay and neuter', 'microchipping', 'DAP diffuser'],
            behaviours: ['barking at night', 'eating grass', 'pulling on the leash', 'chewing furniture', 'licking its paws'],
            problems: ['hip dysplasia', 'ear infection', 'anxiety', 'dental disease', 'obesity'],
            alts: ['raw diet', 'dry kibble', 'harness', 'slip lead'],
            hashtags: {
                instagram: ['#dogsofinstagram', '#puppylove', '#dogtraining', '#dogmom', '#dogdad',
                    '#dogsofinsta', '#puppytraining', '#rescuedog', '#doglife', '#dogcare',
                    '#positivereinforcement', '#dogenrichment', '#puppiesofinstagram', '#dognutrition'],
                tiktok: ['#dogtok', '#puppytok', '#dogtraining', '#dogtips'],
                x: ['#dogs', '#dogtraining'],
                pinterest: ['#dogtrainingtips', '#puppycare', '#dogmomlife', '#doghacks'],
                facebook: ['#dogcare', '#dogtraining'],
                youtube: ['dog training', 'puppy training', 'dog care tips', 'dog behaviour']
            },
            amazon: [
                { q: 'dog crate furniture style', label: 'Crates & kennels' },
                { q: 'no pull dog harness', label: 'No-pull harnesses' },
                { q: 'interactive dog puzzle toy', label: 'Puzzle & enrichment toys' },
                { q: 'slow feeder dog bowl', label: 'Slow feeders' },
                { q: 'dog dental chews vet approved', label: 'Dental chews' },
                { q: 'dog grooming brush deshedding', label: 'Deshedding tools' },
                { q: 'dog joint supplement glucosamine', label: 'Joint supplements' },
                { q: 'training treat pouch clicker', label: 'Training kit' }
            ]
        },
        cats: {
            label: 'Cats', icon: 'fas fa-cat', internal: ['pets.html#supplies'],
            species: ['Maine Coon', 'Bengal', 'Ragdoll', 'Siamese', 'British Shorthair', 'Sphynx',
                'Persian', 'domestic shorthair', 'kitten', 'senior cat'],
            seeds: ['litter box training', 'cat nutrition', 'indoor cat enrichment', 'cat scratching behaviour',
                'introducing cats', 'cat dental care', 'cat hydration', 'kitten socialisation',
                'cat hairball prevention', 'catio setup', 'cat grooming', 'multi-cat household'],
            entities: ['obligate carnivore', 'wet vs dry food', 'taurine', 'FIV', 'FeLV', 'urinary crystals',
                'FLUTD', 'pheromone diffuser', 'vertical territory', 'resource guarding', 'clumping litter',
                'scratching post sisal', 'play aggression', 'slow blink', 'whisker fatigue', 'hairball'],
            behaviours: ['knocking things off shelves', 'peeing outside the litter box', 'biting during play', 'yowling at night'],
            problems: ['urinary blockage', 'kidney disease', 'dental resorption', 'stress cystitis', 'obesity'],
            alts: ['wet food', 'dry food', 'clumping litter', 'crystal litter'],
            hashtags: {
                instagram: ['#catsofinstagram', '#catlovers', '#kittensofinstagram', '#catmom', '#catdad',
                    '#catcare', '#indoorcat', '#catbehaviour', '#catenrichment', '#rescuecat',
                    '#catnutrition', '#catsofinsta', '#catlife', '#catvet'],
                tiktok: ['#cattok', '#catsoftiktok', '#catcare', '#cattips'],
                x: ['#cats', '#catcare'],
                pinterest: ['#catcaretips', '#indoorcatideas', '#catenrichment', '#diycattree'],
                facebook: ['#catcare', '#catlovers'],
                youtube: ['cat care', 'cat behaviour', 'kitten tips', 'indoor cat enrichment']
            },
            amazon: [
                { q: 'self cleaning litter box', label: 'Litter boxes' },
                { q: 'cat water fountain stainless', label: 'Water fountains' },
                { q: 'sisal cat scratching post tall', label: 'Scratching posts' },
                { q: 'cat wand toy feather', label: 'Wand & chase toys' },
                { q: 'cat window perch hammock', label: 'Window perches' },
                { q: 'cat dental water additive', label: 'Dental care' },
                { q: 'cat pheromone diffuser calming', label: 'Calming diffusers' },
                { q: 'modular cat shelf wall', label: 'Vertical territory' }
            ]
        },
        'small-animals': {
            label: 'Small Animals', icon: 'fas fa-otter', internal: ['pets.html#small-animals'],
            species: ['rabbit', 'guinea pig', 'Syrian hamster', 'dwarf hamster', 'ferret', 'chinchilla',
                'fancy rat', 'gerbil', 'African pygmy hedgehog', 'sugar glider', 'degu'],
            seeds: ['rabbit hutch setup', 'guinea pig bonding', 'hamster cage size', 'ferret proofing',
                'chinchilla dust bath', 'rat enrichment', 'hay based diet', 'small animal bedding',
                'guinea pig vitamin C', 'rabbit litter training', 'hedgehog wheel', 'bonded pair introduction'],
            entities: ['timothy hay', 'coprophagy', 'caecotrophs', 'GI stasis', 'overgrown incisors',
                'bar chewing', 'deep bedding', 'aspen shavings', 'kiln-dried pine', 'scurvy',
                'wheel diameter', 'dust bath', 'exotic vet', 'floor space cm2', 'hidey house',
                'mite treatment', 'wet tail', 'bumblefoot'],
            behaviours: ['chewing the cage bars', 'thumping its back feet', 'popcorning', 'hiding all day'],
            problems: ['GI stasis', 'wet tail', 'bumblefoot', 'mites', 'dental overgrowth'],
            alts: ['wire cage', 'bin cage', 'aspen bedding', 'paper bedding'],
            hashtags: {
                instagram: ['#rabbitsofinstagram', '#guineapigsofinstagram', '#hamstersofinstagram',
                    '#ferretsofinstagram', '#chinchillasofinstagram', '#ratsofinstagram',
                    '#smallpets', '#bunnylove', '#guineapigcare', '#hamstercare', '#hedgehogsofinstagram',
                    '#smallanimalcare', '#bunnycare', '#pocketpets'],
                tiktok: ['#hamstertok', '#bunnytok', '#guineapigtok', '#smallpets'],
                x: ['#smallpets', '#rabbitcare'],
                pinterest: ['#hamstercagesetup', '#guineapigcage', '#rabbithutchideas', '#smallpetcare'],
                facebook: ['#smallpets', '#rabbitcare'],
                youtube: ['hamster care', 'guinea pig care', 'rabbit care', 'small pet cage setup']
            },
            amazon: [
                { q: 'large hamster cage 1000 square inches', label: 'Oversized cages' },
                { q: 'timothy hay guinea pig rabbit', label: 'Timothy hay' },
                { q: 'chinchilla dust bath blue cloud', label: 'Dust baths' },
                { q: 'silent hamster wheel 11 inch', label: 'Silent wheels' },
                { q: 'rabbit litter paper bedding', label: 'Paper bedding' },
                { q: 'guinea pig vitamin c supplement', label: 'Vitamin C' },
                { q: 'wooden hidey house small pet', label: 'Hides & tunnels' },
                { q: 'ferret multi level cage', label: 'Ferret cages' }
            ]
        },
        birds: {
            label: 'Birds', icon: 'fas fa-dove', internal: ['pets.html#exotic'],
            species: ['budgie', 'cockatiel', 'African grey parrot', 'green cheek conure', 'lovebird',
                'canary', 'zebra finch', 'Indian ringneck', 'macaw', 'cockatoo', 'quaker parrot', 'caique'],
            seeds: ['parrot cage size', 'bird foraging toys', 'feather plucking', 'flight training',
                'pellet conversion', 'bird bathing', 'target training', 'bird safe cleaning',
                'cockatiel taming', 'budgie diet', 'parrot vocabulary training', 'aviary setup'],
            entities: ['full spectrum UV lighting', 'cuttlebone', 'formulated pellets', 'seed junkie',
                'air sac', 'PTFE fumes', 'teflon toxicity', 'psittacosis', 'crop', 'moult',
                'blood feather', 'preening', 'wing clipping debate', 'avian vet', 'foraging wheel',
                'perch diameter variety', 'calcium deficiency', 'egg binding', 'night fright'],
            behaviours: ['plucking its feathers', 'screaming in the morning', 'biting its cage bars', 'regurgitating'],
            problems: ['feather plucking', 'egg binding', 'calcium deficiency', 'psittacosis', 'night fright'],
            alts: ['pellets', 'seed mix', 'clipped wings', 'full flight'],
            hashtags: {
                instagram: ['#birdsofinstagram', '#parrotsofinstagram', '#budgiesofinstagram',
                    '#cockatielsofinstagram', '#conuresofinstagram', '#parrotlove', '#birdcare',
                    '#avian', '#birdtraining', '#parrotenrichment', '#birdsofig', '#petbirds',
                    '#foragingtoys', '#birdnutrition'],
                tiktok: ['#birdtok', '#parrottok', '#birdcare', '#birdtraining'],
                x: ['#parrots', '#birdcare'],
                pinterest: ['#parrottoysdiy', '#birdcagesetup', '#budgiecare', '#birdfoodideas'],
                facebook: ['#petbirds', '#parrotcare'],
                youtube: ['parrot training', 'budgie care', 'cockatiel taming', 'bird foraging toys']
            },
            amazon: [
                { q: 'large parrot cage play top', label: 'Parrot cages' },
                { q: 'bird foraging toy shreddable', label: 'Foraging toys' },
                { q: 'harrisons zupreem pellets parrot', label: 'Formulated pellets' },
                { q: 'natural wood bird perch variety', label: 'Natural perches' },
                { q: 'full spectrum bird light uvb', label: 'UVB lighting' },
                { q: 'cuttlebone mineral block bird', label: 'Calcium & minerals' },
                { q: 'bird cage seed catcher cover', label: 'Seed guards' },
                { q: 'parrot training clicker target stick', label: 'Training kit' }
            ]
        },
        reptiles: {
            label: 'Reptiles & Amphibians', icon: 'fas fa-dragon', internal: ['pets.html#reptiles'],
            species: ['bearded dragon', 'leopard gecko', 'crested gecko', 'ball python', 'corn snake',
                'blue tongue skink', 'veiled chameleon', 'Russian tortoise', 'red-eared slider',
                'tokay gecko', 'green anole', 'White\'s tree frog', 'axolotl', 'pacman frog'],
            seeds: ['bioactive enclosure', 'UVB lighting', 'basking temperature', 'humidity gradient',
                'reptile substrate', 'feeder insect gut loading', 'brumation', 'shedding help',
                'bearded dragon setup', 'ball python husbandry', 'tortoise diet', 'crested gecko diet',
                'thermostat wiring', 'quarantine protocol'],
            entities: ['Ferguson zone', 'UVI', 'T5 HO linear bulb', 'deep heat projector',
                'ceramic heat emitter', 'thermal gradient', 'basking surface temperature',
                'ambient humidity', 'calcium with D3', 'metabolic bone disease', 'MBD',
                'dubia roaches', 'black soldier fly larvae', 'gut loading', 'dusting schedule',
                'bioactive substrate', 'springtails', 'isopod clean-up crew', 'impaction',
                'dysecdysis', 'retained shed', 'thermostat probe', 'digital hygrometer',
                'cohabitation risk', 'cryptosporidium', 'quarantine 90 days'],
            behaviours: ['glass surfing', 'refusing to eat', 'gaping its mouth', 'hiding all day'],
            problems: ['metabolic bone disease', 'impaction', 'retained shed', 'respiratory infection', 'mouth rot'],
            alts: ['coil UVB', 'linear T5 UVB', 'heat mat', 'overhead heating'],
            hashtags: {
                instagram: ['#reptilesofinstagram', '#beardeddragon', '#leopardgecko', '#ballpython',
                    '#cornsnake', '#crestedgecko', '#bioactive', '#reptilecare', '#herpetology',
                    '#reptilekeeper', '#snakesofinstagram', '#geckosofinstagram', '#reptileenclosure',
                    '#reptilehusbandry'],
                tiktok: ['#reptiletok', '#snaketok', '#beardeddragon', '#bioactive'],
                x: ['#reptiles', '#herpetology'],
                pinterest: ['#bioactiveterrarium', '#reptileenclosureideas', '#beardeddragonsetup', '#vivariumdesign'],
                facebook: ['#reptilecare', '#bioactive'],
                youtube: ['reptile care', 'bioactive enclosure', 'bearded dragon setup', 'UVB lighting guide']
            },
            amazon: [
                { q: 'arcadia T5 HO uvb reptile', label: 'Linear UVB' },
                { q: 'reptile thermostat dimming', label: 'Thermostats' },
                { q: 'deep heat projector reptile', label: 'Overhead heating' },
                { q: 'bioactive substrate reptile soil', label: 'Bioactive substrate' },
                { q: 'calcium with d3 reptile supplement', label: 'Calcium & vitamins' },
                { q: 'temperature gun infrared reptile', label: 'Temp guns & hygrometers' },
                { q: 'cork bark reptile hide', label: 'Hides & cork bark' },
                { q: 'dubia roaches live feeder', label: 'Live feeders' }
            ]
        },
        aquatics: {
            label: 'Aquatics & Fish', icon: 'fas fa-fish', internal: ['pets.html#supplies'],
            species: ['betta', 'fancy goldfish', 'neon tetra', 'guppy', 'angelfish', 'discus',
                'African cichlid', 'corydoras', 'bristlenose pleco', 'axolotl', 'clownfish',
                'cherry shrimp', 'mystery snail', 'nerite snail'],
            seeds: ['aquarium cycling', 'nitrogen cycle', 'planted tank setup', 'water change schedule',
                'betta tank size', 'reef tank beginner', 'aquarium filtration', 'algae control',
                'fish stocking levels', 'quarantine tank', 'CO2 injection', 'water parameters testing',
                'shrimp tank setup', 'aquascaping'],
            entities: ['ammonia nitrite nitrate', 'beneficial bacteria', 'fishless cycle', 'KH and GH',
                'pH swing', 'TDS', 'dechlorinator', 'sponge filter', 'canister filter', 'hang on back filter',
                'turnover rate', 'dissolved oxygen', 'Seachem Prime', 'root tabs', 'liquid carbon',
                'PAR lighting', 'Dutch aquascape', 'hardscape', 'blackwater tannins', 'ich',
                'swim bladder disease', 'drip acclimation', 'protein skimmer', 'live rock',
                'alkalinity dKH', 'salinity 1.025', 'refugium'],
            behaviours: ['gasping at the surface', 'hiding behind the filter', 'losing its colour', 'clamping its fins'],
            problems: ['ich', 'fin rot', 'ammonia burn', 'swim bladder disease', 'algae bloom'],
            alts: ['sponge filter', 'canister filter', 'sand substrate', 'gravel substrate'],
            hashtags: {
                instagram: ['#aquascaping', '#plantedtank', '#bettafish', '#aquariumhobby', '#freshwateraquarium',
                    '#reeftank', '#shrimptank', '#fishkeeping', '#aquariumsofinstagram', '#nanotank',
                    '#aquaticplants', '#cherryshrimp', '#saltwateraquarium', '#fishtanksetup'],
                tiktok: ['#fishtok', '#aquascaping', '#bettafish', '#plantedtank'],
                x: ['#aquascaping', '#fishkeeping'],
                pinterest: ['#aquascapingideas', '#plantedaquarium', '#bettatanksetup', '#nanoaquarium'],
                facebook: ['#fishkeeping', '#aquascaping'],
                youtube: ['aquarium setup', 'planted tank', 'nitrogen cycle', 'betta care']
            },
            amazon: [
                { q: 'api freshwater master test kit', label: 'Water test kits' },
                { q: 'aquarium sponge filter air pump', label: 'Filtration' },
                { q: 'adjustable aquarium heater 100w', label: 'Heaters' },
                { q: 'full spectrum planted aquarium light', label: 'Plant lighting' },
                { q: 'aquarium root tabs fertilizer', label: 'Plant nutrition' },
                { q: 'seachem prime dechlorinator', label: 'Water conditioners' },
                { q: 'aquarium gravel vacuum siphon', label: 'Water change gear' },
                { q: 'spider wood aquascaping hardscape', label: 'Hardscape' }
            ]
        },
        crustaceans: {
            label: 'Crustaceans', icon: 'fas fa-shrimp', internal: ['pets.html#exotic'],
            species: ['Caribbean hermit crab', 'Ecuadorian hermit crab', 'vampire crab', 'red claw crab',
                'fiddler crab', 'electric blue crayfish', 'dwarf Mexican crayfish', 'Thai micro crab',
                'cherry shrimp', 'Amano shrimp', 'Caridina shrimp'],
            seeds: ['hermit crab crabitat', 'hermit crab moulting', 'vampire crab paludarium',
                'crayfish tank setup', 'shell shop', 'brackish water mix', 'crab humidity',
                'shrimp water parameters', 'moulting calcium', 'crab shell selection', 'fiddler crab care'],
            entities: ['exoskeleton', 'moult cycle', 'destressing', 'surface moult', 'shell shop',
                'turbo shells', 'brackish specific gravity', 'salt and fresh water pools',
                'Instant Ocean', 'cuttlebone calcium', 'deep sand substrate 6 inches',
                'humidity 75-85%', 'gills must stay moist', 'eyestalks', 'copper toxicity',
                'remineraliser', 'TDS 150', 'Caridina vs Neocaridina', 'biofilm', 'blanched vegetables'],
            behaviours: ['burying itself for weeks', 'changing shells constantly', 'climbing out of the tank', 'losing a claw'],
            problems: ['failed moult', 'copper poisoning', 'low humidity stress', 'shell fighting', 'mites'],
            alts: ['brackish', 'fresh water', 'coconut fibre', 'play sand'],
            hashtags: {
                instagram: ['#hermitcrab', '#hermitcrabsofinstagram', '#vampirecrab', '#crabsofinstagram',
                    '#crayfish', '#cherryshrimp', '#shrimpkeeping', '#caridina', '#neocaridina',
                    '#crabitat', '#paludarium', '#invertsofinstagram', '#crustacean', '#shrimptank'],
                tiktok: ['#hermitcrab', '#crabtok', '#shrimptank', '#crayfish'],
                x: ['#hermitcrabs', '#crustaceans'],
                pinterest: ['#crabitatideas', '#hermitcrabtank', '#paludariumsetup', '#shrimptanksetup'],
                facebook: ['#hermitcrabs', '#shrimpkeeping'],
                youtube: ['hermit crab care', 'crabitat setup', 'crayfish tank', 'shrimp tank setup']
            },
            amazon: [
                { q: 'hermit crab shells turbo variety', label: 'Shell shop' },
                { q: 'coconut fiber eco earth substrate', label: 'Substrate' },
                { q: 'instant ocean marine salt small', label: 'Brackish salt mix' },
                { q: 'reptile humidity gauge digital', label: 'Humidity gauges' },
                { q: 'shrimp mineral remineralizer gh', label: 'Remineralisers' },
                { q: 'cuttlebone calcium hermit crab', label: 'Calcium sources' },
                { q: 'shrimp food biofilm powder', label: 'Invert food' },
                { q: 'glass lid terrarium humidity', label: 'Humidity lids' }
            ]
        },
        arthropods: {
            label: 'Arthropods & Inverts', icon: 'fas fa-spider', internal: ['pets.html#exotic'],
            species: ['Chilean rose tarantula', 'Mexican red knee tarantula', 'curly hair tarantula',
                'Brazilian black tarantula', 'emperor scorpion', 'Asian forest scorpion',
                'praying mantis', 'orchid mantis', 'giant African millipede', 'Indian stick insect',
                'dubia roach colony', 'Porcellio laevis isopods', 'bumblebee millipede', 'velvet worm'],
            seeds: ['tarantula enclosure', 'tarantula moulting', 'scorpion humidity', 'mantis nymph care',
                'isopod colony starter', 'millipede substrate depth', 'stick insect food plants',
                'feeder insect colony', 'terrestrial vs arboreal setup', 'premoult signs',
                'tarantula rehousing', 'invert bite risk', 'bioactive isopod culture'],
            entities: ['premoult', 'bald patch on abdomen', 'urticating hairs', 'threat posture',
                'dorsoventral flip', 'ICU myth', 'arboreal cork tube', 'terrestrial burrow depth',
                'coco fibre and topsoil mix', 'water dish always full', 'cross ventilation',
                'ecdysis', 'exuvia', 'book lungs', 'calcium carbonate for millipedes',
                'leaf litter and rotten wood', 'bramble and oak for stick insects',
                'ootheca', 'hatch rate', 'springtail culture', 'Old World vs New World species',
                'venom potency', 'DKS', 'nematode infection'],
            behaviours: ['refusing food before a moult', 'flicking its hairs', 'webbing up its burrow', 'sitting in premoult'],
            problems: ['failed moult', 'dehydration', 'mould bloom', 'nematodes', 'phorid flies'],
            alts: ['terrestrial setup', 'arboreal setup', 'coco fibre', 'topsoil mix'],
            hashtags: {
                instagram: ['#tarantula', '#tarantulasofinstagram', '#invertebrates', '#arachnid',
                    '#scorpion', '#prayingmantis', '#mantisofinstagram', '#millipede', '#isopods',
                    '#isopodsofinstagram', '#bugsofinstagram', '#entomology', '#invertkeeper', '#arachnidsofig'],
                tiktok: ['#tarantulatok', '#bugtok', '#isopods', '#prayingmantis'],
                x: ['#tarantulas', '#invertebrates'],
                pinterest: ['#tarantulaenclosure', '#isopodsetup', '#bioactiveterrarium', '#insectkeeping'],
                facebook: ['#tarantulas', '#invertkeeping'],
                youtube: ['tarantula care', 'tarantula rehousing', 'isopod colony', 'praying mantis care']
            },
            amazon: [
                { q: 'acrylic tarantula enclosure terrestrial', label: 'Invert enclosures' },
                { q: 'coco fiber coir brick substrate', label: 'Substrate' },
                { q: 'cork bark tube arboreal', label: 'Cork bark & hides' },
                { q: 'springtails live culture bioactive', label: 'Clean-up crews' },
                { q: 'isopod starter colony culture', label: 'Isopod cultures' },
                { q: 'long handled feeding tongs reptile', label: 'Feeding tongs' },
                { q: 'calcium carbonate powder millipede', label: 'Millipede calcium' },
                { q: 'small water dish invertebrate', label: 'Water dishes' }
            ]
        },
        general: {
            label: 'General Pet Advice', icon: 'fas fa-paw', internal: ['pets.html', 'about.html'],
            species: ['first pet', 'rescue animal', 'exotic pet', 'family pet', 'apartment pet'],
            seeds: ['choosing a first pet', 'pet budget planning', 'exotic vet checklist',
                'pet emergency kit', 'quarantine new pet', 'pet insurance', 'travelling with pets',
                'pet proofing a home', 'ethical sourcing', 'pet legality by state', 'pet sitter brief'],
            entities: ['CITES permit', 'captive bred vs wild caught', 'exotic vet directory',
                'zoonotic risk', 'biosecurity', 'quarantine period', 'species appropriate husbandry',
                'five welfare needs', 'enrichment', 'body condition scoring', 'emergency fund',
                'pet insurance exclusions', 'rehoming responsibly'],
            behaviours: ['acting out when stressed', 'refusing food after a move'],
            problems: ['stress', 'zoonotic infection', 'poor husbandry', 'impulse buying'],
            alts: ['captive bred', 'wild caught', 'rescue', 'breeder'],
            hashtags: {
                instagram: ['#petcare', '#petadvice', '#exoticpets', '#responsiblepetownership',
                    '#petparents', '#animalwelfare', '#petsofinstagram', '#rescuepets', '#firstpet',
                    '#petbudget', '#petsupplies', '#petlovers', '#petblog', '#animalcare'],
                tiktok: ['#pettok', '#petcare', '#exoticpets', '#pettips'],
                x: ['#petcare', '#exoticpets'],
                pinterest: ['#petcaretips', '#petownerhacks', '#firstpetchecklist', '#petbudgeting'],
                facebook: ['#petcare', '#petadvice'],
                youtube: ['pet care', 'exotic pet advice', 'first pet guide', 'pet checklist']
            },
            amazon: [
                { q: 'pet first aid kit', label: 'First aid kits' },
                { q: 'pet carrier airline approved', label: 'Carriers' },
                { q: 'digital pet scale grams', label: 'Scales' },
                { q: 'pet enclosure thermometer hygrometer', label: 'Monitoring' },
                { q: 'enzymatic pet stain cleaner', label: 'Cleaning' },
                { q: 'pet camera treat dispenser', label: 'Pet cameras' }
            ]
        }
    };

    /* ---------- Editorial angles that reliably earn links & saves ---------- */
    const ANGLES = [
        { id: 'care-sheet', label: 'Species care sheet', intent: 'informational',
          pattern: '{Species} Care Sheet: Housing, Diet and Daily Routine Done Right' },
        { id: 'beginner', label: 'Beginner guide', intent: 'informational',
          pattern: '{Species} for Beginners: The Honest First-Year Guide' },
        { id: 'mistakes', label: 'Mistakes list', intent: 'informational',
          pattern: '7 {Seed} Mistakes That Quietly Harm Your {Species}' },
        { id: 'buyers-guide', label: "Buyer's guide", intent: 'commercial',
          pattern: 'Best Kit for {Seed} in 2026: Tested Picks for Every Budget' },
        { id: 'cost', label: 'Cost breakdown', intent: 'commercial',
          pattern: 'What a {Species} Really Costs: Setup, Monthly and Vet Bills' },
        { id: 'comparison', label: 'Head-to-head', intent: 'comparison',
          pattern: '{Alt} vs {Alt2}: Which Actually Suits Your {Species}?' },
        { id: 'checklist', label: 'Shopping checklist', intent: 'commercial',
          pattern: 'The Complete {Species} Starter Checklist (Nothing Missing)' },
        { id: 'myth', label: 'Myth-buster', intent: 'informational',
          pattern: 'Stop Believing This: {Seed} Myths Vets Keep Correcting' },
        { id: 'troubleshoot', label: 'Problem solver', intent: 'informational',
          pattern: 'Why Is My {Species} {Behaviour}? Causes and Fixes' },
        { id: 'upgrade', label: 'Upgrade path', intent: 'commercial',
          pattern: 'Good, Better, Best: {Seed} Kit at Three Budgets' }
    ];

    /* ---------- Question templates for FAQ schema + People Also Ask ---------- */
    const QUESTION_TEMPLATES = [
        'How much does a {species} cost to keep each month?',
        'What size enclosure does a {species} need?',
        'Is a {species} a good first pet?',
        'What do {species}s eat?',
        'How long do {species}s live?',
        'Why is my {species} {behaviour}?',
        'What are the signs of {problem} in a {species}?',
        'Do {species}s need a specialist vet?',
        'Can {species}s live together?',
        'How often should I clean a {species} enclosure?'
    ];

    return {
        version: '1.0.0',
        MODIFIERS: MODIFIERS,
        GENERIC_TAGS: GENERIC_TAGS,
        STOPWORDS: STOPWORDS,
        PLATFORMS: PLATFORMS,
        CATEGORIES: CATEGORIES,
        ANGLES: ANGLES,
        QUESTION_TEMPLATES: QUESTION_TEMPLATES
    };
})();
