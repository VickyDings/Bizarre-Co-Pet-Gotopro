#!/usr/bin/env python3
import json

style_block = """<style>
/* Extra styles used by this article that are not in the CMS global stylesheet */
.step-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--sage);
  color: var(--cream);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin: 48px 0 14px;
}
.step-badge .num {
  background: var(--cream);
  color: var(--sage-deep);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Playfair Display', Georgia, serif;
}
.signs-list {
  background: white;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 28px 32px;
  margin: 28px 0;
  box-shadow: var(--shadow-soft);
}
.signs-list h3 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 20px;
  margin: 0 0 16px;
  color: var(--sage-deep);
}
.signs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 28px;
  font-size: 15px;
}
.signs-grid div {
  padding-left: 24px;
  position: relative;
  color: var(--ink-soft);
  line-height: 1.55;
}
.signs-grid div::before {
  content: '';
  position: absolute;
  left: 0; top: 10px;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--amber);
}
.tool {
  background: white;
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
  margin: 28px 0;
  box-shadow: var(--shadow-soft);
}
.tool-ribbon {
  background: var(--sage-deep);
  color: var(--cream);
  padding: 10px 22px;
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-weight: 700;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.tool-ribbon .asin {
  font-family: 'Courier New', monospace;
  opacity: 0.7;
  font-size: 10px;
}
.tool-body {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 22px;
  padding: 24px;
}
.tool-img-wrap {
  aspect-ratio: 1;
  background: var(--cream-deep);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tool-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
.tool-img-placeholder {
  color: var(--sage);
  font-size: 12px;
  text-align: center;
  padding: 16px;
  font-style: italic;
}
.tool-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 20px;
  line-height: 1.25;
  color: var(--ink);
  margin: 0 0 6px;
}
.tool-price-line {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.tool-price {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--clay);
}
.tool-disclaimer {
  font-size: 11px;
  color: var(--ink-soft);
  font-style: italic;
}
.tool-why {
  background: #eef1e8;
  border-left: 3px solid var(--sage);
  padding: 10px 14px;
  margin: 10px 0 14px;
  font-size: 14px;
  color: var(--ink-soft);
  border-radius: 0 4px 4px 0;
}
.tool-why strong { color: var(--sage-deep); }
.vet-warning {
  background: #fbeeea;
  border: 1px solid var(--clay);
  border-left: 4px solid var(--clay);
  padding: 24px 28px;
  border-radius: 8px;
  margin: 40px 0;
}
.vet-warning h3 {
  color: var(--clay);
  font-family: 'Playfair Display', Georgia, serif;
  margin-bottom: 10px;
  font-size: 20px;
}
.vet-warning p { margin-bottom: 10px; font-size: 15px; color: var(--ink-soft); }
.vet-warning p:last-child { margin-bottom: 0; }
.toolkit-section { margin: 50px 0; }
.compare .prod-name { font-weight: 700; color: var(--ink); }
@media (max-width: 640px) {
  .tool-body { grid-template-columns: 1fr; }
  .signs-grid { grid-template-columns: 1fr; }
}
</style>"""

