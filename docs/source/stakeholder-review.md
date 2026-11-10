# Stakeholder review

Every reviewer likes the core idea, and almost every objection is about how the system meets real people, not about the physics. Three messages repeat. The system must be invisible on the shooting day. It must scale down to one camera as well as up to four stages. And the data it creates must be open, trustworthy and legally clean.

| Theme | Raised by | What the plan should change |
| --- | --- | --- |
| Invisible on the day | Producer, cinematographer, small and large crews | Set up in parallel with lighting; never hold the camera; a fully passive mode (no splitter, no codes) that still gives tracking and rig removal |
| A ladder from one Core to hundreds | Solo creator, small crew, investor | Battery and wireless timing as a normal mode; phones as witnesses; printed calibration target; automatic gear recognition; cloud solve per shot |
| Open, reversible results | VFX artist, studio, competitors | Open take-package format; per-pixel provenance; every removal comes with its matte and an off switch |
| Who owns the light | Cinematographer | The shot lighting is locked as reference; every change made in post is logged and shown to the cinematographer |
| Consent, privacy, security | Audience, studio, large crew | Consent recorded with every actor scan; bystander blur on by default; encryption on Cores and magazines |
| Focus | Investor, engineer | Ship a wedge first (Core, Camera Adapter, Witness Heads, rig removal); defer the Spectral Back camera |
| Departments | Producer, medium and large crews | A defined capture role; clear ownership of Pods per department; standing set mode for series |
| Ecosystem versus clones | Competitors, engineer | Certify third-party Heads so cloners become suppliers; keep the moat in the format, solve and calibration library |

**Where they disagree.** The engineer wants an open Head specification; competitors say that is how they'd copy the cheap half. Certification is the middle ground. The producer sees post relighting as savings; the cinematographer sees it as a threat to authorship. The investor wants studios and rental houses as first customers; the solo creator argues creators should be. A product that works with phones and one Core can serve both: the same format, at the bottom and the top of the ladder.

## Producer

*"I don't buy technology. I buy days back."*

My job is getting the film made on time and on budget, so I read this as a spreadsheet. On the plus side, the post column is huge. On a typical effects-heavy show, a large share of the VFX bill goes on roto, paint-out, matchmove and plate prep. That is labour that adds nothing creative. If the take package arrives with the rigs already removed and the camera already solved, my VFX bids get smaller and, more importantly, more predictable. The confidence map is the part I'd frame and hang on the wall. A vendor could bid per shot against a known data quality instead of padding every bid for unknowns. The scenario tests also show something I care about: wires, pods and crash mats that today cost me paint-out shots become an overnight automatic step.

Now the column that worries me. Look at the baseline setup list. Twelve steps before the first take, including scanning, tagging every stand and a calibration pass. My most expensive hour is the first hour of the shooting day, with a hundred people standing around. If this system ever holds the camera, I will turn it off and it will never come back. It has to set up in parallel with lighting, and it has to be able to fail silently without stopping a take. The plan says "graceful failure", and I want that in the contract.

I also see a new department. Somebody owns tagging, calibration and the set brain. That's a head count, a day rate, overtime and an insurance line. Then there's the data. Forty-four Cores recording locally at high rates means petabytes over a feature. Somebody pays for storage and for the overnight solve.

What I want: rental pricing per day, bundled with a technician, like any camera package. A one-page cost comparison against a real show's VFX bill. A privacy and consent policy I can hand to my lawyers, especially for actor scans and street shoots.

What I'm against: buying anything outright, and any feature that needs the director's permission to work.

## Manufacturer and engineer

*"One Core is a beautiful idea and a dangerous one."*

I like the architecture. One brain, one connector, one clock, one firmware. Every unit I sell makes the next one cheaper, and every bug fixed in the Core is fixed everywhere. The scenario tests back this up: three very different shoots needed new Bodies and Head modes, never a new brain. Building a light stage out of the same Light Engines and Optic Heads is exactly the kind of result I want.

