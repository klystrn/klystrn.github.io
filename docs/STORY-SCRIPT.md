# REGINALD TAN — STORY SCRIPT

> **The single editable source for Story mode.** Format: `docs/story/SCHEMA.md`.
> Build/validate: `python3 scripts/story/build.py` · Gaps to fill: `python3 scripts/story/build.py --todo`
> What to edit first: `docs/story/EDIT-LIST.md`.
>
> **Version 0.4 · 2026-11-11.** Converted from the `storyline.md` v0.3 review manuscript, with your
> 2026-11-11 answers applied (`docs/story/DECISIONS.md`) and the main path merged from 54 to 37
> panels. Every line is `{draft}` until you mark it `{approved}`. Dialogue is dramatised for the
> story, not a transcript. Delete anything you want redacted.
>
> **Voice:** present tense in the main story and arcs · past tense on `PORTAL` labels ·
> conditional in Future Plans. **Copy budget:** ≤ 45 words of NAR/THO/DIA per scene.
> **This repo is public** — keep client names, private documents and raw photos out of this file.

---

# Chapter opening · REGINALD TAN / 陈彦杰
```story
order: 1
title: REGINALD TAN
title_type: TITLE_HERO
years: none
category: none
```

## Story C01A · The first frame

### Scene C01-S01 · Silhouette / identity

#### Panel C01-S01-P01 · Hero nameplate
```story
type: TITLE_HERO
art: hero-silhouette
interaction: pointer-parallax
```
- VISUAL: Black screen; red rim light reveals current-age Reginald, upper body in a collared button-up work shirt, arms folded and head facing fully straight to camera (not tilted), as a crimson silhouette with visible body detail (collar, folded forearms, shirt folds, jaw) rather than one flat shade. A small, soft comic-style nav box sits at the top — CV, Tech, Finance and Life split by diagonal dividers tilted 17° clockwise; a hovered tab fills red and widens slightly. Shortly after scrolling starts it shrinks into a dock on the right side, clear of the figure. Ivory `REGINALD TAN` lands very large; a smaller, widely letter-spaced red `陈彦杰` overlaps the centre of the Latin letters. The figure is tall in frame so the face sits clear above the name, which crosses the chest.
- VISUAL: On scroll the name first travels up with the page like normal content, then fades out; the camera pushes from the upper body into a close-up of the face. Everything keeps strong contrast: a darker crimson figure with bright rim lines, ivory name, and a bright red Chinese name with a dark outline and a pale halo so it stays readable over the silhouette. On phones the name and cue sit higher and more of the upper body shows.
- ALT {draft}: A red silhouette of Reginald Tan on black, under his name in English and Chinese.
- NOTE: No narration, awards or job titles in the hero. The `PORTFOLIO` eyebrow is replaced by the nav bar (review, 11 Nov). Pointer moves a red glint 1–2°; touch gets a static frame. CJK font subset to the three glyphs. One-line name on desktop, two lines on mobile.

#### Panel C01-S01-P02 · Three-way fracture
```story
type: PANEL_TRANSITION
art: hero-fracture
```
- VISUAL: The silhouette fractures along three diagonal panel borders — foreshadowing the three present-day lives. Top nav compacts into the right-side mode dock as this panel exits.
- NAR {edit}: If you ask what I'm doing, the answer changes with the hour.
- NOTE: Alternative line — "I don't have a neat one-line answer. I have a few open tabs." Keep one, or delete both for a silent opening.

---

# Chapter present · WHAT I'M DOING NOW
```story
order: 2
title: WHAT I'M DOING NOW
title_type: TITLE_CHAPTER
years: none
category: none
```

## Story C02A · Three directions at once

### Scene C02-S01 · A life in three panels
```story
storyboard: approved
```

#### Panel C02-S01-P01 · Present selector
```story
type: PANEL_SELECTION
layout: {desktop: 3, mobile: stack}
interaction: staggered-slide-in, hover-expand, tap-expand
```
- NOTE: Three cards slide in one after another within ~1 viewport of scroll, settle, then release scroll. Hover/focus widens a card and reveals the *full* (wider) composition of the same scene; mobile tap expands vertically. Edit titles/subtitles here only — no code change needed.

##### Item present-trading
```story
title: ACTIVE TRADING
art: present-trading
arc: trading-nebius
skills: [Markets research, Risk management]
```
- VISUAL: Current Reginald at his home trading setup — several monitors with charts and a trade-log screen (synthetic data); one red decision line; no balances or order IDs.
- SUB {draft}: Trading since 2024 — now a disciplined process for volatile, AI-linked equities: research, risk decisions and review.
- NAR {draft}: At the market, I have to decide what the evidence is actually telling me.
- PORTAL {draft}: Developed a high-volatility trading strategy

##### Item present-registudio
```story
title: RUNNING REGISTUDIO
art: present-registudio
arc: registudio-business
skills: [Client discovery, Pricing strategy]
```
- VISUAL: Desk with a to-do list for the business (leads, proposals, invoices, site builds), proposal drafts and sketches; clients anonymous.
- SUB {draft}: Building a web-services business — finding the right clients, defining an offer, learning to price and deliver.
- NAR {draft}: When it's my own business, a finished site is only part of the work.
- PORTAL {draft}: Built a web-services business from the ground up

##### Item present-ns
```story
title: SERVING NS
art: present-ns
arc: guards-media
skills: [Team management, Visual storytelling]
```
- VISUAL: Current Reginald with his Sony A7S in a media-planning setting at Guards HQ.
- SUB {draft}: Team Manager, Media & Design at Guards HQ — leading a team of 9, and on the AI Task Force.
- NAR {draft}: And there's a part of my day that doesn't run on my own schedule.
- PORTAL {draft}: Led a media team of 9 at Guards HQ

#### Panel C02-S01-P04 · Into the past
```story
type: PANEL_TRANSITION
art: present-merge
```
- VISUAL: The three cards slide together into one notebook/code window; red drains to monochrome as a younger Reginald appears.
- NAR {draft}: None of this begins here. To explain how I got here, I have to go back.

---

# Chapter sst · SCHOOL OF SCIENCE & TECHNOLOGY
```story
order: 3
title: SCHOOL OF SCIENCE & TECHNOLOGY
title_type: TITLE_CHAPTER
years: 2018–2021
category: education
data_ref: education:sst
```

## Story C03A · Learning to code together

### Scene C03-S01 · The classroom

#### Panel C03-S01-P01 · Python classroom
```story
type: PANEL_SPLASH
art: sst-python-classroom
```
- VISUAL: SST computing classroom, mostly black and white. A teacher at the front explains pandas on the board; teenage Reginald sits at his desk staring at his laptop, trying the practical. One highlighted line of code glows red.
- NAR {draft}: The first systems I learn aren't markets. They're small programs I can change.
- THO {draft}: Okay. Why did *that* work?
- SKL {draft}: Python, Pandas
- PORTAL[testimonial-jovita] {draft}: Read Jovita Tang's testimonial

#### Panel C03-S01-P02 · Building locationX with friends
```story
type: PANEL_STANDARD
art: sst-friends-building
data_ref: projects:locx
interaction: hover-reveal
```
- VISUAL: Reginald and friends at a whiteboard and laptop, building locationX — clearly labelled as a planner for the National School Games (venues, schools, time slots on the board).
- NAR {draft}: With friends, we solve problems we can see around us.
- FAC {draft}: locationX — a planner for the National School Games, built with friends (2021)
- DIA[Friend] {draft}: Wait — what if the teachers just enter the venues first?
- SKL {draft}: Python, Algorithms
- NOTE: Hover the red-marked algorithm for a one-line explanation.