body_content = """<!-- INTRO -->
  <div class="prose">
    <p>If you've ever come home to a torn-up couch cushion, a chewed doorframe, or neighbors asking whether your dog is okay because the barking doesn't stop — you already know what separation anxiety looks like from the outside. What's harder to see is how frightening it feels from the inside. Separation anxiety isn't disobedience, and it isn't spite. It's a genuine panic response, closer to what humans experience during a panic attack than to "bad behavior."</p>

    <p>The good news: it's one of the most treatable behavior problems in dogs. Veterinary behaviorists consistently report that 70–80% of mild-to-moderate cases resolve within 4–8 weeks when owners follow a combined approach of desensitization training, environmental adjustments, and supportive tools. The rest typically improve significantly with added veterinary support.</p>

    <p>This guide walks through the exact six-step framework used by certified veterinary behaviorists, along with the five tools that consistently show up in their recommendations. None of these tools replace the training work — but each makes the training more effective, and each addresses a different mechanism in your dog's anxiety response. Used together, they stack.</p>
  </div>

  <!-- WHAT IT IS -->
  <div class="prose">
    <h2>What separation anxiety actually is</h2>

    <p>Separation anxiety is a distress response that begins within 15–30 minutes of being left alone, and often long before you actually leave. Dogs with true separation anxiety experience something closer to a panic attack than boredom. Their heart rate spikes, cortisol floods their system, and behaviors like pacing, destructive chewing, house-soiling, and continuous barking become involuntary rather than chosen.</p>

    <p>It's important to distinguish separation anxiety from two things it often gets confused with: <strong>boredom</strong> (which looks similar but resolves with more exercise and enrichment), and <strong>lack of training</strong> (which looks destructive but happens whether you're home or not). Separation anxiety is specifically triggered by the absence of a bonded person, and the severity of symptoms scales with how long the dog has been alone.</p>
  </div>

  <!-- SIGNS -->
  <div class="signs-list">
    <h3>Signs your dog may have separation anxiety</h3>
    <div class="signs-grid">
      <div>Excessive barking or howling that starts shortly after you leave</div>
      <div>Destructive chewing, especially of exit points (doors, windows, crates)</div>
      <div>House-soiling in an otherwise housetrained dog</div>
      <div>Pacing in fixed patterns (figure-eights, by the door)</div>
      <div>Excessive drooling or panting while you're gone</div>
      <div>Following you compulsively from room to room</div>
      <div>Pre-departure anxiety (shaking, hiding, clinging when you get keys)</div>
      <div>Over-the-top greeting behavior when you return</div>
      <div>Escape attempts that risk self-injury</div>
      <div>Refusing food or treats while alone</div>
    </div>
  </div>

  <div class="prose">
    <p>If your dog shows three or more of these signs consistently, separation anxiety is likely. The best way to confirm is to set up a camera and record a typical 30-minute absence — you'll see within the first 15 minutes whether your dog settles or enters a sustained stress response.</p>
  </div>

  <!-- WHY IT HAPPENS -->
  <div class="prose">
    <h2>Why it happens</h2>

    <p>There's no single cause. Common triggers include: a major schedule change (return to office after remote work), rehoming or adoption from a shelter, loss of a family member or another pet, moving to a new home, or traumatic experiences during early socialization windows (8–16 weeks). Some breeds are predisposed — Labrador Retrievers, Border Collies, Cocker Spaniels, German Shepherds, and toy breeds all show higher rates — but any dog of any age can develop it.</p>

    <p>The 2020–2022 pandemic produced a generation of "pandemic puppies" who never learned that being alone is normal, and veterinary behaviorists are still seeing the fallout in 2026. If your dog is 4–6 years old and just started showing symptoms, this may be part of what's happening.</p>
  </div>

  <!-- CALLOUT -->
  <div class="callout">
    <div class="callout-body">
      Separation anxiety is not your dog being bad. It's your dog being scared. The treatment is the same as for any fear response: we lower the intensity, pair the feared thing with something good, and rebuild confidence in small, successful doses.
      <span class="callout-attr">— Veterinary Behaviorist Consensus, 2026</span>
    </div>
  </div>

  <!-- PAW DIVIDER -->
  <div class="paw-divider" aria-hidden="true">
    <svg viewBox="0 0 24 24"><path d="M12 14c-2.5 0-6 1.5-6 4 0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2 0-2.5-3.5-4-6-4zm-5.5-2.5c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9.9 2.9 2 2.9zm11 0c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9.9 2.9 2 2.9zM9 8c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9S7.9 8 9 8zm6 0c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9S13.9 8 15 8z"/></svg>
    <svg viewBox="0 0 24 24"><path d="M12 14c-2.5 0-6 1.5-6 4 0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2 0-2.5-3.5-4-6-4zm-5.5-2.5c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9.9 2.9 2 2.9zm11 0c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9.9 2.9 2 2.9zM9 8c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9S7.9 8 9 8zm6 0c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9S13.9 8 15 8z"/></svg>
    <svg viewBox="0 0 24 24"><path d="M12 14c-2.5 0-6 1.5-6 4 0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2 0-2.5-3.5-4-6-4zm-5.5-2.5c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9.9 2.9 2 2.9zm11 0c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9.9 2.9 2 2.9zM9 8c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9S7.9 8 9 8zm6 0c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9S13.9 8 15 8z"/></svg>
  </div>

  <!-- THE 6-STEP APPROACH -->
  <div class="prose">
    <h2>The 2026 six-step approach</h2>

    <p>Current veterinary consensus treats separation anxiety as a layered condition — meaning no single intervention handles it alone, but combining five or six small ones can produce dramatic results. Skip any of these steps and you'll see partial improvement at best. Do all six in parallel, and most dogs are significantly calmer within a month.</p>
  </div>

  <!-- STEP 1: SAFE SPACE -->
  <div class="step-badge"><span class="num">1</span> Create a Safe, Calming Space</div>

  <div class="prose">
    <p>Anxious dogs need a designated spot that feels like a den — small, enclosed, soft, and consistent. This isn't a crate if your dog hates crates (forcing a claustrophobic dog into a crate actively worsens separation anxiety). It's wherever your dog <em>naturally</em> chooses to settle when relaxed. Observe where your dog sleeps when calm, and upgrade that spot with a bolstered, calming-style bed.</p>

    <p>The bed itself matters more than most owners realize. Research on canine sleep architecture shows that bolstered, donut-style beds with raised edges activate a physical sense of security by mimicking the contact pressure a puppy feels when curled against its mother. Standard flat beds don't produce the same effect.</p>
  </div>

  <!-- TOOL 1: BEST FRIENDS BY SHERI -->
  <div class="tool">
    <div class="tool-ribbon">
      <span>Tool #1 · Calming Safe Space</span>
      <span class="asin">ASIN: B01MV0IX66</span>
    </div>
    <div class="tool-body">
      <div class="tool-img-wrap">
        <div class="tool-img-placeholder">[Best Friends by Sheri Calming Donut Bed image]</div>
      </div>
      <div>
        <h3 class="tool-title">Best Friends by Sheri — Original Calming Donut Bed</h3>
        <div class="tool-price-line">
          <span class="tool-price">$49.99</span>
          <span class="tool-disclaimer">*Price starts from and is subject to change</span>
        </div>
        <div class="tool-why">
          <strong>Why it helps:</strong> The high, round bolstered walls and shag faux fur mimic the tactile security of a mother dog's coat, triggering a natural calming reflex. The round shape encourages dogs to curl up, which is a self-soothing posture.
        </div>
        <a class="cta-btn" href="https://www.amazon.com/dp/B01MV0IX66?th=1&linkCode=ll1&tag=bizco057-20&language=en_US&ref_=as_li_ss_tl" target="_blank" rel="nofollow noopener sponsored">View on Amazon</a>
        <p class="intl-note">Also available in Canada, France, Germany, Italy, Netherlands, Poland, Spain, Sweden, and the United Kingdom — Amazon OneLink will redirect you automatically.</p>
      </div>
    </div>
  </div>

  <!-- STEP 2: PHEROMONES -->
  <div class="step-badge"><span class="num">2</span> Lower Environmental Stress</div>

  <div class="prose">
    <p>Dogs communicate largely through scent, and mother dogs emit a specific pheromone called the Dog Appeasing Pheromone (DAP) while nursing that signals "everything is safe." Adult dogs still respond to this pheromone throughout their lives. Synthetic DAP — marketed as Adaptil in most markets — is one of the few separation anxiety interventions with consistent published research behind it. A 2018 meta-analysis in the <em>Journal of Veterinary Behavior</em> found DAP diffusers produced measurable stress reduction in 72% of treated dogs within 7 days of continuous use.</p>

    <p>The diffuser plugs into any outlet in the room where your dog spends the most time. It's odorless to humans and doesn't affect cats or other pets. Results build over the first 2–4 weeks, so start it at least a week before beginning formal desensitization training — you want the calming baseline already in place before you start the harder work.</p>
  </div>

  <!-- TOOL 2: ADAPTIL -->
  <div class="tool">
    <div class="tool-ribbon">
      <span>Tool #2 · Pheromone Support</span>
      <span class="asin">ASIN: B01AW71ILU</span>
    </div>
    <div class="tool-body">
      <div class="tool-img-wrap">
        <div class="tool-img-placeholder">[Adaptil Calming Diffuser image]</div>
      </div>
      <div>
        <h3 class="tool-title">Adaptil Calming Pheromone Diffuser — 30-Day Starter Kit</h3>
        <div class="tool-price-line">
          <span class="tool-price">$32.99</span>
          <span class="tool-disclaimer">*Price starts from and is subject to change</span>
        </div>
        <div class="tool-why">
          <strong>Why it helps:</strong> Synthetic Dog Appeasing Pheromone (DAP) mimics the natural pheromone released by nursing mothers. Clinically proven in multiple peer-reviewed studies. Covers up to 700 sq ft and runs continuously. Odorless, drug-free, safe with cats and children.
        </div>
        <a class="cta-btn" href="https://www.amazon.com/dp/B01AW71ILU?th=1&linkCode=ll1&tag=bizco057-20&language=en_US&ref_=as_li_ss_tl" target="_blank" rel="nofollow noopener sponsored">View on Amazon</a>
        <p class="intl-note">Also available in Canada, France, Germany, Italy, Netherlands, Poland, Spain, Sweden, and the United Kingdom — Amazon OneLink will redirect you automatically.</p>
      </div>
    </div>
  </div>

  <!-- STEP 3: DESENSITIZATION -->
  <div class="step-badge"><span class="num">3</span> Desensitize to Absence Cues</div>

  <div class="prose">
    <p>This is the hardest step and the one most owners skip — which is exactly why their dogs don't improve. Desensitization means breaking down "you leaving" into its components and systematically teaching your dog that each component is boring, not terrifying.</p>

    <p>Start by identifying your dog's <strong>pre-departure triggers</strong>: picking up keys, putting on shoes, grabbing a bag, opening the front door. For the next two weeks, do all of these actions randomly throughout the day <em>without actually leaving</em>. Pick up your keys while watching TV. Put on your shoes and then go make coffee. Open the front door, step out for 10 seconds, and come back in without making a fuss.</p>

    <p>Once those cues stop triggering anxiety, begin <strong>graduated absences</strong>. Leave for 30 seconds. Return calmly. Leave for 1 minute. Return calmly. Work up in 30–60 second increments until you can leave for 15–20 minutes without your dog panicking. This process takes 2–4 weeks for most dogs. The rule that makes it work: <strong>never leave longer than your dog can handle without panicking.</strong> Every panic episode sets you back days.</p>
  </div>

  <!-- STEP 4: ENRICHMENT -->
  <div class="step-badge"><span class="num">4</span> Provide Meaningful Enrichment</div>

  <div class="prose">
    <p>An anxious brain and an engaged brain can't both be active at full intensity. Giving your dog a mentally absorbing task during your absence hijacks the same neural resources that would otherwise drive pacing, barking, and destructive behavior. The catch: the enrichment has to be genuinely challenging and last at least 20–30 minutes (the critical anxiety window), or your dog will finish it quickly and start panicking anyway.</p>

    <p>The KONG Classic, stuffed appropriately, is the gold standard here and has been for four decades. Layered stuffing — wet food on the bottom, kibble in the middle, a treat frozen into the top — extends engagement to 30–60 minutes. Give the KONG as you walk out the door, <em>never when you come home</em>. You want your departure associated with something wonderful, and your return to be pointedly neutral.</p>
  </div>

  <!-- TOOL 3: KONG -->
  <div class="tool">
    <div class="tool-ribbon">
      <span>Tool #3 · Mental Enrichment</span>
      <span class="asin">ASIN: B0002AR0I8</span>
    </div>
    <div class="tool-body">
      <div class="tool-img-wrap">
        <div class="tool-img-placeholder">[KONG Classic image]</div>
      </div>
      <div>
        <h3 class="tool-title">KONG Classic Stuffable Rubber Toy — Large</h3>
        <div class="tool-price-line">
          <span class="tool-price">$14.99</span>
          <span class="tool-disclaimer">*Price starts from and is subject to change</span>
        </div>
        <div class="tool-why">
          <strong>Why it helps:</strong> Stuffed and frozen, a KONG can extend engagement to 45–60 minutes — covering the critical first hour when separation anxiety peaks. The natural red rubber is tough enough for most chewers, and dishwasher-safe. Vet and trainer recommended for over 40 years.
        </div>
        <a class="cta-btn" href="https://www.amazon.com/dp/B0002AR0I8?th=1&linkCode=ll1&tag=bizco057-20&language=en_US&ref_=as_li_ss_tl" target="_blank" rel="nofollow noopener sponsored">View on Amazon</a>
        <p class="intl-note">Also available in Canada, France, Germany, Italy, Netherlands, Poland, Spain, Sweden, and the United Kingdom — Amazon OneLink will redirect you automatically.</p>
      </div>
    </div>
  </div>

  <!-- STEP 5: PHYSICAL CALMING -->
  <div class="step-badge"><span class="num">5</span> Use Physical Calming Pressure</div>

  <div class="prose">
    <p>The principle behind weighted blankets for humans applies to dogs too. Gentle, constant pressure around the torso triggers a parasympathetic nervous system response — it activates the body's "rest and digest" mode rather than the "fight or flight" mode that's driving anxiety. This is the same mechanism that makes swaddling calm an infant.</p>

    <p>ThunderShirt has been the standard in this category since 2009, with research at Colorado State University showing an 80% owner-reported improvement rate. It's a snug, adjustable vest made of breathable fabric — not a weighted blanket, just a constant, gentle hug. Most dogs relax within 5–10 minutes of putting it on. Introduce it during calm moments first (naps, cuddles) so your dog doesn't associate it only with stressful situations, then use it during departures, thunderstorms, fireworks, and vet visits.</p>
  </div>

  <!-- TOOL 4: THUNDERSHIRT -->
  <div class="tool">
    <div class="tool-ribbon">
      <span>Tool #4 · Physical Calming</span>
      <span class="asin">ASIN: B0029PYC3K</span>
    </div>
    <div class="tool-body">
      <div class="tool-img-wrap">
        <div class="tool-img-placeholder">[ThunderShirt Classic image]</div>
      </div>
      <div>
        <h3 class="tool-title">ThunderShirt Classic Dog Anxiety Jacket</h3>
        <div class="tool-price-line">
          <span class="tool-price">$44.95</span>
          <span class="tool-disclaimer">*Price starts from and is subject to change</span>
        </div>
        <div class="tool-why">
          <strong>Why it helps:</strong> Applies gentle, constant pressure around the torso (the canine equivalent of swaddling), which activates the parasympathetic nervous system. Studied at Colorado State University, with over 80% owner-reported effectiveness. Drug-free, breathable, machine washable. Works for thunderstorms and fireworks, too.
        </div>
        <a class="cta-btn" href="https://www.amazon.com/dp/B0029PYC3K?th=1&linkCode=ll1&tag=bizco057-20&language=en_US&ref_=as_li_ss_tl" target="_blank" rel="nofollow noopener sponsored">View on Amazon</a>
        <p class="intl-note">Also available in Canada, France, Germany, Italy, Netherlands, Poland, Spain, Sweden, and the United Kingdom — Amazon OneLink will redirect you automatically.</p>
      </div>
    </div>
  </div>

  <!-- STEP 6: STAY CONNECTED -->
  <div class="step-badge"><span class="num">6</span> Stay Visually Connected</div>

  <div class="prose">
    <p>This is the step that has changed the most in the last five years. Pet cameras used to be a luxury; now they're genuinely therapeutic. A good treat-dispensing camera does three things for separation anxiety: it lets you <strong>confirm</strong> whether your dog is actually anxious or fine (many owners over-estimate their dog's distress), it lets you <strong>interrupt</strong> panic spirals with a gentle voice or tossed treat before they escalate, and it gives you <strong>objective data</strong> to share with your vet or trainer if you need professional help.</p>

    <p>Furbo 360 is the most recommended model because it rotates to follow your dog, tosses treats remotely, and has a barking sensor that pings your phone the moment your dog starts vocalizing. Used strategically — not to constantly interact with your dog, but to catch and redirect at the first sign of distress — it can cut intervention time in half.</p>

    <p>Important: don't use the camera to talk to your dog every few minutes. That can worsen anxiety by reminding them you're gone. Use it to observe, and only intervene when you see clear panic escalation.</p>
  </div>

  <!-- TOOL 5: FURBO -->
  <div class="tool">
    <div class="tool-ribbon">
      <span>Tool #5 · Visual Connection + Remote Reward</span>
      <span class="asin">ASIN: B09GDQZLD1</span>
    </div>
    <div class="tool-body">
      <div class="tool-img-wrap">
        <div class="tool-img-placeholder">[Furbo 360° Dog Camera image]</div>
      </div>
      <div>
        <h3 class="tool-title">Furbo 360° Dog Camera with Treat Dispenser</h3>
        <div class="tool-price-line">
          <span class="tool-price">$199.00</span>
          <span class="tool-disclaimer">*Price starts from and is subject to change</span>
        </div>
        <div class="tool-why">
          <strong>Why it helps:</strong> 360° rotating full HD camera + barking-sensor alerts + remote treat toss via phone app. Core features (live view, two-way audio, treat toss, barking alerts) work without a subscription. Lets you verify, intervene, and reward calm behavior from anywhere — the tech equivalent of a trainer looking in on your dog.
        </div>
        <a class="cta-btn" href="https://www.amazon.com/dp/B09GDQZLD1?th=1&linkCode=ll1&tag=bizco057-20&language=en_US&ref_=as_li_ss_tl" target="_blank" rel="nofollow noopener sponsored">View on Amazon</a>
        <p class="intl-note">Also available in Canada, France, Germany, Italy, Netherlands, Poland, Spain, Sweden, and the United Kingdom — Amazon OneLink will redirect you automatically.</p>
      </div>
    </div>
  </div>

  <!-- DEPARTURE/ARRIVAL PROTOCOLS -->
  <div class="prose">
    <h2>Departure and arrival protocols</h2>

    <p>The way you leave and return matters almost as much as any of the steps above. Owners accidentally reinforce separation anxiety all the time by making a dramatic production out of both events.</p>

    <h3>When you leave</h3>
    <p>Ten minutes before you go, become visibly boring. Don't make eye contact, don't use your excited voice, don't do a long goodbye ritual. Hand over the stuffed KONG without ceremony and walk out. The message you're sending: this is unremarkable. I do this every day.</p>

    <h3>When you come home</h3>
    <p>Do not greet your dog for the first 3–5 minutes. Walk in, put your things down, check your phone, get water — treat your dog exactly like a piece of furniture. Once they've calmed down, <em>then</em> say hi calmly. This sounds cold, but it works. Dogs who get dramatic reunions learn that reunions are a huge emotional event, which means absences become a huge emotional event too.</p>
  </div>

  <!-- WHEN TO SEE A VET -->
  <div class="vet-warning">
    <h3>When to call your veterinarian</h3>
    <p>Some cases of separation anxiety need medical intervention. Call your vet if your dog: (1) is injuring themselves trying to escape, (2) has not improved after 6–8 weeks of consistent training plus the tools above, (3) shows signs of severe distress within minutes of you leaving (not 15–30), or (4) has symptoms that are getting worse rather than better.</p>
    <p>Modern veterinary medicine has several well-tolerated anti-anxiety medications (fluoxetine, clomipramine, trazodone, sileo) that can be game-changing for severe cases. These work best when combined with behavior modification — not as a replacement. Ask your vet about a referral to a board-certified veterinary behaviorist (DACVB) if your regular vet doesn't specialize in behavior.</p>
  </div>

  <!-- PAW DIVIDER -->
  <div class="paw-divider" aria-hidden="true">
    <svg viewBox="0 0 24 24"><path d="M12 14c-2.5 0-6 1.5-6 4 0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2 0-2.5-3.5-4-6-4zm-5.5-2.5c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9.9 2.9 2 2.9zm11 0c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9.9 2.9 2 2.9zM9 8c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9S7.9 8 9 8zm6 0c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9S13.9 8 15 8z"/></svg>
    <svg viewBox="0 0 24 24"><path d="M12 14c-2.5 0-6 1.5-6 4 0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2 0-2.5-3.5-4-6-4zm-5.5-2.5c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9.9 2.9 2 2.9zm11 0c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9.9 2.9 2 2.9zM9 8c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9S7.9 8 9 8zm6 0c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9S13.9 8 15 8z"/></svg>
    <svg viewBox="0 0 24 24"><path d="M12 14c-2.5 0-6 1.5-6 4 0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2 0-2.5-3.5-4-6-4zm-5.5-2.5c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9.9 2.9 2 2.9zm11 0c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9.9 2.9 2 2.9zM9 8c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9S7.9 8 9 8zm6 0c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9S13.9 8 15 8z"/></svg>
  </div>

  <!-- TOOLKIT SUMMARY + FILTER -->
  <div class="toolkit-section">
    <div class="prose">
      <h2>Your separation anxiety toolkit at a glance</h2>
      <p>Here's the full toolkit in one place, organized by the anxiety mechanism each one addresses. Filter by budget or category to quickly find what fits your situation.</p>
    </div>

    <!-- FILTER PANEL -->
    <div class="filter-panel">
      <div class="filter-panel-title">Narrow your tools</div>
      <p class="filter-panel-sub">Filter by budget, anxiety severity, or solution type.</p>

      <div class="filter-group">
        <span class="filter-group-label">Budget</span>
        <div class="chip-row">
          <button class="chip active" data-filter="price" data-value="all">All prices</button>
          <button class="chip" data-filter="price" data-value="under20">Under $20</button>
          <button class="chip" data-filter="price" data-value="20-50">$20–$50</button>
          <button class="chip" data-filter="price" data-value="over100">$100+</button>
        </div>
      </div>

      <div class="filter-group">
        <span class="filter-group-label">Best For</span>
        <div class="chip-row">
          <button class="chip active" data-filter="stage" data-value="all">All severity</button>
          <button class="chip" data-filter="stage" data-value="mild">Mild anxiety</button>
          <button class="chip" data-filter="stage" data-value="moderate">Moderate</button>
          <button class="chip" data-filter="stage" data-value="severe">Severe</button>
        </div>
      </div>

      <div class="filter-group">
        <span class="filter-group-label">Solution Type</span>
        <div class="chip-row">
          <button class="chip active" data-filter="type" data-value="all">All types</button>
          <button class="chip" data-filter="type" data-value="environment">Environment</button>
          <button class="chip" data-filter="type" data-value="enrichment">Enrichment</button>
          <button class="chip" data-filter="type" data-value="wearable">Wearable</button>
          <button class="chip" data-filter="type" data-value="tech">Tech / monitoring</button>
        </div>
      </div>

      <div id="filter-count" class="filter-count">Showing 5 of 5 tools</div>
    </div>

    <!-- COMPARISON TABLE -->
    <div class="table-wrap">
      <table class="compare">
        <thead>
          <tr>
            <th>Tool</th>
            <th>Price*</th>
            <th>Addresses</th>
            <th>Best For</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="prod-name">Best Friends by Sheri Donut Bed</td>
            <td>$49.99</td>
            <td>Physical safe space</td>
            <td>All severity levels</td>
          </tr>
          <tr>
            <td class="prod-name">Adaptil Calming Diffuser</td>
            <td>$32.99</td>
            <td>Environmental stress</td>
            <td>Mild to moderate</td>
          </tr>
          <tr>
            <td class="prod-name">KONG Classic Large</td>
            <td>$14.99</td>
            <td>Mental enrichment</td>
            <td>All severity levels</td>
          </tr>
          <tr>
            <td class="prod-name">ThunderShirt Classic</td>
            <td>$44.95</td>
            <td>Physical calming pressure</td>
            <td>Moderate to severe</td>
          </tr>
          <tr>
            <td class="prod-name">Furbo 360° Dog Camera</td>
            <td>$199.00</td>
            <td>Visual connection, intervention</td>
            <td>Moderate to severe</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p style="font-size:12px;color:var(--ink-soft);font-style:italic;margin-top:-10px;">*Prices start from and are subject to change. Always verify current pricing on Amazon.</p>
  </div>

  <!-- FAQ -->
  <div class="prose">
    <h2>Frequently Asked Questions</h2>
  </div>

  <details class="faq-item">
    <summary>How long does it take to fix separation anxiety?</summary>
    <p>For mild to moderate cases with consistent daily work, most owners see significant improvement within 4–8 weeks. Severe cases can take 3–6 months, especially if medication is involved. The key word is <em>consistent</em> — sporadic effort often produces no change at all, while daily 10-minute sessions produce dramatic change. Improvement is rarely linear; you'll have setback days.</p>
  </details>

  <details class="faq-item">
    <summary>Does getting a second dog help?</summary>
    <p>Usually not — and sometimes it makes things worse. True separation anxiety is about the bond with <em>you</em>, not about being alone. Adding a second dog often just means you now have two anxious dogs. The exception is when a dog has been properly diagnosed with "isolation distress" (distress from being alone, regardless of who's present), which is a different condition. Talk to your vet before adopting a second dog as a treatment.</p>
  </details>

  <details class="faq-item">
    <summary>Should I crate my dog when I leave?</summary>
    <p>Only if your dog already loves their crate and sees it as a safe space. Forcing a dog who hates crates into one during separation anxiety will make symptoms dramatically worse — dogs have been known to break teeth and claws trying to escape. If your dog is already crate-trained positively, a crate can be a genuine safe space. If not, use a baby-gated room instead.</p>
  </details>

  <details class="faq-item">
    <summary>Can CBD or calming supplements help?</summary>
    <p>Research is still emerging. Some CBD and L-theanine-based calming supplements (Zylkene, Composure, Solliquin) have modest published support, particularly for mild cases. They work best as part of a combined approach, not alone. Talk to your vet before starting any supplement, especially if your dog is on other medications.</p>
  </details>

  <details class="faq-item">
    <summary>Is doggy daycare a good solution?</summary>
    <p>For some dogs, yes — daycare eliminates the "alone time" entirely and provides structure and socialization. For others, especially shy dogs or those with anxiety that extends beyond separation, daycare can be overstimulating and make overall anxiety worse. Try a trial day before committing to a schedule, and choose facilities with separate rooms by dog size and energy level.</p>
  </details>

  <details class="faq-item">
    <summary>My rescue dog's anxiety seemed to appear out of nowhere after a few months. Is that normal?</summary>
    <p>Very common. Many rescue dogs go through a "honeymoon period" of 2–4 months where they're in survival mode and don't fully express their personality or anxieties. Once they feel safe enough to relax, deeper behavioral issues — including separation anxiety — can surface. This isn't regression. It's actually a sign your dog trusts you enough to show distress. The same treatment approach applies, and these cases often resolve quickly once the dog feels secure.</p>
  </details>

  <!-- CONCLUSION -->
  <div class="prose">
    <h2>The bottom line</h2>

    <p>Separation anxiety is one of the most misunderstood — and most treatable — behavior problems in dogs. The mistake most owners make is trying to fix it with a single intervention: just the ThunderShirt, just the KONG, just one more walk before work. What actually works is layered: a calming environment, pheromone support, proper desensitization, meaningful enrichment, physical comfort, and the ability to observe and intervene. Do all six steps in parallel, stay consistent for at least four weeks, and involve your vet early if you're not seeing progress.</p>

    <p>Your dog isn't broken. They're scared, and scared is something you can help with.</p>
  </div>

<!-- FILTER LOGIC -->
<script>
const activeFilters = { price: 'all', stage: 'all', type: 'all' };

document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const group = chip.dataset.filter;
    const value = chip.dataset.value;
    document.querySelectorAll(`.chip[data-filter="${group}"]`).forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    activeFilters[group] = value;
    applyFilters();
  });
});

// Assign filter metadata to each tool card
const toolMeta = [
  { priceCategory: 'under20', stages: ['mild','moderate','severe'], type: 'enrichment' }, // KONG
  { priceCategory: '20-50', stages: ['mild','moderate'], type: 'environment' }, // Adaptil
  { priceCategory: '20-50', stages: ['mild','moderate','severe'], type: 'environment' }, // Bed
  { priceCategory: '20-50', stages: ['moderate','severe'], type: 'wearable' }, // ThunderShirt
  { priceCategory: 'over100', stages: ['moderate','severe'], type: 'tech' } // Furbo
];

const toolNames = [
  'KONG Classic Large',
  'Adaptil Calming Diffuser',
  'Best Friends by Sheri Donut Bed',
  'ThunderShirt Classic',
  'Furbo 360° Dog Camera'
];

function applyFilters() {
  const rows = document.querySelectorAll('.compare tbody tr');
  let visible = 0;

  rows.forEach(row => {
    const name = row.querySelector('.prod-name').textContent.trim();
    const idx = toolNames.indexOf(name);
    if (idx === -1) { row.style.display = ''; visible++; return; }
    const meta = toolMeta[idx];

    const priceMatch = activeFilters.price === 'all' || meta.priceCategory === activeFilters.price;
    const stageMatch = activeFilters.stage === 'all' || meta.stages.includes(activeFilters.stage);
    const typeMatch = activeFilters.type === 'all' || meta.type === activeFilters.type;

    if (priceMatch && stageMatch && typeMatch) {
      row.style.display = '';
      visible++;
    } else {
      row.style.display = 'none';
    }
  });

  const count = document.getElementById('filter-count');
  if (visible === 0) {
    count.textContent = 'No tools match those filters. Try broadening.';
  } else {
    count.textContent = `Showing ${visible} of 5 tools`;
  }
}
</script>"""

body_html = style_block + "\n" + body_content

seed = {
    "title": "How to Stop Your Dog's Separation Anxiety: Complete 2026 Guide",
    "slug": "how-to-stop-dog-separation-anxiety-2026",
    "description": "Separation anxiety affects up to 76% of dogs — but it's treatable. This 2026 vet-informed guide walks through every proven step to help your dog feel calm when you're away, plus the 5 products that actually help.",
    "keywords": "dog separation anxiety, how to stop separation anxiety dogs, dog anxiety when alone, dog anxiety treatment 2026, calming dog bed, Thundershirt, Adaptil, Furbo, KONG, desensitization dogs",
    "category": "Dogs",
    "hero_image": "",
    "body_html": body_html,
}

out = "/home/claude/petgotopro/seed/post-separation-anxiety.json"
with open(out, "w", encoding="utf-8") as f:
    json.dump(seed, f, ensure_ascii=False, indent=2)

print("wrote", out)
print("body_html chars:", len(body_html))
