import { ProductionPackage } from './types';

export const INITIAL_DRAFTS: ProductionPackage[] = [
  {
    id: 'draft-fyrrion-01',
    brand_key: 'fyrrion',
    brand_name: 'Fyrrion Cybersecurity',
    channel: 'LinkedIn',
    audience: 'Enterprise CISOs & Board',
    topic: 'Living off the land operational patterns and endpoint detection gaps',
    hook_options: [
      'Adversaries are no longer dropping malware into your environment. They are using your signed admin binaries against you.',
      'Dwell time does not start with a breach alert. It starts three months earlier in an unmonitored certutil execution.',
      'If your detection strategy depends on known malicious file hashes, you have zero visibility into living-off-the-land techniques.',
    ],
    selected_hook:
      'Adversaries are no longer dropping malware into your environment. They are using your signed admin binaries against you.',
    post_body:
      'Living-off-the-land binaries and scripts (LOLBAS) represent the starkest asymmetry in contemporary defensive telemetry.\n\nWhen an unauthorized operator executes certutil, bitsadmin, or wmic, no signature triggers. The binary is signed by the OS vendor. The hash is trusted. The execution path appears legitimate.\n\nYet the memory space tells a different story.\n\nReducing dwell time requires shifting defensive investment from signature-based perimeter defenses toward behavioral telemetry fidelity at the kernel level.\n\n1. Instrument command-line argument monitoring with parent-child process correlation.\n2. Treat PowerShell and WMI execution outside defined administrative maintenance windows as anomalous by default.\n3. Enforce strict application control policies preventing dual-use binaries from executing outbound network socket operations.\n\nZero-trust begins when we stop evaluating binaries by who signed them and start evaluating them by what telemetry they generate.',
    voiceover_script:
      '[0:00-0:04 Hook]\n"Your biggest adversary is currently executing code using your own signed system binaries."\n\n[0:04-0:15 Tension]\n"Living-off-the-land techniques bypass traditional hash verification. When certutil downloads an external payload, perimeter firewalls register legitimate traffic."\n\n[0:15-0:30 Diagnostic]\n"The solution is high-fidelity telemetry correlation at the endpoint kernel. Tracking parent-child process lineages, memory injection signatures, and unauthorized outbound sockets."\n\n[0:30-0:42 Command]\n"Telemetry fidelity is not optional. It is the boundary between containment and catastrophic dwell time."\n\n[Music / Tone: Stark minimalist electronic pulse, dark cinematic sub-bass, 110 BPM]',
    visual_headline: 'LOLBAS: Weaponizing Your Own Admin Binaries',
    image_prompt:
      'Cinematic stark cybersecurity operations center, glowing terminal monitors showing process lineage trees, deep dark navy and terminal cyan telemetry lines, high-contrast command line interface, photo-real minimalist tech aesthetic, 8k',
    hashtags: '#Cybersecurity #ThreatHunting #LOLBAS #EnterpriseSecurity #ZeroTrust',
    status: 'pending_review',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    version_history: [
      {
        id: 'v-1-draft-fyrrion-01',
        version: 1,
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        author: 'AI Generation',
        note: 'Initial multi-agent pipeline generation (Copywriter + Voiceover + Visual)',
        changeSummary: 'Original autonomous draft output',
        snapshot: {
          channel: 'LinkedIn',
          post_body: 'Adversaries increasingly leverage built-in OS tools (LOLBAS) to circumvent signature-based antivirus solutions.\n\nBy executing native binaries like certutil or wmic, attackers generate minimal alerts while maintaining persistence.\n\nDefenders must configure enhanced audit policies, parent-process telemetry tracking, and block unnecessary administrative binaries from contacting the public internet.\n\nFocus on behavioral detection over static file signatures.',
          selected_hook: 'Adversaries are no longer dropping malware into your environment. They are using your signed admin binaries against you.',
          visual_headline: 'LOLBAS: Living Off The Land Binaries',
          voiceover_script: '[0:00-0:05 Hook]\n"Your biggest adversary is currently executing code using your own signed system binaries."\n\n[0:05-0:20 Context]\n"Living-off-the-land techniques bypass traditional hash verification."\n\n[0:20-0:40 Protocol]\n"Implement kernel-level behavioral telemetry before dwell time turns catastrophic."',
          hashtags: '#Cybersecurity #ThreatHunting #ZeroTrust',
          topic: 'Living off the land operational patterns and endpoint detection gaps',
        },
      },
      {
        id: 'v-2-draft-fyrrion-01',
        version: 2,
        timestamp: new Date(Date.now() - 3600000 * 1.2).toISOString(),
        author: 'Manual Edit',
        note: 'Manual editorial polish: added structured 3-point remediation checklist & tightened telemetry phrasing',
        changeSummary: 'Expanded remediation protocol from 1 paragraph into 3 numbered operational commands; updated headline to weaponizing admin binaries',
        snapshot: {
          channel: 'LinkedIn',
          post_body: 'Living-off-the-land binaries and scripts (LOLBAS) represent the starkest asymmetry in contemporary defensive telemetry.\n\nWhen an unauthorized operator executes certutil, bitsadmin, or wmic, no signature triggers. The binary is signed by the OS vendor. The hash is trusted. The execution path appears legitimate.\n\nYet the memory space tells a different story.\n\nReducing dwell time requires shifting defensive investment from signature-based perimeter defenses toward behavioral telemetry fidelity at the kernel level.\n\n1. Instrument command-line argument monitoring with parent-child process correlation.\n2. Treat PowerShell and WMI execution outside defined administrative maintenance windows as anomalous by default.\n3. Enforce strict application control policies preventing dual-use binaries from executing outbound network socket operations.\n\nZero-trust begins when we stop evaluating binaries by who signed them and start evaluating them by what telemetry they generate.',
          selected_hook: 'Adversaries are no longer dropping malware into your environment. They are using your signed admin binaries against you.',
          visual_headline: 'LOLBAS: Weaponizing Your Own Admin Binaries',
          voiceover_script: '[0:00-0:04 Hook]\n"Your biggest adversary is currently executing code using your own signed system binaries."\n\n[0:04-0:15 Tension]\n"Living-off-the-land techniques bypass traditional hash verification. When certutil downloads an external payload, perimeter firewalls register legitimate traffic."\n\n[0:15-0:30 Diagnostic]\n"The solution is high-fidelity telemetry correlation at the endpoint kernel. Tracking parent-child process lineages, memory injection signatures, and unauthorized outbound sockets."\n\n[0:30-0:42 Command]\n"Telemetry fidelity is not optional. It is the boundary between containment and catastrophic dwell time."\n\n[Music / Tone: Stark minimalist electronic pulse, dark cinematic sub-bass, 110 BPM]',
          hashtags: '#Cybersecurity #ThreatHunting #LOLBAS #EnterpriseSecurity #ZeroTrust',
          topic: 'Living off the land operational patterns and endpoint detection gaps',
        },
      },
    ],
  },
  {
    id: 'draft-bhw-01',
    brand_key: 'bhw_pr',
    brand_name: 'BH&W Public Relations Firm',
    channel: 'LinkedIn',
    audience: 'Corporate Executives & Founders in Crisis',
    topic: 'The tactical deployment of strategic silence during hostile regulatory inquiries',
    hook_options: [
      'In high-stakes corporate inquiries, the fastest way to surrender narrative control is a premature press release.',
      'Strategic silence is not inaction. It is the deliberate construction of an evidentiary perimeter.',
      'When regulatory scrutiny intensifies, words spoken without discovery parity create permanent institutional liability.',
    ],
    selected_hook:
      'In high-stakes corporate inquiries, the fastest way to surrender narrative control is a premature press release.',
    post_body:
      'The instinct to issue an immediate public rebuttal during an unfolding inquiry is almost universal among leadership teams. It is also frequently fatal.\n\nPremature statements box counsel into rigid factual assertions before internal discovery has concluded. They feed the news cycle while handing opposing parties a recorded benchmark for subsequent cross-examination.\n\nNarrative architecture demands disciplined restraint:\n\n• Establish a strict communications perimeter. Limit external interaction to procedural confirmation.\n• Ensure full parity between legal counsel and executive spokespersons before any substantive position is drafted.\n• Recognize that the media cycle operates in 15-minute bursts, while regulatory outcomes endure for decades.\n\nStrategic silence establishes measured institutional authority. It communicates that leadership is deliberate, calculated, and unfazed by manufactured urgency.',
    voiceover_script:
      '[0:00-0:05 Hook]\n"When regulatory scrutiny strikes, executive panic manifests as hasty public statements."\n\n[0:05-0:18 Counsel]\n"Every unverified sentence issued in haste becomes an institutional hostage during discovery. Strategic silence is not retreat—it is containment."\n\n[0:18-0:32 Doctrine]\n"Constructing narrative architecture requires closing the perimeter, completing factual verification, and speaking only with absolute evidentiary command."\n\n[0:32-0:45 Principle]\n"Measure words not by today\'s headlines, but by tomorrow\'s sworn depositions."\n\n[Music / Tone: Stately orchestral strings, low measured cellos, sober institutional gravitas]',
    visual_headline: 'Strategic Silence: Maintaining Narrative Perimeter Under Scrutiny',
    image_prompt:
      'Moody executive boardroom overlooking a stormy metropolitan skyline at twilight, mahogany table with leather binders, architectural symmetry, warm antique gold lighting accents against deep navy shadows, cinematic 35mm film grain',
    hashtags: '#CrisisManagement #CorporateGovernance #ExecutiveCounsel #LegalStrategy',
    status: 'pending_review',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'draft-bes-01',
    brand_key: 'bes_outkast',
    brand_name: 'Bes Outkast Society the Magazine',
    channel: 'Instagram',
    audience: 'Sartorial Enthusiasts',
    magazine_column: 'The Sartorial Dissection',
    topic: 'Neapolitan roped shoulders vs British structured drape: structural authority in silhouette',
    hook_options: [
      'The shoulder of a tailored jacket is not a seam; it is the architectural foundation of human presence.',
      'Soft Neapolitan spalla camicia versus British military canvas: two opposing philosophies of physical authority.',
      'Before a gentleman speaks in the council chamber, the drape of his worsted wool has already delivered his opening argument.',
    ],
    selected_hook:
      'The shoulder of a tailored jacket is not a seam; it is the architectural foundation of human presence.',
    post_body:
      'Observe the stark dichotomy of sartorial construction.\n\nTo the north: Savile Row\'s structured chest canvas, roped shoulder heads, and heavy worsted drape. A silhouette engineered like ceremonial armor, projecting unyielding discipline and imperial permanence.\n\nTo the south: Naples, where the spalla camicia shuns padding altogether. Shirred sleeve heads follow the natural articulation of the clavicle, lending an effortless, tactile cadence that whispers rather than commands.\n\nNeither is superior; both are calculated psychological instruments.\n\nWhen commanding high-friction negotiations, the structured roped shoulder imposes physical boundaries. When orchestrating informal allegiances, the fluid drape invites proximity while retaining rigorous elegance.\n\nChoose your construction according to the theater you intend to dominate.',
    voiceover_script:
      '[0:00-0:04 Hook]\n"The cut of a jacket shoulder is never decorative. It is structural psychology."\n\n[0:04-0:16 Contrast]\n"Consider the British roped shoulder—firm horsehair canvas, angular, commanding ceremonial gravitas. Then contrast the Neapolitan spalla camicia—unpadded, tactile, articulating with natural human movement."\n\n[0:16-0:30 Meaning]\n"One establishes a fortress; the other commands through effortless nonchalance. In both realms, worsted wool acts as armor."\n\n[0:30-0:42 Exit]\n"Dress not for the mirror, but for the room you must hold."\n\n[Music / Tone: Warm vintage jazz noir, muted trumpet over slow double bass, Parisian atelier ambiance]',
    visual_headline: 'The Shoulder: Architectural Psychology in Bespoke Tailoring',
    image_prompt:
      'Master tailor atelier in Florence, rich dark burgundy and espresso tones, vintage shears on chalk-marked worsted wool fabric, antique gold measuring tape, natural window light falling on a structured jacket silhouette, editorial Vogue Hommes style',
    hashtags: '#BespokeTailoring #SartorialStyle #SavileRow #NeapolitanTailoring #MenswearCritic',
    status: 'pending_review',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'draft-nuecofab-01',
    brand_key: 'nuecofab',
    brand_name: 'Nuecofab',
    channel: 'LinkedIn',
    audience: 'Heavy-Duty Fleet Owners',
    topic: 'Calculating real-world duty cycles and payload degradation in commercial EV fleets',
    hook_options: [
      'An electric tractor that looks cost-effective in an OEM brochure can bankrupt a fleet on route duty cycles.',
      'Battery weight is not an abstraction. It is a direct deduction from commercial payload capacity.',
      'If your clean-tech procurement model omits seasonal thermal auxiliary draw, your ROI estimates are off by 28%.',
    ],
    selected_hook:
      'An electric tractor that looks cost-effective in an OEM brochure can bankrupt a fleet on route duty cycles.',
    post_body:
      'The clean-tech fleet transition fails when engineering realities are subordinated to marketing proclamations.\n\nCommercial freight margins exist within narrow gross-vehicle-weight boundaries. Every 1,000 lbs of auxiliary lithium pack is 1,000 lbs of revenue-generating cargo eliminated from the bill of lading.\n\nOperational telemetry reveals three critical variables fleet managers must model:\n\n1. True Duty Cycle Depletion: Severe weather heating and cooling loads increase battery draw by up to 34%, compressing effective range below multi-shift turnaround requirements.\n2. Chassis Fatigue Dynamics: Higher tare weight stresses suspension and tire duty cycles, accelerating component lifecycle maintenance costs.\n3. Turnaround Utility: Depot charging dwell times must match driver shift-hour regulations to avoid stranded asset overhead.\n\nPragmatic engineering demands spec-driven validation before capital deployment.',
    voiceover_script:
      '[0:00-0:05 Hook]\n"OEM marketing brochures do not haul freight. Operating specs and payload calculations do."\n\n[0:05-0:16 Reality]\n"Every pound of lithium battery pack added to achieve range is a pound of revenue payload deducted from the trailer."\n\n[0:16-0:30 Diagnostics]\n"When winter ambient temperatures drop, auxiliary thermal conditioning consumes over a third of battery capacity. Duty cycle projections collapse unless engineered around worst-case conditions."\n\n[0:30-0:42 Bottom Line]\n"Evaluate commercial clean tech by lifecycle cost per ton-mile, not romantic slogans."\n\n[Music / Tone: Industrial mechanical rhythm, gritty bass pulses, precise percussive accents, 90 BPM]',
    visual_headline: 'Duty Cycles & Payload Reality in Heavy EV Fleets',
    image_prompt:
      'Industrial heavy freight distribution terminal at night, electric semi-truck chassis on high-strength alloy test rig, emerald green diagnostics HUD overlay on steel components, realistic rain-slicked asphalt, commercial photography',
    hashtags: '#FleetOperations #CleanTechLogistics #HeavyDutyEV #IndustrialEngineering #LifecycleCost',
    status: 'approved',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'draft-porch-01',
    brand_key: 'porch_md',
    brand_name: 'Porch MD',
    channel: 'Substack',
    audience: 'Tort Attorneys & Practice Directors',
    topic: 'Evaluating hidden mold and volatile organic compounds behind finished drywall',
    hook_options: [
      'Clean surface paint hides structural negligence. Forensic spore testing reveals it.',
      'In building envelope litigation, standard air cassettes miss 70% of wall-cavity fungal burdens.',
      'Premises safety is an evidentiary standard, not an aesthetic judgment.',
    ],
    selected_hook:
      'Clean surface paint hides structural negligence. Forensic spore testing reveals it.',
    post_body:
      'Surface inspections are the primary refuge of premises negligence.\n\nWhen property managers encounter moisture intrusion, the prevailing expedient is cosmetic: apply biocidal sealant, replace stained baseboards, and apply fresh coats of low-odor acrylic paint. The premises appear pristine to the untrained observer.\n\nYet beneath the gypsum board, elevated moisture gradients cultivate Chaetomium and Stachybotrys colonizations that vent mycotoxins into HVAC return plenums.\n\nForensic restorative protocols require invasive cavity sampling:\n• Wall-cavity air testing via calibrated micro-tubing.\n• Moisture mapping using non-destructive radio frequency hygrometry.\n• Gas chromatography mass spectrometry (GC-MS) for microbial volatile organic compounds (mVOCs).\n\nWhen representing injured tenants or occupational claimants, documenting the hidden toxic load transforms anecdotal symptoms into verifiable evidence.',
    voiceover_script:
      '[0:00-0:05 Hook]\n"A freshly painted wall is the most common disguise for severe structural negligence."\n\n[0:05-0:17 Investigation]\n"When moisture breaches building envelopes, cosmetic repairs seal fungal colonies inside the drywall. The resulting toxic load vents directly into living spaces."\n\n[0:17-0:32 Evidentiary Standard]\n"Forensic inspection requires non-destructive moisture profiling and wall-cavity micro-sampling to establish proximate cause."\n\n[0:32-0:44 Verdict]\n"True environmental safety is clinical and evidentiary—never cosmetic."\n\n[Music / Tone: Clean ambient medical soundscape, calm forensic piano motif, serene acoustic precision]',
    visual_headline: 'Forensic Environmental Inspection: Unmasking Hidden Cavity Toxins',
    image_prompt:
      'Forensic building scientist wearing protective lab gloves holding digital laser moisture hygrometer against a cleanly cut wall section, clinical blue illumination, microscope slide background overlay, ultra-detailed documentary style',
    hashtags: '#PremisesLiability #ForensicScience #IndoorAirQuality #EnvironmentalHealth #BuildingSafety',
    status: 'approved',
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
  {
    id: 'draft-hilton-01',
    brand_key: 'hilton_head',
    brand_name: 'Hilton Head Leadership Summit',
    channel: 'LinkedIn',
    audience: 'Senior Executives & Board Chairs',
    topic: 'Fiduciary foresight: navigating generational capital re-allocation in turbulent macro climates',
    hook_options: [
      'Quarterly earnings calls satisfy market noise. Generational stewardship preserves institutional longevity.',
      'The board chair who manages for next quarter\'s multiple surrenders the firm\'s next decade.',
      'In turbulent capital markets, macro-coherence is the rarest enterprise virtue.',
    ],
    selected_hook:
      'Quarterly earnings calls satisfy market noise. Generational stewardship preserves institutional longevity.',
    post_body:
      'The central dilemma facing enterprise leadership is the friction between transient capital market sentiment and durable capital allocation.\n\nWhen volatility spikes, reactive boards contract into defensive austerity or chase short-lived cyclical bubbles. Both impulses dismantle institutional compounding.\n\nLong-horizon governance requires fiduciary foresight:\n\n1. Capital Architecture Durability: Stress-test balance sheet leverage against sustained rate environments, ensuring operational resilience without forced asset divestiture.\n2. Independent Board Composition: Prioritize directors with counter-cyclical operating scars over compliant generalists.\n3. Strategic Horizon Insulation: Protect core R&D and institutional succession pipelines from short-term margin compression.\n\nEnterprise statesmanship is demonstrated not in tranquil waters, but in the unyielding stewardship of permanent value during macro turbulence.',
    voiceover_script:
      '[0:00-0:05 Hook]\n"Managing for next quarter\'s multiple is the surest way to surrender the firm\'s next decade."\n\n[0:05-0:18 Governance]\n"Market volatility tempts leadership into reactionary posture. True fiduciary foresight demands anchoring capital allocation in decade-long compounding."\n\n[0:18-0:32 Board Stewardship]\n"Surround the table with directors whose judgment was forged in prior crises. Insulate generational assets from transient market noise."\n\n[0:32-0:45 Legacy]\n"Stewardship is measured by what endures after the turbulence subsides."\n\n[Music / Tone: Regal dignified brass and cello resonance, slow sovereign progression, summit boardroom ambiance]',
    visual_headline: 'Fiduciary Foresight: Navigating Macro Turbulence',
    image_prompt:
      'Grand architectural summit rotunda with circular boardroom table, polished brass accents, mahogany paneling, dignified business leaders in quiet deliberation, warm coastal golden hour light filtering through grand arched windows, majestic 8k',
    hashtags: '#BoardGovernance #ExecutiveLeadership #CapitalAllocation #EnterpriseStrategy #FiduciaryDuty',
    status: 'approved',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'draft-creatives-01',
    brand_key: 'creatives',
    brand_name: 'The International Consortium of Creatives',
    channel: 'Instagram',
    audience: 'Multidisciplinary Designers',
    topic: 'Creative friction as the engine of trans-continental architectural resonance',
    hook_options: [
      'Harmony in creative teams produces comfort. Friction produces monuments.',
      'When typography collides with industrial architecture, a new global visual syntax emerges.',
      'Automated templates offer frictionless execution—and complete cultural oblivion.',
    ],
    selected_hook:
      'Harmony in creative teams produces comfort. Friction produces monuments.',
    post_body:
      'The greatest threat to contemporary design is the erasure of creative friction.\n\nAlgorithmic homogenization and frictionless design systems have yielded a sterile global aesthetic: predictable grids, polite palettes, and soulless layouts that dissolve into collective amnesia.\n\nResonance is forged at boundaries:\n\n• The collision between Swiss typographic rigidity and brutalist architectural concrete.\n• The spatial rhythm of kinetic digital installations interrupting historical stone courtyards.\n• Cross-disciplinary syntax: forcing acoustic designers and generative coders into the same physical working space.\n\nWe do not seek consensus. We cultivate productive friction until the work vibrates with undeniable cultural presence.',
    voiceover_script:
      '[0:00-0:05 Hook]\n"Frictionless design has created a sterile world. It is time to restore creative tension."\n\n[0:05-0:18 Vision]\n"When disciplines collide—when typography crashes into raw concrete, and sound artists disrupt spatial architecture—something profound happens."\n\n[0:18-0:32 Manifesto]\n"Resonance is not found in standardized templates. It is born in the heat where disparate artistic visions clash."\n\n[0:32-0:44 Resonance]\n"Demand friction. It is the only catalyst that resists cultural oblivion."\n\n[Music / Tone: Dynamic avant-garde percussion, kinetic modular synthesizer arpeggios, atmospheric purple reverb]',
    visual_headline: 'Creative Friction: The Engine of Cultural Resonance',
    image_prompt:
      'Avant-garde architectural installation in an international contemporary museum, kinetic geometric light sculptures reflecting off raw brutalist concrete walls, electric amethyst and magenta lighting, high-fashion spatial composition, 8k',
    hashtags: '#MultidisciplinaryDesign #CreativeDirection #TypographyInMotion #SpatialArchitecture #DesignManifesto',
    status: 'rejected',
    rejection_reason:
      'Tone requires sharper focus on industrial designers rather than general museum spaces.',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
  {
    id: 'draft-fyrrion-bluesky',
    brand_key: 'fyrrion',
    brand_name: 'Fyrrion Cybersecurity',
    channel: 'Bluesky',
    audience: 'SOC Analysts & Threat Hunters',
    topic: 'Can we have an intellectually honest conversation about why standard EDR misses LOLBAS?',
    hook_options: [
      'Can we have an intellectually honest conversation about why standard EDR doesn\'t solve the real detection gap?',
      'The biggest problem with modern SOC telemetry isn\'t volume—it\'s that we reward the wrong metrics.',
      'Working through an eBPF telemetry challenge. When living-off-the-land binaries abuse signed tools, where do you draw the line?',
    ],
    selected_hook:
      'Can we have an intellectually honest conversation about why standard EDR doesn\'t solve the real detection gap?',
    post_body:
      'Can we have an intellectually honest conversation about why standard EDR doesn\'t stop living-off-the-land attacks? When certutil executes an outbound socket, your hash tables see a trusted binary. Until telemetry correlation moves to kernel parent-child process tracking, dwell time won\'t budge.',
    voiceover_script:
      '[0:00-0:03 Hook]\n"Your EDR sees a signed binary. The kernel sees a covert tunnel."\n\n[0:03-0:15 Analysis]\n"Telemetry fidelity isn\'t about alert volume—it\'s about process lineage in memory."\n\n[Music / Tone: Command-line terminal hum]',
    visual_headline: 'EDR Blindspots: LOLBAS Telemetry Gaps',
    image_prompt:
      'High-contrast terminal command line interface showing process lineage trees, deep navy and terminal cyan telemetry lines, minimalist cybersecurity aesthetic',
    hashtags: '#Cybersecurity #Bluesky #InfoSec #ZeroTrust',
    status: 'pending_review',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'draft-bes-threads',
    brand_key: 'bes_outkast',
    brand_name: 'Bes Outkast Society the Magazine',
    channel: 'Threads',
    audience: 'Sartorial Enthusiasts',
    magazine_column: 'Cultural Critique & Decadence',
    topic: 'Why fast-fashion silhouette disintegration destroys institutional gravitas',
    hook_options: [
      'Unpopular opinion: Most people aren’t poorly dressed because of budget—they’re wearing disposable silhouettes with zero drape. Agree or disagree?',
      'Can we normalize admitting that polyester stretch suiting looks completely unprofessional in daylight?',
      'The older I get, the more I realize that worsted wool and high-twist drape beats trendy fits every time.',
    ],
    selected_hook:
      'Unpopular opinion: Most people aren’t poorly dressed because of budget—they’re wearing disposable silhouettes with zero drape. Agree or disagree?',
    post_body:
      'Unpopular opinion: Most suiting failures aren\'t about budget—they\'re about disposable silhouettes. When fabric lacks structural drape and roped shoulder integrity, institutional gravitas evaporates. Real tailoring is psychological armor. Agree or disagree?',
    voiceover_script:
      '[0:00-0:04 Hook]\n"A suit without structural canvas is merely costume."\n\n[0:04-0:15 Cadence]\n"Worsted wool holds tension. Sharkskin twill reflects intent. Dress for permanent silhouette."\n\n[Music / Tone: Slow muted trumpet over vintage jazz noir]',
    visual_headline: 'Silhouette: Tailoring as Psychological Armor',
    image_prompt:
      'Tailor cutting table in Florence, dark wine velvet and sharkskin worsted wool cloth, antique gold measuring calipers, editorial high-fashion lighting',
    hashtags: '#Threads #Bespoke #Menswear #Tailoring',
    status: 'pending_review',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'draft-porch-pinterest',
    brand_key: 'porch_md',
    brand_name: 'Porch MD',
    channel: 'Pinterest',
    audience: 'Chronic Illness & Cancer Patients',
    topic: 'Visual guide: Evaluating hidden mold and air-pathway integrity behind finished drywall',
    hook_options: [
      'The ultimate visual blueprint for premises air-pathway safety (save this Pin for your home inspection).',
      'Before and after: The exact restorative protocol that transforms sub-floor environmental burden.',
      'Stop pinning cosmetic fixes. Here is the verified clinical guide to indoor toxic load.',
    ],
    selected_hook:
      'The ultimate visual blueprint for premises air-pathway safety (save this Pin for your home inspection).',
    post_body:
      'THE CLINICAL PREMISES BLUEPRINT: Hidden Mold & Wall Cavity Inspection Guide.\n\nCosmetic remedies like fresh paint and surface bleach often seal fungal colonizations inside finished drywall. When looking for root environmental burden, standard air cassettes miss up to 70% of cavity burdens.\n\nClinical Inspection Protocol:\n1. Non-destructive RF hygrometry moisture profiling.\n2. Wall-cavity micro-cassette air sampling.\n3. HVAC plenum inspection for particulate and mVOC venting.\n4. Biophilic containment and positive-pressure HEPA filtration.\n\nSave this Pin to your Wellness Sanctuary or Home Inspection board for technical reference.',
    voiceover_script:
      '[0:00-0:04 Hook]\n"Clean surface paint is the primary disguise for premises negligence."\n\n[0:04-0:18 Protocol]\n"Forensic inspection requires non-destructive moisture profiling and wall-cavity micro-sampling to establish proximate cause."\n\n[Music / Tone: Serene acoustic piano, clinical air soundscape]',
    visual_headline: 'Forensic Wall Cavity Inspection Blueprint',
    image_prompt:
      'Forensic building scientist testing wall cavity with precision digital moisture meter, clinical cyan and navy blue ambient lighting, clean infographic layout, 8k',
    hashtags: '#Pinterest #IndoorAirQuality #MoldRemediation #EnvironmentalHealth #HomeSafety',
    status: 'approved',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'draft-nuecofab-tiktok',
    brand_key: 'nuecofab',
    brand_name: 'Nuecofab',
    channel: 'TikTok',
    audience: 'Heavy-Duty Fleet Owners',
    topic: 'Why auxiliary battery weight ruins EV commercial freight payload margins',
    hook_options: [
      'This single structural shift took our results from payload deficits to 15% margin gains in 72 hours.',
      'Stop running standard EV duty cycle projections immediately unless you want stranded tractors on your route.',
      'What OEM brochures tell you about EV trucks vs. what actually happens on scale tare weight.',
    ],
    selected_hook:
      'What OEM brochures tell you about EV trucks vs. what actually happens on scale tare weight.',
    post_body:
      'OEM brochures don\'t haul freight. Real payload calculations do. When you add 6,000 lbs of lithium battery packs, that is 6,000 lbs of revenue cargo deducted from the bill of lading. Watch what happens when winter heating loads hit duty cycles.',
    voiceover_script:
      '[0:00-0:03 Hook]\n"Every pound of lithium battery is a pound of lost freight revenue."\n\n[0:03-0:15 Breakdown]\n"In commercial transport, lifecycle cost per ton-mile is the only spec that counts."\n\n[Music / Tone: Gritty industrial bass rhythm, 90 BPM]',
    visual_headline: 'EV Heavy Fleet: Payload Reality vs Marketing',
    image_prompt:
      'Heavy duty electric semi truck on chassis dynamometer, industrial emerald HUD diagnostics overlay, rain-slicked warehouse pavement, commercial photography',
    hashtags: '#TikTok #FleetManagement #Trucking #EVTrucks #Engineering',
    status: 'approved',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];