### Scene C03-S05 · The NRIC validator

#### Panel C03-S05-P01 · It actually works
```story
type: PANEL_STANDARD
art: sst-nric-validator
```
- VISUAL: Reginald at a desk with his laptop; friends sitting and standing around him, shocked that the algorithm can tell a valid NRIC number from a fake one. Dummy numbers only on screen.
- NAR {draft}: Then I build one on my own, and show them.
- DIA[Friend] {draft}: Hold on. It knows that one's fake?
- FAC {draft}: NRIC validator — solo build
- SKL {draft}: Python, Algorithms
- NOTE: [EDIT: year of the NRIC validator, and one sentence on what it checked]

## Story C03B · Being responsible for others

### Scene C03-S02 · ACE: Singapore Cancer Society and recruitment

#### Panel C03-S02-P01 · SCS and the recruitment drive
```story
type: PANEL_STANDARD
art: sst-ace-drive
```
- VISUAL: Two beats. First: working with the Singapore Cancer Society — Reginald and the SCS@ACE team signing up volunteers for Relay For Life 2020. Second: the ACE Recruitment Drive — Reginald on stage giving an assembly talk, recruiting students to become ACE leaders. Students anonymous.
- NAR {draft}: As an ACE leader, an idea only matters if I can get people to act on it.
- THO {draft}: The code can be right. The plan still has to work with people.
- FAC {draft}: Overall-in-charge, SCS@ACE (2020) — 129 volunteers for Relay For Life 2020, nearly 25% of Singapore Cancer Society's national target
- FAC {draft}: Overall-in-charge, ACE Recruitment Drive — recruiting and interviewing new student leaders
- SKL {draft}: Leadership, Recruitment
- PORTAL[testimonial-keith] {draft}: Read Keith Wee's testimonial

## Story C03C · A quieter test

### Scene C03-S03 · DrCT

#### Panel C03-S03-P01 · Exam, problem, bronze
```story
type: PANEL_EVIDENCE
art: sst-drct
data_ref: awards:DrCT International, Bronze
```
- VISUAL: Three beats. A classroom of students sitting the DrCT exam. Then Reginald's own view of the exam screen as he works a computing problem. Last: Reginald happily receiving his Bronze certificate — no podium, just the certificate. Exit: a whiteboard line extends into the NP chapter.
- NAR {draft}: Some challenges are quieter. A screen, a clock, and a question I don't know yet.
- SFX {draft}: TICK
- THO {draft}: Brute force is too slow. What repeats? Break it into smaller steps.
- THO {draft}: Bronze. I'll take it.
- SKL {draft}: Algorithms
- PORTAL[taekwondo] {draft}: Trained in Taekwondo to a 3rd Dan black belt
- FAC {draft}: DrCT International (Design Thinking with Robotics and Computational Thinking) — Bronze (2021)
- NOTE: Use a scan of the real certificate, not generated award text.

---

# Chapter np · NGEE ANN POLYTECHNIC
```story
order: 4
title: NGEE ANN POLYTECHNIC
title_type: TITLE_CHAPTER
years: 2022–2025
category: education
data_ref: education:np
```

## Story C04A · A bigger workshop

### Scene C04-S01 · First weeks and personal builds

#### Panel C04-S01-P01 · Walking in
```story
type: PANEL_SPLASH
art: np-workshop-open
```
- VISUAL: Two beats that set the chapter. First: Reginald walking into Ngee Ann Polytechnic. Second: a full lecture theatre — rows of students, like a real lecture — for the module Computing Mathematics.
- NAR {draft}: At Ngee Ann, I start putting the pieces together: code, design, users and deadlines.

#### Panel C04-S01-P02 · Tea Shop to FRATS
```story
type: PANEL_STANDARD
art: np-tea-shop-frats
data_ref: projects:frts
```
- VISUAL: Two beats. First: Reginald at work putting the pieces together — one of them his mock website, TheTeaShop, on screen. Second: Reginald presenting FRATS (capture → recognise → attendance) in a hackathon-style setting, slide behind him, judges in front.
- NAR {draft}: One project teaches me how to make something. Another teaches me how much has to happen before it actually works.
- SKL {draft}: Web Development, Computer Vision
- PORTAL[frats] {draft}: Built a facial-recognition attendance system with AIDC

## Story C04B · Passing skills forward

### Scene C04-S02 · Overflow

#### Panel C04-S02-P01 · Teaching the workshop
```story
type: PANEL_STANDARD
art: np-overflow-workshop
data_ref: projects:pnlp
```
- VISUAL: Reginald teaching an Overflow workshop on Data Structures & Algorithms — hash maps on the slide behind him, students following on laptops.
- NAR {draft}: Explaining something forces me to learn it twice: once for myself, once for everyone else.
- FAC {draft}: Head Secretary, Overflow · 16 workshops taught
- SKL {draft}: Teaching, Algorithms
- PORTAL[overflow] {draft}: Led workshops and helped build Panel Party

### Scene C04-S03 · Touch Young Arrows
```story
storyboard: approved
```

#### Panel C04-S03-P01 · Tutoring
```story
type: PANEL_STANDARD
art: np-tya-tutoring
```
- VISUAL: Respectful tutoring setting, framed from behind; the child is never identifiable.
- NAR {draft}: Some lessons aren't about technology at all. They're about being patient enough to make something understandable.
- SKL {draft}: Mentoring
- PORTAL[tya] {draft}: Tutored and mentored children at Touch Young Arrows

## Story C04C · A call at my desk

### Scene C04-S05 · The internship offer
```story
storyboard: approved
```

#### Panel C04-S05-P01 · The phone rings
```story
type: PANEL_STANDARD
art: np-jpm-call
```
- VISUAL: Reginald at his home computer desk. The room drains to grey; only the notification on his phone (a Google Pixel 8) is red.
- SFX {draft}: RING
- THO {draft}: Wait. Is this the call I think it is?
- DIA[Caller] {edit}: Hi Reginald — I'm calling from J.P. Morgan about your internship application.
- NOTE: Dramatised. [EDIT: rough month/year of the call, and how you actually reacted]

#### Panel C04-S05-P02 · The offer
```story
type: PANEL_SPLASH
art: np-jpm-offer
```
- VISUAL: Reaction stays on Reginald. The red edge of the phone becomes a door/window line — match-cut to CapitaSpring after the chapter separator.
- DIA[Caller] {draft}: We'd like to offer you the internship.
- NAR {draft}: Then one call changes what the next year looks like.

---

# Chapter jpmorgan · JPMorganChase
```story
order: 5
title: JPMorganChase
title_type: TITLE_CHAPTER
years: 2024–2025
category: career
data_ref: experience:jpmc
```

## Story C05A · The first day

### Scene C05-S01 · CapitaSpring arrival
```story
storyboard: approved
```

#### Panel C05-S01-P01 · Walking in
```story
type: PANEL_SPLASH
art: jpm-capitaspring-arrival
```
- VISUAL: One oversized panel: Reginald walking toward CapitaSpring, Singapore. Painterly recreation from a public exterior reference.
- NAR {draft}: On my first day, the building feels a lot bigger than anything I've worked on before.