But I see the traps. The first is that **one Core has to serve the hungriest Head**. If it has enough FPGA, GPU and bandwidth for a depth camera, it is over-specified, too hot and too expensive for a Light Probe. A fanless box with a GPU in it is a thermal problem I can't wish away on a hot stage. I might need two power grades of the same Core board (same firmware, same connector, different chips fitted), and that still counts as one design.

The second is the **connector**. Once I ship it, I'm stuck with it for a decade. If I get the lane count or power budget wrong, every future Head pays. I'd rather overbuild the connector than the Core.

The third is **timing**. Sub-microsecond time over the same cable as data, through truss, across a stage, at a price I can mass-produce, is the hardest engineering in the whole plan, and everything depends on it.

Then there's the work nobody sees. That means radio certification in every country, eye-safety ratings for the infrared emitters and the pattern projector, and laser rules for media capture. It also means firmware compatibility between a 2027 Core and a 2032 Head, and keeping a lens-twin library alive, which needs lens makers to share optical designs.

What I wish for: a published Head specification, so others build Heads and I only build Cores and the best Heads. A factory calibration rig that is itself built from Cores.

What I'm against: building the Spectral Back camera before the Core has shipped in volume. A camera is a company on its own.

## VFX artist

*"Give me the data, not the answer."*

I have spent weeks of my life painting wires out frame by frame and rotoscoping hair against a green screen. If half of what is in this plan works, I get to spend that time on the part of the job I trained for. The things I want most are, in order: a camera solve I don't have to fight, the lens twin (distortion and breathing handled properly at last), per-light layers of a real plate, and actor reflectance so a CG creature's light actually lands on a real face. The confidence map is honest in a way the industry rarely is, and it tells me where to look first.

What I don't trust is automatic removal. A clean plate that is 98% right is worse than a dirty one, because I can't see the 2% until a supervisor finds it in dailies on a big screen. A slightly wrong shadow, a reflection with the wrong blur, a costume that was re-simulated a little too smoothly. I need every removal to come with its matte, its source views and a switch to turn it off, so I can redo it by hand where it fails.

I'm also wary of the data volume. A take package with forty streams is no help if my workstation chokes loading it. I want light proxies by default and the heavy data on request.

The formats matter more than anything. If this lives in a proprietary viewer, my studio won't adopt it. OpenUSD, EXR and the standard colour pipeline, readable in the compositing and 3D tools we already use, is the minimum.

There is a worry I'll say out loud: this removes a lot of entry-level work. Paint and roto are how many artists start. The industry will need a new first rung.

What I wish for: per-pixel provenance (which sensor and which solve produced this pixel), and a way to re-run any solve step with my own fixes.

What I'm against: black boxes, and producers who read "automatic" as "free".

## Director and cinematographer

*"If I can feel it on set, it has failed."*

The director in me likes one big thing: freedom from the green screen. I'd rather put an actor in a real room, with real fire and real glass, and know the rigs and wires will disappear. The creature scenario is exactly what I want. My actor talks to a person, not a tennis ball, and the creature still ends up in the frame with real light on it. Choosing motion blur and shutter after the shoot, as the ideal doc describes, is creatively thrilling.

The cinematographer in me is suspicious, and with good reason. My job is the image. Three things in this plan touch it directly.

First, **the splitter in the matte box**. Any glass in front of my lens changes flare, contrast and veiling glare, even if it only reflects infrared. I will test it on my favourite vintage lenses, and if it softens the image, it comes off.

Second, **coded light**. You're telling me my lights are being flickered at high frequency "invisibly". I've seen invisible flicker become visible at 120 fps, on a rolling shutter, or in a phone camera on the B-unit. The scenario test admits older fixtures have to be marked uncoded, and they may be exactly the ones I love.

Third, and most important: **relighting in post**. Per-light layers mean someone can change my lighting after I've left. In the wrong hands that's a producer brightening a face I deliberately kept in shadow. I want my lighting marked as the reference. I want any change made in post logged and shown to me.

Smaller things matter as well. A tablet showing me where I'm "allowed" to put a flag is a tool, not an instruction. Witness Cores on the truss must not limit where I hang lights. Anamorphic and rehoused vintage lenses must be supported, not just modern primes.

What I wish for: a version that is totally passive, with no splitter and no codes, which still gives me camera tracking and rig removal.