### Scene C05-S02 · Meeting the people

#### Panel C05-S02-P01 · Networking session
```story
type: PANEL_STANDARD
art: jpm-conference-room
```
- VISUAL: A networking session. Rahul and Reginald stand face to face, each holding a coffee as they talk; other interns mingle behind them.
- NAR {draft}: At a networking session, coffee in hand, I meet the people I'll be learning from.
- DIA[Rahul] {draft}: So, tell me about yourself.
- DIA[Reginald] {draft}: I work hard, and I keep people in the loop. You'll always know where things stand.
- SKL {draft}: Communication

### Scene C05-S03 · At the desk with the team

#### Panel C05-S03-P01 · The migration brief
```story
type: PANEL_EVIDENCE
art: jpm-migration-brief
data_ref: projects:athn
```
- VISUAL: Rahul brings Reginald to a desk beside Farhan, a fellow intern. Overlay: an abstract red route from on-premise boxes to cloud shapes — never a real architecture diagram.
- DIA[Rahul] {draft}: Our project is to move these FX Cash and FX Options workloads from our own servers to AWS.
- NAR {draft}: The problem isn't just moving work. It's knowing what to move, why, and what the data says.
- FAC {draft}: Currencies & Emerging Markets · Athena · Corporate & Investment Bank
- SKL {draft}: AWS, Data Analytics

## Story C05B · The hard stretch

### Scene C05-S04 · Time and uncertainty

#### Panel C05-S04-P01 · Day into night
```story
type: PANEL_STANDARD
art: jpm-long-workday
interaction: timeline-scrub
```
- VISUAL: Day-to-night match-cut at the same desk; simple clock marks. Static fallback for the scrubber.
- NAR {draft}: The work takes longer than I expect. Some nights I keep looking at the same problem from a different angle.
- NOTE: Your account: ~9am–8pm in office, ~10pm–1/2am at home, some weekends, for weeks. Shown as my choice, not an employer requirement.

#### Panel C05-S04-P02 · Lock in
```story
type: PANEL_STANDARD
art: jpm-fatigue-choice
```
- VISUAL: Three beats in the same scene. Wide: Reginald at his desk, head in his hands. Close-up: the same pose, hands over his face. Then: he looks up, focused.
- THO {draft}: Fourth sixty-hour week in a row. No rest.
- DIA[Reginald] {draft}: Lock in. I can do this.
- SKL {draft}: Problem decomposition, Persistence

## Story C05C · From learning to explaining

### Scene C05-S05 · The go-to data person

#### Panel C05-S05-P01 · Grafana and the update
```story
type: PANEL_EVIDENCE
art: jpm-grafana-update
```
- VISUAL: Left: a Grafana dashboard on a big wall screen — a line chart, a bar graph, a treemap and a pie chart, painted into the art with synthetic values — as a coworker asks Reginald how he syncs the database with all the widgets. Right: Reginald presenting migration progress on a high-level stage board.
- DIA[Coworker] {draft}: How are you syncing the database with all these widgets?
- NAR {draft}: Eventually I stop only asking questions. People start asking me how to see the data — and the next challenge is explaining it so they can decide.
- SKL {draft}: Data Visualisation, SQL, InfluxDB
- NOTE: The dashboard widgets are generated as part of the image (your request), so changing them means regenerating this plate.

## Story C05D · Report day

### Scene C05-S06 · End-of-internship presentation

#### Panel C05-S06-P01 · Standing behind it
```story
type: PANEL_SPLASH
art: jpm-final-presentation
```
- VISUAL: Reginald presenting what he learnt to a panel; the screen behind him shows the project update — 83% of the CEM workload migrated.
- NAR {draft}: A year of questions becomes a report I have to stand behind.
- DIA[Reginald] {draft}: I learnt to break a big problem into steps, and to make data clear enough for people to decide.
- FAC {draft}: 83% of the CEM workload migrated during my internship
- SKL {draft}: Jira, Stakeholder reporting

### Scene C05-S07 · Achievements & Milestones

#### Panel C05-S07-P01 · Milestone grid
```story
type: PANEL_SELECTION
layout: {desktop: 2x2, mobile: stack}
```
- NAR {draft}: These are the outcomes. The interesting part is what it takes to get there.
- PORTAL[testimonial-rahul] {draft}: Read Rahul Varma's testimonial
- NOTE: Card frames, titles and text are code overlays; the image inside each card is generated.

##### Item ms-retrieval
```story
title: OPTIMISED DATA RETRIEVAL
art: jpm-card-retrieval
arc: jpm-data-retrieval
skills: [Python, Parallel Computing]
```
- VISUAL: A database on a computer screen; Reginald reading through the data.
- SUB {draft}: Cut a data-retrieval process from about 4 hours to 30 seconds.
- PORTAL {draft}: Optimised data retrieval from 4 hours to 30 seconds

##### Item ms-visualisation
```story
title: VISUALISED WORKLOADS
art: jpm-card-visualisation
arc: jpm-visualisation
skills: [Data Visualisation, Influx DB]
```
- VISUAL: Reginald presenting a widget-based dashboard during an online meeting.
- SUB {draft}: Built a workload monitoring and visualisation tool to inform migration planning.
- PORTAL {draft}: Built workload visualisations for migration decisions

##### Item ms-migration
```story
title: MIGRATED WORKLOADS
art: jpm-card-migration
arc: jpm-migration
skills: [AWS, Data analytics]
```
- VISUAL: Reginald running code in the office, with Farhan beside him.
- SUB {draft}: Helped migrate trader reports and server workloads from legacy systems to AWS.
- PORTAL {draft}: Migrated trading workloads to the cloud

##### Item ms-multilob
```story
title: CROSS-TEAM DELIVERY
art: jpm-card-multilob
arc: jpm-multilob
skills: [Technical communication, Stakeholder reporting]
```
- VISUAL: Reginald talking a coworker from another team through his tool.
- SUB {draft}: My tool was adopted across multiple lines of business; I supported and coordinated its rollout.
- PORTAL {draft}: Supported a multi-line-of-business rollout

## Story C05E · Graduation

### Scene C05-S09 · Graduation

#### Panel C05-S09-P01 · The diploma
```story
type: PANEL_SPLASH
art: np-graduation
data_ref: education:np
```
- VISUAL: Ngee Ann Polytechnic graduation ceremony, May 2025. Reginald in a graduation gown, on stage, receiving his certificate. An awards button opens a pop-up list.
- NAR {draft}: A few weeks after the internship ends, I'm back at Ngee Ann for one last walk across a stage.
- FAC {draft}: Diploma in Information Technology · Ngee Ann Polytechnic · May 2025
- MODAL[Awards I received] {draft}: Ngee Ann Scholarship (2022–2024) · Director's List (2022, 2023) · 2nd Most Outstanding Performance (2022) · Module Prize: Computing Mathematics (2022) · Module Prize: Design Principles (2022) · Edusave Certificate of Academic Achievement (2023, 2025)
- PORTAL[testimonial-dimuthu] {draft}: Read Dimuthu Makawita's testimonial
- PORTAL[testimonial-victor] {draft}: Read Victor Lum's testimonial
- NOTE: Placed here because graduation (May 2025) comes after the internship (Apr 2024 – Mar 2025), and it keeps the approved offer-call → CapitaSpring cut intact. Move the whole scene block if you'd rather it close the NP chapter.

---

# Chapter guards · GUARDS FORMATION
```story
order: 6
title: GUARDS FORMATION
title_type: TITLE_CHAPTER
years: 2025–2027
category: national service
data_ref: experience:saf
```

## Story C06A · A detour

### Scene C06-S01 · BMT to a new posting

#### Panel C06-S01-P01 · Training
```story
type: PANEL_STANDARD
art: guards-bmt
```
- VISUAL: A page of six equal panels. (1) Context: a mono-Guards enlistment — heli-rappelling silhouette. (2) Running with his section in long-4 uniform, helmets and field packs, carrying SAR-21 rifles. (3) Push-ups on the parade square under a hot sun. (4) In the jungle on an outfield, aiming a SAR-21. (5) Fatigue setting in. (6) Coughing.
- NAR {draft}: I enlist into a mono-Guards intake: an elite infantry unit trained in heli-rappelling and amphibious operations.
- DIA[Sergeant] {draft}: Keep it tight! Nobody drops out!
- THO {draft}: The parade square is hotter than the sun.
- THO {draft}: Breathe. Front sight. Squeeze.
- THO {draft}: Why am I this tired?
- SFX {draft}: KOFF
- NAR {draft}: I think I know the shape of the next chapter. Then my health changes the plan.
- SKL {draft}: Resilience

#### Panel C06-S01-P02 · Pneumonia, then a different route
```story
type: PANEL_STANDARD
art: guards-pneumonia-transition
```
- VISUAL: Two beats. First: a medical centre — Reginald with his head in his hands as the doctor tells him he has pneumonia. Second: posted out to HQ Guards — a corridor, one door lit red.
- DIA[Doctor] {draft}: It's pneumonia. You're out of training.
- NAR {draft}: Pneumonia takes me off the path I expected. I have to figure out what I can make of the new one.
- FAC {draft}: Posted to HQ Guards

## Story C06B · A new lens

### Scene C06-S02 · Picking up the camera

#### Panel C06-S02-P01 · First frame
```story
type: PANEL_STANDARD
art: guards-first-camera
```
- VISUAL: Two beats. First: an army office — Reginald is told he's going to be a photographer. Second: he picks up a Sony A7S and falls in love with it; through the viewfinder a monochrome scene snaps into a deliberate composition with a narrow red focus guide.
- DIA[Officer] {draft}: You're going to be our photographer.
- THO {draft}: A photographer? Me?
- NAR {draft}: A camera changes what I pay attention to. Suddenly the story is in the framing.
- SKL {draft}: Photography, Lightroom, Photoshop
- PORTAL[army-photography] {draft}: See my favourite photos from behind the camera
- NOTE: Easter egg — the portal sits on the viewfinder.

### Scene C06-S03 · Media team and AI
```story
storyboard: approved
```

#### Panel C06-S03-P01 · Leading the team
```story
type: PANEL_STANDARD
art: guards-media-team
portal: [testimonial-yap]   # pending letter: the arc stays hidden until it arrives
```
- VISUAL: Wide split scene: a planning meeting with Yap Shi Hao (Head of Manpower, Guards Formation), then Reginald directing his media team's coverage of a parade.
- DIA[Yap Shi Hao] {draft}: What do we need from the team for the parade?
- NAR {draft}: The role grows from taking pictures to helping a team of nine deliver them.
- FAC {draft}: Team Manager, Media & Design · team of 9 · Guards HQ social accounts · Recruitment Board
- SKL {draft}: Team management, Project Management
- PORTAL[guards-media] {draft}: Led media coverage for Guards HQ

#### Panel C06-S03-P02 · AI Task Force
```story
type: PANEL_EVIDENCE
art: guards-ai-process
data_ref: projects:grds
```
- VISUAL: Illustrative diagram — caption drafting, event admin and daily-task automation, AI workshops, and a chatbot for Guards combatants. Labelled "illustrative workflow".
- NAR {draft}: I also start looking for repetitive work we can make less repetitive.
- FAC {draft}: Guards AI Task Force · chatbot for combatants (in progress)
- SKL {draft}: Claude, Gemini
- PORTAL[guards-ai] {draft}: Built AI workflows for the Guards AI Task Force

## Story C06C · The rhythm outside work

### Scene C06-S04 · Daily life

#### Panel C06-S04-P01 · Daily-life board
```story
type: PANEL_SELECTION
layout: {desktop: 2+3, mobile: stack}
interaction: staggered-slide-in, hover-expand, tap-expand
```
- VISUAL: Five cards. Row one is army life (managing the media team, AI task force); row two is his own time (equity trading, building tools, diving into hobbies).
- NAR {draft}: The schedule changes. What I do with the hours around it changes too.
- PORTAL[market-city] {draft}: Started Market City, a spatial way to visualise markets

##### Item guards-life-media
```story
title: MANAGING THE MEDIA TEAM
art: guards-card-media
arc: guards-media
skills: [Team management, Photoshop]
```
- VISUAL: Reginald directing his media team on a shoot.
- SUB {draft}: Leading a team of nine across shoots, edits and Guards HQ's social accounts.
- PORTAL {draft}: Led media coverage for Guards HQ

##### Item guards-life-ai
```story
title: AI TASK FORCE
art: guards-card-ai
arc: guards-ai
skills: [Claude, Prompt Engineering]
```
- VISUAL: Reginald working with a teammate, the two of them talking to an LLM chatbot on screen.
- SUB {draft}: Building a chatbot for Guards combatants, one prompt and one test at a time.
- PORTAL {draft}: Built AI workflows for the Guards AI Task Force

##### Item guards-life-trading
```story
title: EQUITY TRADING
art: guards-card-trading
arc: trading-nebius
skills: [Technical Analysis, Fundamental Analysis]
```
- VISUAL: Reginald on his phone (a Google Pixel 10 Pro), analysing a stock.
- SUB {draft}: I've traded since 2024. In NS I go deeper — documenting what I think will happen, and what actually does.
- PORTAL {draft}: Developed a high-volatility strategy around Nebius

##### Item guards-life-building
```story
title: BUILDING TOOLS
art: guards-card-building
arc: imperium
skills: [Python, MCPs, Trade Automation]
```
- VISUAL: Reginald at his desktop at night, working on his tools.
- SUB {draft}: I build an automated trading workflow — and start on Imperium and Market City, both still in progress.
- PORTAL {draft}: Built an automated trading workflow

##### Item guards-life-discipline
```story
title: DIVING INTO HOBBIES
art: guards-card-discipline
arc: guards-life
```
- VISUAL: Cover: a close-up of a card spring — cards arcing between two hands.
- SUB {draft}: Back to cardistry after a five-year break — and 60 kg to 75 kg at the gym in 12 months.
- PORTAL {draft}: Picked my hobbies back up

---

# Chapter registudio · REGISTUDIO
```story
order: 7
title: REGISTUDIO
title_type: TITLE_CHAPTER
years: 2026–present
category: running a business
```

## Story C07A · An opportunity arrives

### Scene C07-S01 · A call in the city

#### Panel C07-S01-P01 · Meanwhile
```story
type: PANEL_STANDARD
art: registudio-friend-call
```
- VISUAL: Reginald walking through Singapore city streets; his phone (a Google Pixel 10 Pro) lights up with a red line.
- NAR {draft}: Meanwhile, still in NS, I start trying to turn building into a real service.
- SFX {draft}: RING
- DIA[Friend] {draft}: I know someone who needs a website. You keen?
- NOTE: [EDIT: month/year of this call]