What I'm against: "we'll fix it in post" becoming the reason nobody lights properly on the day.

## Audience member

*"I don't care how you did it. I care whether I believed it."*

I'll never see a Core or a Pod, and I don't want to. What I notice is when something looks fake. Usually that's a CG character whose light doesn't match the actor next to it, or a set that feels like nobody was ever in it. When I read this plan, what I take from it is "more of the film was real, and the fake parts are lit by the real light". That's what I want. The films I love most feel physical. Real glass breaking and a real fire in the room, with the creature lit by that fire, sounds like a better film than a performer in a grey void.

I do have worries, and they aren't technical. The first is trust. If a studio can capture an actor's face so precisely it can relight and re-render them, what stops it making scenes the actor never shot? I'd want to know the people on screen agreed to how their scans are used.

The second is the car chase. I live in a city where films shoot. I didn't sign up to be scanned by cameras on a picture car. I was relieved the plan blurs untagged faces on the device, and I'd want that to be the default, not an option.

The third is sameness. If every film runs through the same pipeline, will they all start to look alike? I hope directors use this to do braver things, not safer ones.

What I wish for: films that cost less to make, so studios take more risks. Fewer obvious green-screen scenes.

What I'm against: digital doubles of actors used without real consent, and ticket prices that go up to pay for any of it.

## VC investor

*"Great vision. Now show me the first thing you can sell in 18 months."*

I like this pitch more than most hardware pitches I see, for one reason: the modularity is a business model, not just an engineering choice. One Core design means manufacturing scale. Heads mean upsell. Pods mean volume. The software (set brain, solve, registry) is where the margin and the recurring revenue live. If the take package format becomes the way productions hand data to VFX vendors, you have a standard, and standards are moats.

Now the concerns, bluntly.

**Scope.** This is five companies in one: a networking-and-timing company, a camera company, a lighting company, a 3D reconstruction company and a post-production software company. Each has established competitors. A seed-stage team cannot build all of it. Your own phasing helps, but phase 1 is still a lot.

**Hardware capital.** Hardware burns cash on tooling, certification, inventory and returns. I want to know how much of the value you can show with off-the-shelf parts before you tool a single custom Core.

**Market size.** Big productions are few, and their VFX budgets are large but slow to change suppliers. Small creators are many but pay little. I need a clear entry point, a buyer, and a price.

**Founder risk.** A solo engineer with a compelling vision is how many great companies start. It's also how many die. I'd want a co-founder from production or VFX who can sell to studios.

What I'd fund: a wedge product. For example, Core plus Camera Adapter plus a handful of Witness Heads, sold as "precise camera tracking and automatic rig removal". It solves a paid pain today, rents through existing rental houses, and every unit sold becomes the installed base for later Heads. Software priced per production or per solved minute.

What I'm against: the Spectral Back camera in the first three years, and any plan that needs a studio to change how it shoots before it pays.

## Competitors and cloners

*"We don't need to beat you. We just need to copy the easy half."*

There are two kinds of us. The established players own one slice each today: camera tracking systems, optical motion capture, LED volume makers, lighting manufacturers and camera makers. Then there are the fast cloners, who will look at whatever ships and make a cheaper version within a year.

**What we'd copy first.** Pods and Tags. They're simple, cheap and sold in volume. A cloner can make a compatible encoder or IMU pod for a fraction of your price, especially if you publish the Head specification as your engineer wants. Your open spec is a gift to us.

**What established players would do.** A motion capture company adds a "witness mode" to its existing cameras and offers rig removal as a software upgrade to studios it already supplies. A lighting manufacturer builds coding into its own fixtures and keeps the codes proprietary, so it controls the light layers, not you. A camera maker adds better lens metadata and genlock, which makes your Camera Adapter less necessary. None of us needs to build your whole system. Each of us erodes one Head.

**What we actually fear.** Not the hardware. We fear the registry, the take package format and the solve. If productions start asking vendors for "the take package", every one of our products becomes a source that feeds your format. At that point you set the rules. We also fear your calibration and lens-twin library, because it gets better with every shoot and can't be cloned from a teardown.