### Scene C07-S02 · First pitch

#### Panel C07-S02-P01 · The video call
```story
type: PANEL_STANDARD
art: registudio-first-call
```
- VISUAL: Generic video-call UI; Reginald listening more than talking. Client anonymous.
- NAR {draft}: It isn't the code that gets me the first chance. I have to make somebody confident I understand their problem.
- FAC {edit}: First client secured — [EDIT: month/year]
- SKL {draft}: Client discovery, Pitching

## Story C07B · A pricing lesson

### Scene C07-S03 · A prospect says no

#### Panel C07-S03-P01 · Priced out, then repriced
```story
type: PANEL_STANDARD
art: registudio-pricing
```
- VISUAL: A proposal built on online agency pricing meets a budget mismatch; the lost lead fades. Next beat: Reginald rewriting an anonymised pricing/positioning board with segments and scope made explicit.
- THO {draft}: Great. I may have priced myself out of my own pitch.
- NAR {draft}: I priced for the market I saw online, not the client in front of me. So I learn to price around value, scope and the people I actually serve.
- SKL {draft}: Pricing strategy, Market segmentation
- NOTE: Merged from the old C07-S03 + C07-S04. Prospect stays unnamed and is never portrayed as unreasonable.

## Story C07C · Creating a system

### Scene C07-S05 · Pipeline and differentiation

#### Panel C07-S05-P01 · Lead pipeline
```story
type: PANEL_STANDARD
art: registudio-pipeline
```
- VISUAL: Leads from freelance platforms, outreach and conversations flowing into an anonymised lead → meeting → proposal → client funnel. No phone numbers or names.
- NAR {draft}: A business needs a repeatable way to find the right conversation, not just the occasional lucky introduction.
- SKL {draft}: Sales pipeline, Process design
- PORTAL[registudio-business] {draft}: Built a lead-to-client process for RegiStudio

#### Panel C07-S05-P02 · Design Playground
```story
type: PANEL_EVIDENCE
art: registudio-design-playground
```
- VISUAL: One-off experiments snapping into reusable components; real components from the repo, not mock-ups.
- NAR {draft}: I also need a way to build faster without making everything look the same.
- SKL {draft}: Web Development, UI/UX · Figma, Design systems
- PORTAL[design-playground] {draft}: Built Design Playground to streamline delivery
- NOTE: [EDIT: what Design Playground does today, and any real time saved]

## Story C07D · What building a business teaches

### Scene C07-S07 · Reflection

#### Panel C07-S07-P01 · Closing the notebook
```story
type: PANEL_SPLASH
art: registudio-reflection
```
- VISUAL: Reginald closes a planning notebook; the last page becomes a view of the future (time-lapse into Chapter 8).
- NAR {draft}: I started by offering to build websites. I'm learning that building a business means decisions about people, value and trust.
- NOTE: The Auction House concept (old C07-S06) now lives in the RegiStudio arc.

---

# Chapter future · FUTURE PLANS
```story
order: 8
title: FUTURE PLANS
title_type: TITLE_CHAPTER
years: none
category: none
```

## Story C08A · One possible future

### Scene C08-S01 · Near the Botanic Gardens

#### Panel C08-S01-P01 · The bench
```story
type: PANEL_SPLASH
art: future-bench
```
- VISUAL: A much older, imagined Reginald alone on a bench near the Singapore Botanic Gardens amphitheatre at sunset; softened red accents.
- FAC {approved}: AN IMAGINED FUTURE
- NAR {draft}: Sometimes I imagine myself years from now, sitting somewhere quiet, looking back.
- THO {draft}: Did I make the most of the chances I had?

### Scene C08-S02 · Possible lives

#### Panel C08-S02-P01 · Glimpses
```story
type: PANEL_STANDARD
art: future-glimpses
```
- VISUAL: Four imagined glimpses. (1) Walking through Hyde Park, London — living there. (2) A large hall: Reginald in graduation attire receiving a degree as people clap, seen from an audience member's seat, his name on the screen; no school name anywhere. (3) As a managing director at the head of a table, presenting to a meeting, seen from the far end. (4) Under aurora skies in Finland, glass igloos glowing behind him.
- NAR {draft}: From a classroom in Clementi to a trading desk at CapitaSpring, every chapter so far has been practice for the next one.
- NAR {draft}: I imagine mornings in London, crossing Hyde Park on the way to class.
- NAR {draft}: I imagine my name on the screen of a great hall, and the applause after the years of work.
- NAR {draft}: I imagine leading the room as a managing director — answering the kind of questions I used to ask.
- NAR {draft}: And I imagine standing under the aurora in Finland, counting the places the work has taken me.
- THO {draft}: From Singapore to the Arctic Circle. Not bad.
- FAC {approved}: A future I'm working toward — not a record of what's happened.

### Scene C08-S03 · The fade

#### Panel C08-S03-P01 · Thank you for reading
```story
type: PANEL_SPLASH
art: future-fade
interaction: cta-links
```
- VISUAL: Old Reginald lets out a satisfied breath; camera pulls back; colour fades to black.
- NAR {draft}: For now, the next page is still being written.
- FAC {approved}: THANK YOU FOR READING.
- NOTE: Footer (code, from src/data/identity.json): email address with a copy button · LinkedIn · GitHub · CV (opens the PDF) · a prompt to try the Tech and Life modes too.

---
---

# Arc frats · FRATS — facial-recognition attendance
```story
kind: project
parent: C04-S01-P02
title: FRATS
portal: Built a facial-recognition attendance system with AIDC
data_ref: projects:frts
```

## Story A-FR · The capstone

### Scene A-FR-S01 · The brief

#### Panel A-FR-S01-P01 · AIDC's problem
```story
type: PANEL_STANDARD
art: arc-frats-brief
```
- VISUAL: AIDC's attendance problem as a conventional-workflow diagram, with requirements pinned around it.
- NAR {draft}: We need more than a model that recognises a face. We need a workflow people can actually use.

### Scene A-FR-S02 · Building it

#### Panel A-FR-S02-P01 · The pipeline
```story
type: PANEL_STANDARD
art: arc-frats-build
```
- VISUAL: Team sketching capture → recognition → attendance; a red mark on the data-flow decision.
- NAR {edit}: [EDIT: the modules you personally built]

#### Panel A-FR-S02-P02 · What broke
```story
type: PANEL_STANDARD
art: arc-frats-failure
```
- NAR {edit}: [EDIT: one real technical problem — lighting, accuracy, data, performance or privacy — and how you handled it]

### Scene A-FR-S03 · Demo and outcome

#### Panel A-FR-S03-P01 · Demo
```story
type: PANEL_EVIDENCE
art: arc-frats-demo
interaction: pipeline-inspector
```
- VISUAL: Real demo screens with synthetic faces only; interactive pipeline inspection.
- FAC {draft}: Delivered to AIDC, a biometrics security company in Indonesia (2024), mentored by an AIDC technical manager.
- NAR {edit}: [EDIT: result and what you learnt]
- SKL {draft}: Computer vision, Python

---

# Arc overflow · Overflow and Panel Party
```story
kind: project
parent: C04-S02-P01
title: OVERFLOW
portal: Led workshops and helped build Panel Party
data_ref: projects:pnlp
```

## Story A-OV · Teaching and building

### Scene A-OV-S01 · Planning the workshops

#### Panel A-OV-S01-P01 · Head Secretary
```story
type: PANEL_STANDARD
art: arc-overflow-planning
```
- VISUAL: Lesson plans, attendee lists, a room being set up.
- NAR {draft}: As Head Secretary, half the job happens before anyone walks into the room.
- FAC {draft}: 16 workshops · Vue.js · DSA bootcamp · Portfolio with Figma & Web Dev

### Scene A-OV-S02 · Open House

#### Panel A-OV-S02-P01 · Panel Party
```story
type: PANEL_EVIDENCE
art: arc-overflow-panel-party
interaction: playable-snippet
```
- VISUAL: Panel Party at NP ICT Open House 2023; sprite movement and collision highlighted.
- FAC {draft}: I built sprite movement and collision detection for the team's game.
- NAR {draft}: Technical knowledge gets clearer when I have to teach it.
- SKL {draft}: JavaScript, Collision detection

---

# Arc tya · Touch Young Arrows
```story
kind: daily-life
parent: C04-S03-P01
title: TOUCH YOUNG ARROWS
portal: Tutored and mentored children at Touch Young Arrows
```

## Story A-TY · Mentoring

### Scene A-TY-S01 · Showing up

#### Panel A-TY-S01-P01 · Every week
```story
type: PANEL_STANDARD
art: arc-tya-commitment
```
- VISUAL: Symbolic, non-identifiable tutoring room; English, Maths and Science books.
- NAR {edit}: [EDIT: why you volunteered and how often]

#### Panel A-TY-S01-P02 · One moment
```story
type: PANEL_STANDARD
art: arc-tya-moment
```
- NAR {edit}: [EDIT: one real (anonymised) tutoring moment]
- NAR {draft}: Making a concept accessible turns out to be its own kind of engineering.

---

# Arc trading-nebius · Nebius and a volatility process
```story
kind: project
parent: C06-S04-P01
title: A VOLATILITY PROCESS
portal: Developed a high-volatility strategy around Nebius
```

## Story A-NB · From curiosity to process

### Scene A-NB-S01 · Curiosity

#### Panel A-NB-S01-P01 · Podcasts on the commute
```story
type: PANEL_STANDARD
art: arc-nebius-curiosity
```
- VISUAL: Earbuds, a train window, notes on AI-infrastructure companies.
- NAR {draft}: I've been trading since 2024. Podcasts and research pull me toward a volatile corner of AI infrastructure.

### Scene A-NB-S02 · The thesis

#### Panel A-NB-S02-P01 · Catalyst, entry, invalidation
```story
type: PANEL_STANDARD
art: arc-nebius-thesis
```
- VISUAL: Three small panels: the business catalyst; the entry criteria; the invalidation/risk rules.
- NAR {edit}: [EDIT: your actual entry criteria and risk rules, in 2–3 short lines]

### Scene A-NB-S03 · The trade

#### Panel A-NB-S03-P01 · $90 to $299
```story
type: PANEL_EVIDENCE
art: arc-nebius-price-path
interaction: illustrative-chart
```
- VISUAL: Illustrative price path labelled "illustrative" with two red markers: entry and exit.
- FAC {edit}: Nebius (NBIS) — entered at about $90, exited at about $299 [EDIT: entry and exit month/year; confirm ticker]
- NAR {draft}: Holding through the volatility is the hard part. The plan has to be written down before the price moves.
- NOTE: No investment advice, no portfolio size or P&L.

### Scene A-NB-S04 · Lessons

#### Panel A-NB-S04-P01 · What I'd do again
```story
type: PANEL_STANDARD
art: arc-nebius-lessons
```
- NAR {edit}: [EDIT: one real lesson — a changed thesis or a call you got wrong]

---

# Arc imperium · The Automated Trading Workflow and Imperium
```story
kind: project
parent: C06-S04-P01
title: IMPERIUM
portal: Built an automated trading workflow
data_ref: projects:atw
```

## Story A-IM · Tools for how I think

### Scene A-IM-S01 · The friction

#### Panel A-IM-S01-P01 · Too many tabs
```story
type: PANEL_STANDARD
art: arc-imperium-friction
```
- NAR {edit}: [EDIT: the manual research/checklist problem that made you build it]

### Scene A-IM-S02 · The workflow

#### Panel A-IM-S02-P01 · Before the open
```story
type: PANEL_EVIDENCE
art: arc-imperium-workflow
```
- VISUAL: Real ATW output: scans → structured analysis → trade-ready summary.
- FAC {draft}: A daily workflow on Claude and MCP: scans, structured analysis and trade-ready summaries before the open. In daily use.
- SKL {draft}: Claude & MCP, Prompt engineering

### Scene A-IM-S03 · Imperium (in progress)

#### Panel A-IM-S03-P01 · The next layer
```story
type: PANEL_STANDARD
art: arc-imperium-wip
interaction: dummy-data-demo
```
- VISUAL: Imperium screens with visibly dummy data; clearly stamped WORK IN PROGRESS.
- NAR {edit}: [EDIT: what Imperium adds on top of the workflow]
- FAC {draft}: Status: work in progress

---

# Arc market-city · Market City
```story
kind: project
parent: C06-S04-P01
title: MARKET CITY
portal: Started a spatial way to visualise markets
data_ref: projects:atw
```

## Story A-MC · A city of markets

### Scene A-MC-S01 · Motivation

#### Panel A-MC-S01-P01 · Tables hide relationships
```story
type: PANEL_STANDARD
art: arc-market-city-motivation
```
- NAR {draft}: Tables are good at numbers and bad at relationships. I want to walk through a market instead.

### Scene A-MC-S02 · The build

#### Panel A-MC-S02-P01 · Renders
```story
type: PANEL_EVIDENCE
art: arc-market-city-renders
interaction: pointer-map
```
- VISUAL: Real renders/screenshots; pointer-reactive map with demo data and an accessible list alternative. Stamped WORK IN PROGRESS.
- NAR {edit}: [EDIT: city or constellation layout? and one real build problem]
- FAC {draft}: Status: work in progress

---

# Arc guards-media · Leading the media team
```story
kind: daily-life
parent: C06-S03-P01
title: THE MEDIA TEAM
portal: Led media coverage for Guards HQ
data_ref: experience:saf
```

## Story A-GM · Covering the formation

### Scene A-GM-S01 · Planning to parade

#### Panel A-GM-S01-P01 · Briefing the team
```story
type: PANEL_STANDARD
art: arc-guards-media-brief
```
- NAR {draft}: Nine people, one event, and a shot list that has to survive contact with reality.
- FAC {draft}: Team of 9 · media and design for army exercises and events · Guards HQ Facebook and Instagram

#### Panel A-GM-S01-P02 · Coverage
```story
type: PANEL_EVIDENCE
art: arc-guards-media-coverage
```
- VISUAL: Real published photos from the team (approved selection).
- NAR {edit}: [EDIT: one leadership lesson from running the team]

---

# Arc guards-ai · The AI Task Force
```story
kind: project
parent: C06-S03-P02
title: AI TASK FORCE
portal: Built AI workflows for the Guards AI Task Force
data_ref: projects:grds
```