**Where you're vulnerable.** Your timing and Core are the hard part to build and the easy part to replace with a standard industrial network. Your coded light needs fixture makers to cooperate. You also need to be on many productions before the data network effect starts.

What we'd wish for, if we were you: certify third-party Heads, so cloners become your suppliers. Keep the solve and the format yours, and make it open enough that we feel we must support it.

What we'd lobby against: any industry standard built around your format.

## Solo, low to zero budget creator

*"Your example kit has 44 Cores. I have one camera, two lights and a weekend."*

I'm the person who would get the most out of this and can afford the least of it. I shoot alone or with a friend. I do my own VFX at night on one computer. Every hour I spend rotoscoping a light stand out of a shot is an hour I'm not making the next film. Rig removal, a solved camera and relighting are the difference between a short that looks homemade and one that doesn't.

But every page of the plan assumes a stage, a truss, a gaffer and a DIT cart. Fibre runs, a Clock Core with GNSS, a calibration wand, a set brain on tablets. I don't have any of that, and I don't have time to tag twenty items before I shoot.

What would work for me is the same system scaled down to the floor:

- **One Core on my camera** with the Camera Adapter, running off my camera battery.
- **My phone as a witness.** Phones already have good cameras, an IMU and accurate time. A free app that turns a phone into a Witness Head and Tag would give me three or four witnesses from old phones in a drawer.
- **A cheap Light Coder Pod** for my two LED panels.
- **A printed calibration target** instead of a powered wand.
- **Cloud solve, pay per shot.** I don't want to own the compute.

The confidence map matters even more to me than to a studio. With only three witnesses, I need the system to tell me honestly where it couldn't see, and to do the best job it can with less data instead of refusing to work.

What I wish for: a starter kit under the price of a decent lens, and the same file format the studios get, so my work is portable. A community library of scanned gear.

What I'm against: features locked behind a minimum kit size, subscriptions that hold my footage hostage, and a product that treats people like me as the cheap tier instead of the first customers.

## Small crew

*"We do four locations in a day. Nothing gets a dedicated person."*

We're five to fifteen people making commercials, music videos and indie features. We move fast and we rent everything. This plan is attractive because our clients increasingly want effects we can't afford to do the old way. Shooting in a real location and removing the rigs later beats renting a stage with a green screen.

Our problem is time and people. There's no capture department on a crew like ours. Whoever runs this is also the DIT, the data wrangler or the second AC. So the system has to set up in the time it takes to unload the lighting truck, about 30 minutes. It also has to pack down without anyone babysitting it.

Things that would kill it for us:

- **Cables.** A fibre spine across a location we're in for three hours isn't happening. Battery Cores, wireless timing, and record-local-merge-later (which the car chase scenario already invented) should be the normal mode for us, not the exception.
- **Tagging every stand.** We need the system to recognise common gear on its own from the scanned library, and only ask us to tag the odd things.
- **Separate calibration.** Ideally it calibrates itself from the scene while we light, with the wand as a fallback.
- **Data.** We often hand drives to the client at wrap. The take package needs a "small" export that fits on what we already carry.

What we like: the kit scales. An 8-Core kit for us and a 44-Core kit for a stage are the same product, so our rental house can stock it. It also helps that the same Cores can go on a car, a rooftop or a stage.

What we wish for: a "location preset" where the set brain tells us the minimum kit for the shot we describe, and the solve does its best with whatever we managed to place.

What we're against: anything that requires a stage, a truss or a pre-scan day.

## Medium crew

*"We shoot the same three sets for six months. That changes everything."*

We're a TV series or a mid-budget feature, thirty to eighty people. For us, the economics of this system are better than for anyone else. On a series, standing sets are rigged once and used for a whole season. The scan, witness placement, light coding and calibration happen once and are then reused for every episode. What is a burden on a one-off shoot becomes a fixed cost spread over hundreds of shots.

We also have the hardest consistency problem in the industry. Several directors, several VFX vendors across a season, the same set lit slightly differently each week. A single registry and a single take package format across the whole season would be a big step up. Every vendor would get the same camera solve quality, the same set scan and the same lighting data.

Our concerns are about people and departments, not physics.

- **Who owns what.** Light Coder Pods sit on fixtures, so electrics will say they're theirs. Witness Cores on truss are rigging. The set brain is near the DIT. Tags on props belong to the props department. Unions and department heads need a clear answer, or the system becomes everyone's job and nobody's.
- **Second unit.** We often shoot two units at once. The kit has to split cleanly into two independent systems and merge later.
- **Season-long data.** Petabytes over a season, with VFX vendors pulling shots for months after wrap. We need a proper archive and access system, not drives on a shelf.

What we like: the set brain's warnings during rehearsal. On a TV schedule, avoiding one paint-out shot per episode pays for a lot.

What we wish for: "standing set mode", where the system stays rigged between shooting days, checks its own calibration every morning, and is ready before the crew arrives.

What we're against: a kit that only works when the vendor's own technician is on set every day.

## Large crew

*"Two hundred people, three units, four stages. Show me it doesn't fall over."*

We're the people on the floor of a big feature: grips, electrics, camera, stunts, effects, the VFX supervisor and their data wranglers. We already work with tracking systems, motion capture, LED volumes and witness cameras from several vendors, each with its own cables, clock and operator. The single biggest thing this plan offers us is consolidation: one clock, one network, one registry instead of five systems that don't talk to each other. The Bridge Head matters as much as any sensor here. We'll keep using some existing gear, and it has to join the same timeline.

At our scale, the problems are reliability and interference.

- **Radio.** Hundreds of Tags, wireless video, comms, motion control and the stunt team's own systems in one building. Tags must be robust and must never interfere with anything safety-critical.
- **Safety.** The Bridge Head reads winch controllers in the wire stunt scenario. That's fine as long as it only ever reads. Nothing in this stack may ever send commands to stunt, rigging or motion control systems. Infrared emitters and the pattern projector need eye-safety ratings our safety officer can sign off.
- **Redundancy.** A failed Clock Core on a four-stage shoot can't take everything down. We need a backup master that takes over automatically.
- **Security.** On a big film, plates and scans leak. Every Core holds unreleased footage and actor scans. Encryption on the Core and the magazine is essential.
- **Support.** A vendor technician on call at all hours, and spares on site.

What we like: the four contamination regions shown live. That's what a good VFX supervisor does in their head today, now visible to every department. It will also stop a lot of arguments.

What we wish for: multi-stage and multi-unit sync as a standard feature, and the registry shared across units so a prop scanned on stage A is known on stage B.

What we're against: a system that adds a sixth set of cables instead of replacing the other five.

## Big production (the studio)

*"Every shoot makes data we own forever. Who controls it?"*

We're the studio, the company behind a slate of large films and series. We think in years and franchises. The crew sees a capture system. We see an asset factory. A fully scanned set, its materials, its lighting and the actors' reflectance can be reused for sequels, spin-off series, games and marketing. That's the most valuable idea in this plan for us, and the original documents barely mention it.

What we like: standard formats at the edges (scene files, image layers, colour pipeline), because we move work between many VFX vendors and never want one to hold our data. Predictable post budgets across a slate. A single system we can standardise on across productions, so our crews and vendors learn it once.

What concerns us:

- **Data ownership.** Everything recorded belongs to the production, without exception. No vendor training on our footage, no telemetry leaving the set without our permission, and a clear right to keep everything if the vendor goes out of business.
- **Actor likeness.** Light stage scans and per-take reflectance are digital replicas. Union agreements and contracts now govern how replicas are made, stored and reused. The system has to record consent, limit use to what was agreed, and let us prove it. For us this is a legal requirement, not an ethics footnote.
- **Security.** Our biggest titles are leak targets. We want the security audits we demand from any vendor holding our assets.
- **Vendor risk.** A start-up holding the keys to our pipeline is a risk. We'd want the format openly documented and the solve reproducible.

What we wish for: an enterprise tier with our own on-premises solve and archive, cross-production asset libraries, and a seat on any standards body around the take package.

What we're against: being locked in, and owning hardware that's obsolete in three years. We'd rather lease, or fund a version built to our specification.