## Story A-GA · Less repetitive work

### Scene A-GA-S01 · Workflows

#### Panel A-GA-S01-P01 · Captions, admin, workshops
```story
type: PANEL_EVIDENCE
art: arc-guards-ai-workflows
```
- VISUAL: Caption drafting, event admin automation and AI workshops — with a human reviewing every output.
- NAR {edit}: [EDIT: the workflow you're proudest of and what it saved]

#### Panel A-GA-S01-P02 · A chatbot for combatants
```story
type: PANEL_STANDARD
art: arc-guards-ai-chatbot
```
- FAC {draft}: An army chatbot for Guards combatants — in progress.
- NAR {draft}: The goal isn't a clever demo. It's something a soldier actually uses.

---

# Arc guards-life · Gym and cardistry
```story
kind: daily-life
parent: C06-S04-P01
title: DISCIPLINE & CREATIVITY
portal: Rebuilt old habits and new ones
```

## Story A-GL · Practice

### Scene A-GL-S01 · Two kinds of reps

#### Panel A-GL-S01-P01 · The gym
```story
type: PANEL_STANDARD
art: arc-guards-life-gym
```
- FAC {draft}: 60 kg → 75 kg in 12 months
- NAR {draft}: Some things get easier with practice.

#### Panel A-GL-S01-P02 · The deck
```story
type: PANEL_STANDARD
art: arc-guards-life-cards
```
- NAR {draft}: Others are easier to return to than I expect. Five years later, my hands still remember the deck.

---

# Arc registudio-business · RegiStudio, the business
```story
kind: project
parent: C07-S05-P01
title: REGISTUDIO
portal: Built a web-services business from the ground up
```

## Story A-RS · From favour to business

### Scene A-RS-S01 · Why start

#### Panel A-RS-S01-P01 · The first idea
```story
type: PANEL_STANDARD
art: arc-registudio-idea
```
- NAR {edit}: [EDIT: why you started, who you wanted to serve, and your first price formula]

### Scene A-RS-S02 · Delivering

#### Panel A-RS-S02-P01 · The first project
```story
type: PANEL_STANDARD
art: arc-registudio-delivery
```
- NAR {edit}: [EDIT: scope, timeline and one thing that went differently than planned]

### Scene A-RS-S03 · Packaging the offer

#### Panel A-RS-S03-P01 · Segments and packages
```story
type: PANEL_EVIDENCE
art: arc-registudio-packages
```
- VISUAL: Earlier vs current offer — only if you supply real (scrubbed) pricing history.
- NAR {draft}: Lower prices aren't the answer. Clearer offers are.

### Scene A-RS-S04 · Auction House (concept)

#### Panel A-RS-S04-P01 · What makes it worth choosing
```story
type: PANEL_STANDARD
art: arc-registudio-auction-house
```
- VISUAL: Planning board: a watch price-history tracker and an art price-per-inch valuation idea. Stamped CONCEPT.
- NAR {draft}: Now I ask a different question before I build: what makes this useful enough to choose?
- FAC {draft}: Status: concept
- SKL {draft}: Product strategy

---

# Arc design-playground · Design Playground
```story
kind: project
parent: C07-S05-P02
title: DESIGN PLAYGROUND
portal: Built Design Playground to streamline delivery
```

## Story A-DP · Building faster, not samer

### Scene A-DP-S01 · The repetition problem

#### Panel A-DP-S01-P01 · One-off styling
```story
type: PANEL_STANDARD
art: arc-design-playground-problem
```
- NAR {edit}: [EDIT: where one-off styling slowed you down]

### Scene A-DP-S02 · Play with it

#### Panel A-DP-S02-P01 · Tokens demo
```story
type: PANEL_EVIDENCE
art: arc-design-playground-demo
interaction: token-playground
```
- VISUAL: Live demo — change typography, spacing and layout tokens with keyboard/tap support.
- NAR {edit}: [EDIT: real impact on launch time, or say it's a goal]

---

# Arc jpm-data-retrieval · 4 hours to 30 seconds
```story
kind: achievement
parent: C05-S07-P01
title: OPTIMISED DATA RETRIEVAL
portal: Optimised data retrieval from 4 hours to 30 seconds
data_ref: experience:jpmc
```

## Story A-JR · The tasking

### Scene A-JR-S01 · Problem to result

#### Panel A-JR-S01-P01 · Four hours
```story
type: PANEL_STANDARD
art: arc-jpm-retrieval-problem
```
- NAR {edit}: A retrieval process takes about four hours. [EDIT: what was being retrieved, at a non-confidential level]

#### Panel A-JR-S01-P02 · Thirty seconds
```story
type: PANEL_EVIDENCE
art: arc-jpm-retrieval-result
```
- NAR {edit}: [EDIT: the change you made — e.g. parallelising, caching, a better query]
- FAC {draft}: ~4 hours → ~30 seconds
- SKL {draft}: Python, Parallel Computing

---

# Arc jpm-visualisation · Seeing the workloads
```story
kind: achievement
parent: C05-S07-P01
title: VISUALISED WORKLOADS
portal: Built workload visualisations for migration decisions
data_ref: projects:athn
```

## Story A-JV · Making it visible

### Scene A-JV-S01 · The tool

#### Panel A-JV-S01-P01 · What the graphs show
```story
type: PANEL_EVIDENCE
art: arc-jpm-visualisation-tool
```
- VISUAL: Safe mock of the dashboard layout — no real data.
- FAC {draft}: A workload monitoring and visualisation tool, now used globally across lines of business to spot optimisation opportunities.
- NAR {edit}: [EDIT: which decision the tool made easier]

---

# Arc jpm-migration · Moving to the cloud
```story
kind: achievement
parent: C05-S07-P01
title: MIGRATED WORKLOADS
portal: Migrated trading workloads to the cloud
data_ref: projects:athn
```

## Story A-JM · Legacy to AWS

### Scene A-JM-S01 · The migration

#### Panel A-JM-S01-P01 · My part
```story
type: PANEL_STANDARD
art: arc-jpm-migration
```
- FAC {draft}: Extracted, optimised and migrated trader reports and server workloads from legacy systems to AWS.
- NAR {edit}: [EDIT: which tasks were yours vs the team's]

---

# Arc jpm-multilob · Across lines of business
```story
kind: achievement
parent: C05-S07-P01
title: CROSS-TEAM DELIVERY
portal: Supported a multi-line-of-business rollout
data_ref: projects:athn
```

## Story A-JL · Beyond one team

### Scene A-JL-S01 · Adoption

#### Panel A-JL-S01-P01 · Other teams pick it up
```story
type: PANEL_STANDARD
art: arc-jpm-multilob
```
- FAC {draft}: Adopted across lines of business such as commodities and rates; I supported and coordinated the rollout as subject-matter expert.
- NAR {draft}: The tool stops being mine the moment other teams rely on it.

---

# Arc taekwondo · Taekwondo
```story
kind: achievement
parent: C03-S03-P01
title: TAEKWONDO
portal: Trained in Taekwondo to a 3rd Dan black belt
```

## Story A-TKD · From podiums to 3rd Dan

### Scene A-TKD-S01 · First podiums

#### Panel A-TKD-S01-P01 · On the mat
```story
type: PANEL_STANDARD
art: arc-taekwondo-mat
```
- VISUAL: A competition mat under hall lights; teenage Reginald in his dobok mid-kick, a referee's arm raised.
- NAR {draft}: Before I write my first line of Python, I learn what it takes to keep getting up.
- FAC {draft}: First Place, Singapore National Games (2018) · Second Place, Singapore Youth Olympic Festival (2018)
- SKL {draft}: Discipline

### Scene A-TKD-S02 · Colours

#### Panel A-TKD-S02-P01 · A second podium, and colours
```story
type: PANEL_STANDARD
art: arc-taekwondo-colours
```
- VISUAL: Two beats: a second-place podium, medal in hand; then the Colours Award certificate.
- FAC {draft}: Second Place, Singapore National Taekwondo Championships and NSG Championships (2019) · Colours Award, Singapore School Sports Council (2019)
- NAR {draft}: Second place twice in a year teaches me more than winning would have.

### Scene A-TKD-S03 · Third Dan

#### Panel A-TKD-S03-P01 · The black belt
```story
type: PANEL_SPLASH
art: arc-taekwondo-third-dan
```
- VISUAL: Reginald tying a black belt embroidered with three bars; a grading hall behind him.
- FAC {edit}: 3rd Dan black belt — [EDIT: year and grading body]
- NAR {edit}: [EDIT: what reaching 3rd Dan meant to you]

---

# Arc army-photography · Through my viewfinder
```story
kind: gallery
parent: C06-S02-P01
title: THROUGH MY VIEWFINDER
portal: See my favourite photos from behind the camera
```

## Story A-AP · Favourite frames

### Scene A-AP-S01 · The gallery

#### Panel A-AP-S01-P01 · Favourite frames
```story
type: PANEL_GALLERY
art: arc-army-photography-gallery
gallery: army
```
- NAR {draft}: Some of my favourite frames since I picked up the camera. Unedited, straight off the card.
- NOTE: Photos and captions are added in the Storyboard Room (Army photos page) and stored in the repo at full quality. They are shown as-is, not converted to comic style.

---

# Arc testimonial-jovita · Jovita Tang
```story
kind: testimonial
parent: C03-S01-P01
title: A LETTER FROM JOVITA TANG
portal: Read Jovita Tang's testimonial
data_ref: testimonials:jovita-tang
letter: jovita-tang
```

## Story A-TJ · Testimonial

### Scene A-TJ-S01 · Introduction

#### Panel A-TJ-S01-P01 · The classroom
```story
type: PANEL_STANDARD
art: arc-testimonial-jovita-classroom
```
- VISUAL: SST computing classroom after lessons; teenage Reginald and his teacher.
- NAR {draft}: Some teachers make you take a subject seriously. She makes me take myself seriously.

### Scene A-TJ-S02 · The letter

#### Panel A-TJ-S02-P01 · Over the shoulder
```story
type: PANEL_TESTIMONIAL
art: arc-testimonial-jovita-handover
```
- VISUAL: Stylised handover; camera pivots over Reginald's shoulder to the paper reader.

---

# Arc testimonial-keith · Keith Wee
```story
kind: testimonial
parent: C03-S02-P01
title: A LETTER FROM KEITH WEE
portal: Read Keith Wee's testimonial
data_ref: testimonials:keith-wee
letter: keith-wee
```

## Story A-TK · Testimonial

### Scene A-TK-S01 · Introduction

#### Panel A-TK-S01-P01 · After the drive
```story
type: PANEL_STANDARD
art: arc-testimonial-keith-ace
```
- VISUAL: The ACE room after the recruitment drive; teenage Reginald and his teacher-in-charge.
- NAR {draft}: Behind every drive is a teacher who trusted us to run it.

### Scene A-TK-S02 · The letter

#### Panel A-TK-S02-P01 · Over the shoulder
```story
type: PANEL_TESTIMONIAL
art: arc-testimonial-keith-handover
```

---

# Arc testimonial-dimuthu · Dimuthu Makawita
```story
kind: testimonial
parent: C05-S09-P01
title: A LETTER FROM DIMUTHU MAKAWITA
portal: Read Dimuthu Makawita's testimonial
data_ref: testimonials:dimuthu-makawita
letter: dimuthu-makawita
```

## Story A-TD · Testimonial

### Scene A-TD-S01 · Introduction

#### Panel A-TD-S01-P01 · The staff room
```story
type: PANEL_STANDARD
art: arc-testimonial-dimuthu-staffroom
```
- VISUAL: NP ICT staff room; NP-age Reginald and his mentor.
- NAR {draft}: Before I leave for the internship, there's one more conversation at school.

### Scene A-TD-S02 · The letter

#### Panel A-TD-S02-P01 · Over the shoulder
```story
type: PANEL_TESTIMONIAL
art: arc-testimonial-dimuthu-handover
```

---

# Arc testimonial-victor · Victor Lum
```story
kind: testimonial
parent: C05-S09-P01
title: A LETTER FROM VICTOR LUM
portal: Read Victor Lum's testimonial
letter: victor-lum
```

## Story A-TV · Testimonial

### Scene A-TV-S01 · Introduction

#### Panel A-TV-S01-P01 · Three years of advising
```story
type: PANEL_STANDARD
art: arc-testimonial-victor-advisor
```
- VISUAL: An NP ICT corridor or consultation room; NP-age Reginald with his advisor, a stack of workshop slides between them.
- NAR {draft}: For three years, one advisor keeps track of the whole picture — the internship, the workshops, the rest.

### Scene A-TV-S02 · The letter

#### Panel A-TV-S02-P01 · Over the shoulder
```story
type: PANEL_TESTIMONIAL
art: arc-testimonial-victor-handover
```

---

# Arc testimonial-rahul · Rahul Varma
```story
kind: testimonial
parent: C05-S07-P01
title: A LETTER FROM RAHUL VARMA
portal: Read Rahul Varma's testimonial
data_ref: testimonials:rahul-varma
letter: rahul-varma
```

## Story A-TR · Testimonial

### Scene A-TR-S01 · Introduction

#### Panel A-TR-S01-P01 · At the desk
```story
type: PANEL_STANDARD
art: arc-testimonial-rahul-desk
```
- VISUAL: Reginald at his desk near the end of the internship; Rahul approaches with a sheet of paper.
- NAR {draft}: There's a different kind of feedback I don't want to forget.

### Scene A-TR-S02 · The letter

#### Panel A-TR-S02-P01 · Over the shoulder
```story
type: PANEL_TESTIMONIAL
art: arc-testimonial-rahul-handover
```

---

# Arc testimonial-yap · Yap Shi Hao (coming soon)
```story
kind: testimonial
parent: C06-S03-P01
title: A LETTER FROM YAP SHI HAO
portal: Coming soon — a testimonial from Guards Formation
letter: yap-shi-hao
status: hold
```

## Story A-TY2 · Testimonial (pending)

### Scene A-TY2-S01 · Coming soon

#### Panel A-TY2-S01-P01 · Teaser
```story
type: PANEL_STANDARD
art: arc-testimonial-yap-teaser
status: hold
```
- VISUAL: Concept only — 2027 parade square, Singapore flag, Reginald in uniform, Yap Shi Hao (Head of Manpower, Guards Formation) nearby. Shown as a "coming soon" teaser; no letter handed over.
- FAC {draft}: Testimonial pending — coming in 2027.
- NOTE: ORD (2027) hasn't happened. Stays `hold` until the real letter arrives.
