# Animating with Claude: series bible (Days 1-11 log, Days 12-30 plan)
Written 2026-10-15 for Hermes. Owner: Manuel (Instagram/TikTok brand manuelslashkern). Hermes drafts and plans; Manuel posts. Nothing is posted, no credits are spent and no render is started by an agent without his yes.

## Evidence base and legend (read first)
- This bible merges 3 reader notes, not 5: two expected readers' notes did not arrive, and the third (Day 11 chat) was cut off at its very end. Days 1-8 are therefore thin. Where I could, I read the plan docx and the Desktop folder myself.
- [D9] = chat "Porsche 3D animated commercial", 10-11 Oct 2026 (Day 9 only). [D10] = chat "Day 10", 11-13 Oct (Day 10 only). [D11] = chat 13 Oct 18:53 to 14 Oct 12:27 (Day 11 only, two attempts).
- [DOCX] = ~/Desktop/Animating with Claude/animating-with-claude-days-3-15.docx. Written by Claude (not by Manuel), file dated 7 Oct, every log entry dated 4 Oct. It is STALE: it still shows Day 9 as an audience vote, Day 10 as a football intro, Day 11 as "Grand Theft Panettone", and the old handle and coral end card.
- [FILES] = file names, sizes and dates in ~/Desktop/Animating with Claude. Dates are file dates, not posting dates.
- "guess" = my inference. Manuel's quotes are verbatim, typos kept.
- No chat confirms that Days 9, 10 or 11 were posted. Posting status of those days is unknown.

## 1. The series in 5 lines
1. "Animating with Claude": 30 days, one short vertical animation per day (3D, motion graphics, explainers), built mostly as code with Claude (Remotion + Three.js), plus ElevenLabs voice and sound effects, and sometimes Higgsfield and Blender.
2. Posted on Manuel's personal brand manuelslashkern: Instagram and TikTok per [DOCX]; the brief adds "and more". Until 14 Oct the handle on screen was @manuelbyclaude / @MANUELBYCLAUDE ([DOCX], Days 3-10); on 14 Oct he changed it to manuelslashkern ([D11]).
3. Cadence: one episode a day is the plan. [FILES] show files on 3-9 Oct (one a day, Days 2-8), then 11 Oct (Day 9), 13 Oct (Day 10), 14 Oct (Day 11): every 1-2 days from Day 9. Each episode ships as reel + stories + cover + bilingual (EN/IT) caption.
4. Status (corrected 26 Oct 2026 from his live Instagram): the 30-day series is FINISHED. Day 30 was posted on 21 Oct 2026. Since then he posts standalone reels ("Comment WORD and I'll send you the prompt"). The live position is in os/social-state.json and in the OS task sync-social: trust those over anything written in this file.
5. Hard constraints now: Higgsfield credits are about zero (3.3 left on 13 Oct, "no credits anymore" on 14 Oct); every day must look different from the previous ones; no real people, brands, logos or song lyrics on screen.

## 2. Format rules every episode follows (only rules supported by evidence)
Source tags show where each rule comes from. Where sources disagree, both are stated.

### Technical
- 1080x1920 (9:16), 30 fps. [DOCX, D9, D10]
- H.264 yuv420p BT.709 + AAC (phone-safe). Forced in remotion.config.ts after AirDrop/Photos failures on Day 9. [D9]
- Length: house rule 20-30 s, "never above 30 s". [DOCX, CLAUDE.md via D10/D11] Actual: D3 24 s, D10 23.97 s, D9 shrank to 15.62 s (allowed), D8B 14.9 s, D11 30.8 s (over the guideline, no objection from Manuel).
- Safe zones: top 250 px, bottom 380 px, sides 60 px. [DOCX, CLAUDE.md]
- Everything driven by the frame number (useCurrentFrame); no Date.now, no Math.random. [DOCX]
- Never invent numbers. Real stats only, "—" when missing. [DOCX, CLAUDE.md; D10 removed an invented camera count]
- No real brands, logos, game assets, real people or song lyrics. Original characters only. [DOCX, CLAUDE.md]

### Look
- Each day has its own original character and style card (character, animation style, technique, palette, camera, sound mood). [DOCX]
- Each day must look different: own palette, light or dark base varied, coral/orange not the default. His words: "every day needs to look a bit different from the previous ones" and "I always start with the same orange look and I dont' want that I wnat the colors to be unqiue evry time". Added as CLAUDE.md rules 4, 6, 15 on 14 Oct. [D11] Day 11 was the first light-background day. [D11]
- Copy references for look and motion, but not blatantly: "change the colouring of the entire video so it doesn't look like a blatant copy". [D11]
- Tone follows the subject: serious subject = serious film ("Don't make it funny", D10; "make it more serious", D11).
- Fonts per day are chosen to match the vibe (D9 serif Cormorant Garamond + Jost; D10 Anton-style giant condensed caps + IBM Plex Mono; D11 Inter Tight + JetBrains Mono as of v2, guess that it did not change; earlier days Anton caps + Montserrat). [D9, D10, D11, DOCX] There is no single house font any more.

### Hook and pacing
- Hook visible at once. [DOCX] says hook text within 0.5-1 s, max 5 words per line, max 2 lines, no black opening frame, a visual change every 1-3 s. [D10] used the social skill's rule: three hooks inside 3 s (visual, spoken, on-screen text). He asked for a strong hook: "use a strong hook". [D10]
- Fast shot-to-shot, fast start and end, slightly slower middle, smooth transitions (dissolves, not flash glitches). [D10]
- Many short scenes where there is a voiceover; split any long scene with cutaways. [D10]
- Aggressive cutting wins: he removed slow-mo, taglines, music and extra copy on Day 9. [D9]

### Loop and end screen
- Days 3-8 were seamless loops (file names say "loop"); loop days have no end card and keep a small day tag on screen the whole time (DAY N/30, ANIMATING WITH CLAUDE, handle); check by playing twice; "Watch it again" goes in the caption, not on screen. [DOCX, FILES, D9]
- Day 9 dropped the loop (file names carried "_loop" until v18; final v22 ends on a frame with "FOLLOW FOR DAY 10"). Days 10 and 11 are not loops. [D9, D10, D11]
- End screen: [DOCX] still describes a flat coral end card in the last 2 s (DAY N/30, ANIMATING WITH CLAUDE, handle, "FOLLOW FOR DAY N+1" pill). Manuel overruled it on Day 10: he had the house rule changed ("change from the rules the fact that the ending screen must be the same") and rejected the coral card ("bro change this ending"). Rule now: the end screen may differ every day and keeps the film's own look. [D10]
- Typical end content: "Day N/30", "ANIMATING WITH CLAUDE", handle, "follow for day N+1" (D9, D10); D11 ends on credit + "Day 11/30" and the CTA "Comment BRAIN". [D9, D10, D11]

### Sound and voice
- Licensed songs are never baked in. Manuel adds the song inside Instagram; the render leaves a measured silent window and sits on a beat grid (BPM + FIRST_KICK_S); he reports the offset in frames and Claude changes FIRST_KICK_S. Silent days are rendered with --muted. [DOCX, D10, D11]
- Days with generated sound bake it in: D7 ElevenLabs SFX, D8 ElevenLabs SFX, D9 voice + gearshift + real V12 recording and no music, D10 voice only for about 3.5 s then silence for his song, D11 voice + 16 SFX and no music. So sound strategy is decided per day. [D9, D10, D11, FILES]
- Voice: ElevenLabs v4 (eleven_v4) always; Claude cannot hear, so he judges voices by ear and Claude sends alternates. [D9, D10, D11]
- Instagram starts videos muted, so on-screen text must carry the hook. [DOCX, D9]

### Language versions
- Captions and stories: English and Italian on every episode from Day 9 ("Giorno N/30"). Day 8 stories had Italian texts plus English files. [D9, FILES]
- From 14 Oct: "every video of the series if spoken gets an italian and an english version", same edit and timing, files dayNN_name_vN.mp4 and dayNN_name_it_vN.mp4. Italian must be an adaptation, not a translation: "do not translate literally to italian make it catchy in italian too but adapt the script and change subtitles accordingly". Silent or text-free days need no Italian video (Claude's reading in D11, guess).
- On-screen text and voice in the video are English unless it is a spoken video with an IT version. [D9, D11]

### Cover, stories, caption, hashtags, CTA
- Cover: a still inside the 3:4 profile-grid crop, carrying the hook or title and "DAY N/30" (D9 ARGENTA lockup; D10 red eye + OMNIEYE + "SAFER. TOGETHER." + DAY 10 / 30; D11 question hook "How smart are you, really?" / IT "Che voto prendi, davvero?"). [D9, D10, D11]
- Stories (7 s, 1080x1920, silent): D9 and D10 had two per language (one before the reel labelled "NEW REEL TODAY" with a countdown sticker, one after labelled "NEW REEL"); D11 had three per language (teaser, poll, "It's out") numbered in posting order, all English first, then all Italian (01_EN... 06_IT...). A band in the middle (y about 1000-1330) stays empty for stickers. Sticker ideas used: countdown, poll, emoji slider, question, share-to-story. [D9, D10, D11]
- Caption: hook sentence, 1-3 plain sentences on what it is, disclaimers/credits, "Day N/30 of Animating with Claude", a follow or comment CTA, hashtags. [D9, D10, D11] Always #animatingwithclaude; then topical tags. Counts: 8 (D9), 8 (D10), 6 (D11); [DOCX] says 5-7.
- Disclaimers used: D9 "Dramatization. Fictional vehicle rendered with AI. Not a real marque." plus CC credit lines; D10 "Dramatization. OMNIEYE is a fictional company and no real person appears. AI narration." [D9, D10] [DOCX]: say "made with Claude and Higgsfield" and use Instagram's AI label if it asks.
- CTA: D9/D10 "Follow for Day N+1". D11 switched to "Comment BRAIN" (comment-to-get-a-guide) with a DM reply template, and tags the creator of the idea (@nocodealex). [D11]
- Titles: the reel title is the hook line; files are named dayNN_shortname_vN.mp4. [FILES, D9]

### Deliverables and housekeeping
- Per day: MP4 (+ IT MP4 if spoken), stories, cover, caption file EN + IT, posting order, sticker ideas, all in ~/Desktop/Animating with Claude. After each new version the old one goes to the macOS Trash via Finder (never rm, never empty the Bin); keep only the latest MP4 + caption. Report path, duration, render time, size. [D9, D10, D11]
- No git commits unless asked (Day 10 and Day 11 code is uncommitted). [D10, D11]

## 3. Day log (Days 1-11)
Sources: Days 3-8 = [DOCX] plan pages + [FILES]; the delivered concept may differ from the plan page, and I mark where. Days 9-11 = chat readers.
- Day 1: no record. [DOCX] only: "Stat line (your Day 1 trademark): 'X TOKENS. ONE VIDEO.'" and the blocky Avatar character used on Days 1-2. A Day 1 video file is NOT in the Desktop folder.
- Day 2: "Sedated" (silent). File day2_sedated_silent_v6.mp4 (18.7 MB, 3 Oct, 6 versions, silent). Blocky Avatar (CLAUDE.md per D10). No other record.
- Day 3: "20 min" rewind loop. Plan: faceless Clock-Head runner (lilac hoodie, clock for a head) on a neon street, countdown 20 MIN to 0 over 20 s, hook "20 MINUTES IN 20 SECONDS / BEAT THE CLOCK", song "20 Min" by Lil Uzi Vert at 123 BPM added in Instagram. 24 s seamless time-rewind loop, v5 = 55 MB, silent, teaser story made. Remotion + Three.js. Posting not confirmed.
- Day 4: "Night race" finale loop. Plan: tuned hatchback CLAUDE GT with MANUELBYCLAUDE plate, night street race, arcade HUD, hook "NIGHT RACE. NO GAME ENGINE.", 25 s. File v9, 83.6 MB, stories + cover folder. [DOCX] note under Day 6: "Day 4's car edit reached 1.5k views with 10 followers" (the only performance figure found anywhere).
- Day 5: "Toxic doll" look loop. Plan: Y2K toy-commercial parody of a fake doll line (PIXEL PUNKZ, Pixel Pia), 12 fps stop-motion. Delivered file name says "toxic doll", v8, 79.6 MB, stories + cover. Final concept vs plan: unconfirmed.
- Day 6: "Last minute" loop. Plan: anime football short, striker DIECI, cel-shaded 3D, 24 s loop at 140 BPM, comment prompt "RATE THE GOAL 1-10", TV score bug as day tag. File name adds "blue lock", v4, 108.8 MB (largest file), stories + cover. [DOCX] note: "From Day 6 the series targets teenagers" and "no niche repeats (no cars, no brainrot)".
- Day 7: "One more try" SFX loop. Plan: teen skater, 90s fisheye skate video, fail montage with TRY counter, hook "TRY 1". Delivered with ElevenLabs sound effects baked in (CLAUDE.md rule 13 per D10), v12, 54.7 MB, stories + cover.
- Day 8: "Don't look away" in two versions. A = satisfying cinematic loop on a grid with beat-timed camera angles (v5, 36.9 MB). B = "Half a beat late": character TOK, the only living cube, always half a beat late; 14.9 s loop at 128.6 BPM; ASMR sound, no music (v9, 29.8 MB). Tools: Remotion + Three.js, ElevenLabs sound effects; simulated-viewer tests (MiroFish, 80 and 160 simulated viewers) chose sound and text (Claude's guess, not data). On-screen line "ALWAYS HALF A BEAT LATE." Stories asked a two-round poll (A comic hero vs B pasta ASMR, then winner vs C 8-bit quest) to choose Day 9. Poll results: no record.
- Day 9: ARGENTA, "Some things are better done by hand." Made-up luxury marque; 3D gearbox with a real shift through neutral, AI-filmed coupe, warm calm voice (Carol), real V12 in the tunnel. Final v22, 15.62 s, 11.5 MB, 22 versions in about 19 h. Detail in 3b.
- Day 10: OMNIEYE (surveillance / Big Brother, serious). Made-up company, slogan "SAFER. TOGETHER."; hook "She never said her name. Omnieye knew." Final v27, 23.97 s, 40.8 MB, 27 versions over 11-13 Oct. Detail in 3b.
- Day 11: BRAIN GRADE (EN + IT). Tutorial-style animated explainer of the free /brain-grade Claude skill by @nocodealex: five AI judges grade you out of 100, a coach names your 3 worst habits. EN v9 (30.8 s), IT v11, cover, captions, 6 stories; CTA "Comment BRAIN". Detail in 3b. Two earlier Day 11 attempts were parked (3c).

### 3b. Detail for Days 9-11
Day 9 (ARGENTA) [D9]
- Plan page was a follower vote ("YOU VOTED. I BUILT IT."); Manuel instead briefed: "Make a 3d animated commercial spot for porsche that goes viral easily for day 9 of animating with claude", then "or even a fabricated car brand". Whether the poll result was used: Day 8 reader [D10] says the poll ran; Day 9 reader [D9] says no record and guesses he skipped the vote. Day09A/B/C are registered but not built.
- Tools: Remotion + Three.js, Khronos "Car Concept" GLB (CC BY 4.0, painted coral, logos stripped) for CG reference stills, Higgsfield nano_banana_pro stills + Kling 3.0 Pro clips (photoreal coupe), gearbox + gloved hand rebuilt in Three.js (AI video failed on mechanical motion), ElevenLabs v4 voice Carol, ElevenLabs SFX and score (score and most effects cut later; the gearshift sounds stayed), real V12 recording "Pagani Zonda Roadster F" by Edvvc (CC BY-SA 3.0). Fonts Cormorant Garamond + Jost.
- Final film: spoken/written "Some things are better done by hand." (0-2.5 s), gearshift 2nd-neutral-3rd, tunnel V12 only under the tunnel scene, end frame "ARGENTA" spoken and written. No music, no other copy.
- Captions EN: "Some things are better done by hand." / IT: "Certe cose si fanno ancora a mano." Hashtags #animatingwithclaude #claudeai #aianimation #carcommercial #savethemanuals #manualtransmission #3danimation #luxurycars. Credit lines for the engine sound and car model are in the caption.
- Money: Higgsfield 207.84 credits at the start (10 Oct 21:12 UTC), about 107.59 at 11 Oct 07:44; Claude's own tally was 45 + 29.75, so about 25 credits are unexplained (guess: retries). Manuel set explicit caps ("use 50 higgsfield credits... no budgeting use them as max").
Day 10 (OMNIEYE) [D10]
- Replaced the plan's football "GOL." Brief after he sent a reference clip (dark satellite data-viz, red perimeters, big lowercase words sliding up, calm news narrator, no music, 25 s): "3d motion graphics, surveillance cameras, face recognition and one big made up company emulating the concept by george orwell in 1984 of big brother".
- Final v27 structure: very short voiced intro over a red round-iris orb and a dossier flipping to KNOWN; a silent 16-beat music window on a beat grid (city canyon run, radar, face grid, hack screen, terminal "NO CONSENT ON FILE.", wall of 3D scanned heads with RISK boxes, route prediction); text-only closing lines on the beat (MADE UP / REAL. / YOU., FICTION stamp, MATCH FOUND); custom end screen (ink black, red viewfinder, "END OF TRANSMISSION", "day 10/30", handle, red pill "follow for day 11").
- Spec: 719 frames, voice Harper Lawson (female) at 1.09x, 100 BPM grid, first kick at 3.35 s; whole edit slowed 10% on his request. Palette ink black, off-white, red #FF2B2B, steel, terminal green.
- Tools: Remotion 4.0.532 + Three.js, ElevenLabs v4, Higgsfield (gpt_image_2_5, Kling 3.0 Pro plates, Hunyuan3D heads, hosted Blender 5.2), arena skill (script), slopmonster, remotion-best-practices (installed on his request), social/video skills, code-review subagents.
- Version path: v1/v2 jokey corporate ad (rejected) -> v3 Higgsfield photos (rejected, built without seeing the reference) -> v4-v7 3D scanned heads and a "they already have your face" hook -> v8 Kling plates -> v9 no real people -> v10-v14 cartoon heads, silent window, faster ends -> v15 dissolves -> v16/v17 Blender heads (v17 rejected) -> v18 full rebuild in Palantir style -> v19 round iris, Watch Dogs / Mr Robot graphics -> v20-v27 voice cut to a 3 s intro, voice swaps, song grid, slower edit.
- Captions: EN "She never said her name. Omnieye knew. OMNIEYE is made up. The matching is real. ..." with "Day 10/30 of Animating with Claude. Follow for Day 11." IT: "Non ha mai detto il suo nome. Omnieye lo sapeva." Hashtags #animatingwithclaude #claudeai #aianimation #bigbrother #1984 #surveillance #facialrecognition #3danimation. Stories: "SHE NEVER SAID HER NAME." (countdown) and "YOU ARE / IN FRAME." (poll "Would you notice? YES / NO"). Cover: red eye, OMNIEYE, "SAFER. TOGETHER.", "DAY 10 / 30".
- Claude never watched or heard a full playback; checks were stills and audio levels.
Day 11 (BRAIN GRADE) [D11]
- Concept: your AI flatters you; the skill reads only your typed chats; five AI judges (fast thinking, logic, people skills, creativity, common sense) grade you alone out of 100, 50 = average, no rounding up; a coach names your 3 worst habits plus the fix; red BRUTAL stamp; ends with a phone where BRAIN is typed in an Instagram comment. Started as a 3D brain lab; he cut the brain ("looks disgusting") after a second reference.
- Look: cream #F3EEE4 with dot grid, ink, cobalt #2F4BFF accent, each agent its own pastel. Remotion only (Three.js was only in the discarded v1).
- Voice: EN "X - Confident, Playful, Expressive" (approved: "that's great"); IT voice Chiara, fitted about 1.05x to the English phrase times. 16 ElevenLabs SFX at master gain 0.8 (he asked -20%). 0 Higgsfield credits.
- Files: day11_brain_grade_v9.mp4 (EN, 13.1 MB), day11_brain_grade_it_v11.mp4 (IT, 12.8 MB), covers EN/IT, caption .txt EN/IT, folder "Day 11 - stories" (6 stories). A private Claude Artifact holds the setup guide; Manuel must press Share before posting or nobody can open it.
- EN script (plain words): "Your AI always says you're brilliant. It's just being nice. This free add-on for Claude makes it honest. It reads only what you've typed. ... Fifty is average. No rounding up. ... It's brutal. And weirdly useful. Want your score? Comment BRAIN." IT is an adaptation ("Niente sconti", "Fa male. Ma ti serve un sacco."). Caption EN tags @nocodealex. Hashtags #claude #claudecode #ai #aitools #iqtest #animatingwithclaude.
- Iterations: v1 3D lab -> v2 lime/paper -> v4 cream/cobalt -> v5 voice re-cut + SFX -> v6 question-mark signs fixed -> v7 "Comment BRAIN" CTA, cover, caption -> v8 SFX -20% -> v9 EN; IT v9 -> v10 school theme -> v11 his wording fixes.
- Cost: voice takes about 20 cents EN, about 23 cents IT first take, about 31 cents of IT retakes; SFX about 270 ElevenLabs credits.

### 3c. Day 11 attempts that were parked (all by [D11], 13 Oct)
- Attempt 1, blackpill / mogging / looksmaxxing 3D edit with a character VERTEX and game-creator UI (v1-v3, 25.57 s): rejected after v3 ("No I don't want it like that change the direction"). About 87 Higgsfield credits spent, about 35 on photoreal stills/clips he did not want.
- Attempt 2, model-type character (shoulder-length messy hair, plain black tee) on a rainy neon street, Jordan Barrett / Chico-style edit with no words and no voice (v5-v6, 21.6 s, silent, song "Love Potions" by BJ Lips at 122 BPM added in Instagram): he liked it ("yes but not those words", "improve the scenes but I like it"). Built from 5 Kling clips.
- Attempt 3, BLACKPILL made-up perfume commercial using the same character and clips (v7-v10, 25.6 s): v8 "too much like a meme", v10 serious cut delivered, never approved or rejected. Credits ran out ("finished higgsfield credits I'm lost"); next morning: "we're skipping day 11 for now" and Day 11 became Brain Grade. Composition Day11Perfume and the 5 clips are kept.

## 4. What he likes and what he rejects
Dates: Day 9 chat 10-11 Oct, Day 10 chat 11-13 Oct, Day 11 chat 13-14 Oct (2026).

### Likes (approvals and consistent asks)
- Ambition and realism where it counts: "I want a hollywood budget video / so this needs to be professional"; premium, minimal, few words (Day 9, 11 Oct). Restraint: one accent colour, no shake/flashes on luxury (D9).
- Copying a reference closely and actually watching it: "rewatch the video I sent you" (D10, 11-12 Oct). References he named: Palantir ads/edits (black voids, red all-seeing eye, decision console of maps and dossiers, giant slammed caps), Mr Robot and Watch Dogs graphics, Ken Carson-style edits (one-off, stopped), Jordan Barrett and Chico edits.
- Real recorded sound for the hero moment (real V12), minimal sound: voice + gearshift + V12, no music (D9). Engaging sound effects on cuts, pops, whips, stamps; tutorial that moves (whip pans, scramble text, zoom-through cuts, rolling numbers) (D11, 14 Oct).
- Physical realism: the lever must go 2nd -> neutral -> 3rd; a gloved hand on the knob; realistic tyre spray (D9).
- 3D motion-graphic scanned heads "detailed and realistic but do not exagerate" (D10).
- Plain words that "someone who doesn't work with ai" can follow; "more viral and engaging"; helping-out content with a Comment keyword and a guide (D11). "instagram favors helping out content" is his belief, unverified.
- Voices he approved: ElevenLabs X "Confident, Playful, Expressive" (D11, "Love it", "that's great"); Carol, warm calm female, "almost asmr" then "just a little less asmr" (D9).
- Model-type character with hunter eyes on a real rainy city street (D11, "yes"); a version with zero on-screen words.
- Skills actually used: "find useful skills to use for this series and fucking use them" (D10): arena for scripts, remotion-best-practices, social/video, ui-ux-pro-max, taste, slopmonster.

### Rejects (his corrections)
- Funny when the subject is serious: "Don't make it funny" (D10, 11 Oct); "this looks too much like a meme / make it more serious" (D11, 13 Oct).
- Photoreal people: "I don't like it Get all the real humans off of the video" (D10); "too realistic" (D11, 13 Oct, game-model direction).
- Looks he called bad: "this looks like shit rewatch the video I sent you" (D10 v3); cartoon heads, then "make the faces look less creepy".
- Same ending / same orange look every day: "bro change this ending" (D10); "I always start with the same orange look..." (D11, 14 Oct).
- Slow motion: "no slo mo", "change the slo-mo part ... looks like shit to me" (D9). Slow pacing: "make it a bit faster" (D9, twice); "quicker, faster move from one shot to another" (D10).
- Deep male / supermarket-ad voices: "no change the voice it needs to be a high end commercial not like a supermarket commercial" (D9). A voice that does not finish sentences (D11).
- Cringe or sad copy: on-screen "IT'S OVER", "MOGGED" ("cringe"); "No too sad" (D11, 13 Oct). Taglines he cut: "The last manual.", "Every shift, yours.", "Feel every gear" (D9).
- Stills instead of motion: "I want a moving video, not stills" (D11); game UI (boss bar, sliders) and Anton game titles for the blackpill edit (D11).
- A disgusting visual: the glossy procedural brain (D11). A blatant copy of a reference (D11).
- Spending credits before the direction is locked: "send me a preview before spending anymore credits" (D11); wants "higgsfield only when you have a clear direction" (D11). A bare "OK to spend N credits?" question was dismissed.
- Clarifying questions: dismissed twice on Day 10 (then gave the real instruction), "nono" on Day 11, "you choose based on what I asked you for" on Day 9. Work style: act, decide, ship a render.
- Italian wording he fixed (D11): not "ti liscia il pelo"; "ti danno un voto" instead of "pagella"; "skill" instead of "add-on".
- Working style: in Claude chats every sentence starts with "Manuel," (chat messages only, never video text; D9). He judges by the file in the folder. He reviews on his phone, so files must be phone-safe.

## 5. Production pipeline (steps, tools, costs)
Planned budget was 2-3 h per day ([DOCX]); actual: Day 9 about 19 h and 22 versions, Day 10 about 2 days and 27 versions, Day 11 about 6 h for the delivered version plus about 3 h on parked attempts.
1. Context: read project CLAUDE.md (house rules) and the day page in the plan docx (no pandoc: unzip word/document.xml with python). Project: ~/code/animating-with-claude. State "Done means:" in one line and what looks new versus earlier days. Cost: none.
2. Reference: decode his reference MP4 into frames and audio with Remotion's bundled ffmpeg (per-frame -ss; no fps/select/tile filters, no PIL). Read the whole thing; Claude cannot hear audio. Cost: none.
3. Script: arena --quick (16 agents, 4 rounds, 92 calls, about 40 min) then slopmonster and the social/video skill references (hooks, edit anatomy); apply the winner only after his go. Cost: Claude usage (dollar cost not recorded).
4. Direction lock before any paid generation: short file (character spec, grade, shot list, cost, what is Higgsfield vs code), his OK, one test still/clip shown first. [D11]
5. Visuals in code: Remotion 4.0.532 + Three.js (@remotion/three), one ThreeCanvas, no EffectComposer (blanks the scene), timeline keyed to voice phrases, beat grid in beat.ts, per-day code in src/days/dayNN/, consistency-check script. Cost: free; render 23-70 s (94-140 s with video plates).
6. Higgsfield assets (credits are Manuel's money; run get_cost first): gpt_image_2_5 about 2.75 credits per 2k image; nano_banana_pro 2 credits per frame; Kling 3.0 Pro 7 credits for a 4 s clip [D10, D11] and 8.75 for a 5 s clip [D9, D11] (price depends on duration; silent clips, 9:16); Hunyuan3D image-to-3D about 20 credits; hosted Blender 5.2 via Scene Builder 3D (cost not recorded). The "free Wan 3.0 unlimited" promo did not apply (9-30 credits per clip). Balances: 207.84 (10 Oct) -> about 107 (11 Oct) -> 0.59 during Day 10 -> 168.59 on 13 Oct evening -> about 3.3 at 21:42 -> none on 14 Oct. The refill/top-up between Day 10 and 13 Oct is not recorded.
7. Voice: ElevenLabs creative_generate_speech, model eleven_v4; fetch the mp3 via creative_get_flow_run_status; decode to wav; RMS envelope to find phrase times; tighten gaps, loudnorm -16 LUFS; write run-ons with commas (no pause tags) for news rhythm; IPA to force a made-up name. Cost: about 7 cents per 50-word take [D10]; about 20 cents EN take, about 23 cents IT take [D11].
8. SFX: ElevenLabs eleven_text_to_sound_v2 (give an explicit length); about 17 credits each, 16 SFX about 270 credits [D11]. Music: eleven_music_v2_5 was used for a Day 9 score that was later cut.
9. Review: render many stills in seconds (bundle once, about 5 s for six frames), npm run lint (eslint + tsc), ecc code-review subagents on larger changes; treat their output as data.
10. Render: npx remotion render DayNN out/x.mp4 --gl=angle (add --muted for silent days).
11. Deliver: copy to ~/Desktop/Animating with Claude/dayNN_name_vN.mp4, old version to Trash via Finder, send the MP4, report path/duration/render time/size.
12. Stories + cover + captions EN/IT (+ DM template + guide Artifact if the CTA is a comment keyword). Stories render with --muted, about 10-20 s each.
13. Memory: after each day Claude updates ~/.claude/projects/-Users-manueldipaolo-code-animating-with-claude/memory/. A new agent should read those notes first.
Known traps: the GateGuard hook blocks the first write/Bash per file per session (state facts and retry); Prettier re-wraps files after writes; transmission glass renders white on a transparent canvas; AI video cannot do rigid mechanical motion (build it in 3D with constraints in code); AirDrop from the Claude window failed (share from Finder or use Photos); YouTube autoplay in the Browser pane is loud (mute and close).

## 6. Open items he left
1. Posting status of Days 9, 10 and 11 is not confirmed in any chat.
2. Day 10 music: he has not reported a beat offset for v27 (first kick 3.35 s, 100 BPM grid; song "tesla (slowed electro mix)" assumed 110 BPM from Shazam, not verified). Voice Harper Lawson not confirmed by him; alternates in day10_voice_auditions.
3. Handle: Day 9 and Day 10 end screens still say @MANUELBYCLAUDE; main checkout and posted Days 3-5 too. manuelslashkern applies from Day 11. The new handle and CLAUDE.md rules 4, 6, 15, 16 exist only in the Day 11 worktree. AGENTS.md says the slashkern (company) Instagram handle is not confirmed; this series is on the personal brand manuelslashkern.
4. Day 11 code is uncommitted in a worktree whose registry.tsx lacks Days 6-10 (needs a careful merge). Claude offered "Save the Day 11 work in git"; no answer. Day 10 code is also uncommitted.
5. Day 11 guide Artifact is private until Manuel presses Share; whether its text still says "DM" is unconfirmed. Comment-to-DM must be done by hand or with a tool (none chosen). Alex Chen gates his skill file behind an email signup while Manuel's guide gives the file away (MIT allows it with credit); Claude offered to link to Alex's page instead; no answer.
6. Day 11 EN video and EN stories/caption still say "add-on", IT says "skill"; he answered "I'm ok with the videos". EN video is 30.8 s (over the 30 s guideline); trim offered, no reply.
7. Test of his belief "instagram favors helping out content": compare Day 11 saves, shares, DMs and comments after 24 h with Day 10 (cheapest real test proposed in D11).
8. Parked Day 11 assets: Day11Perfume (serious perfume spot v10), 5 Kling clips, bottle design. A "him holding the bottle" clip would need about 9 credits. He said "we're skipping day 11 for now".
9. Plan docx is stale (Day 9 vote page, Day 10 football "GOL.", Day 11 "GRAND THEFT PANETTONE: MILANO", coral end card, old handle). Claude offered to update it; not done. The docx's Day 9 poll note says the losing options "can become Day 20 and Day 21 content"; which options lost is not recorded.
10. Days 12-15 pages exist in the docx only (registry lengths 26, 28, 26, 28 s). No plan for Days 16-30 exists beyond the docx idea bank (kart racing, claymation, PlayStation 1 look, brick world, isometric city builder, 80s synthwave, paper pop-up, fighting-game intro, Wes Anderson diorama, 8-bit platformer).
11. Higgsfield credits: none. Check balance and the exact cost (with reference media) before any spend. About 25 credits of Day 9 spend are unexplained; check Higgsfield transactions.
12. Licences: Day 9 caption must keep CC BY-SA 3.0 (V12 by Edvvc) and CC BY 4.0 (Car Concept, Eric Chadwick / DGG) credits; the MIT hand model is credited only in CREDITS.txt.
13. Ken Carson one-off (edit an Instagram story): stopped by him, nothing downloaded; leftover untracked code (scripts/oneoff-analyze.mjs, src/oneoff/KenEdit.tsx, public/oneoff/analysis.json, KenEdit in src/Root.tsx). Claude offered to delete it; no answer.
14. AirDrop to iPhone still failed at the end of Day 9; unresolved options were Finder share, Wi-Fi off/on, Photos with iCloud.
15. SFX loudness on Day 11 checked by measurement only (Claude cannot listen). Day 9 and Day 10 final audio was never heard by Claude.
16. Series rules to keep: bilingual spoken videos; stories + cover + caption with a DM template; unique palette per day; old versions to Trash; credits only after a locked direction; no real people or brands; serious tone for serious topics.
17. Docx audience conflict: Day 6 note says the series targets teenagers; Day 14 page targets freelancers and designers. Decide before Day 14.

## 7. DAYS 12-30: proposed plan (Claude's guess, not data)
EVERYTHING IN THIS SECTION IS CLAUDE'S GUESS, NOT DATA. Rows for Days 12-15 come from the [DOCX] pages (written by Claude on 4 Oct, never confirmed by Manuel); my adaptations are also guesses. Manuel has overridden the docx on Days 9, 10 and 11, so treat every row as a proposal he can swap.

Effort scale (guess, from the data points in section 5): S = code-only, reuses the existing kit, about 3 h or less; M = new look or voiced EN+IT, about 3-8 h (Day 11: about 6 h); L = 20+ versions or a multi-day build (Day 9: 22 versions / about 19 h; Day 10: 27 versions / about 2 days).

Planning constraints (guess): Higgsfield credits are about zero, so every row is code-first and any credit-spending step is marked "needs credits, ask first". Arithmetic on pace: if 1 episode a day from 15 Oct, Day 30 is 2 Nov; at the Day 9-11 pace of about 1.5 days, Day 30 is about 12-13 Nov. Streak-savers (cheap, no new assets): Days 13, 22, 26, 29. Arc: Days 12-15 variety and trust; Days 16-20 one new skill per day; Day 21 production peak; Days 22-28 contrast and honesty; Days 29-30 close the loop. Day 15 is the halfway marker; Day 21 is the peak of the remaining run.

Index (day, title, effort): 12 BOIL DIFFERENT M | 13 THE PROMPT. NOTHING ELSE. S | 14 THINGS YOU SHOULD DEFINITELY GHOST M | 15 15 DAYS. REAL NUMBERS. M | 16 YOU VOTED. I BUILT IT. M | 17 100 CLAUDES. ONE WINNER. M | 18 FROM ZERO TO CLAY M | 19 CLAUDE'S FIRST SONG M | 20 CLAUDE SAYS "DONE." M | 21 ONE TAKE L | 22 THE CITY THAT GROWS S | 23 ROUND 1: FIGHT M | 24 YOUR FIRST THING IN 3 PROMPTS M | 25 THE RENDER BAR M | 26 THE RECEIPT S | 27 YOUR COMMENTS, ANIMATED M | 28 LEVEL 28 M | 29 THE MODEL EDIT S | 30 30 DAYS. 30 SECONDS. L

### Day 12: BOIL DIFFERENT (M) [from DOCX]
- Concept: premium keynote launch for a fictional stainless-steel pasta pot ("A18 Pasta chip", "Al Dente mode", three finishes, price "EUR 9.99* *PASTA NOT INCLUDED", "one more thing" with a black-silhouette presenter holding a bowl), 26 s.
- Tools: Remotion + Three.js (LatheGeometry pot, brushed-steel PBR, exploded view, kinetic type); sting/ding sound design; optional Higgsfield stills (needs credits, ask first).
- Why it fits: a bright, funny palette cleanser after dark Day 10 and the Day 11 tutorial; proves what Three.js can do in one prompt.
- Adapt: deadpan and premium (his Day 9 taste), own palette not coral, no real company/event branding, claim "one prompt" only if true (docx rule). Third fake-product spot after Days 5 and 9, so keep the joke in the copy, not in meme effects.

### Day 13: THE PROMPT. NOTHING ELSE. (S) [from DOCX]
- Concept: raw process video: a real Claude Code session receives one prompt (top half, 8x speed) while the animation builds in three passes (wireframe, lit, finished); then the result full screen and real counters; CTA "Comment PROMPT" sends the exact prompt.
- Tools: screen recording + Remotion overlays (OffthreadVideo, JetBrains Mono counters); stats from a real stats.json (tokens, minutes, prompts); optional EN+IT voice-over.
- Why it fits: trust and comments, reuses Day 11's comment-keyword mechanic; light day (docx: about 1.5 h) to recover time.
- Adapt: hide keys, emails, usernames, paths; real numbers only; consider recording the Day 12 or Day 14 build as the session.

### Day 14: THINGS YOU SHOULD DEFINITELY GHOST (M) [from DOCX]
- Concept: an original sheet-ghost in a candlelit hallway holds five signs (red flags); at the end the sheet lifts to reveal a tired creator in a hoodie and big headphones; Halloween-season trend format.
- Tools: Remotion + Three.js (draped sheet with vertex displacement, CanvasTexture signs, candle flicker with random(seed)); optional Kling reveal shot (needs credits, ask first); trending sound added in Instagram on posting day.
- Why it fits: timely trend that rides a known format; spooky-cute after clean Day 12/13.
- Adapt: docx signs are freelancer red flags ("CAN YOU MAKE THE LOGO BIGGER?", "IT'S JUST A SMALL CHANGE", "I'LL PAY YOU NEXT MONTH", "CAN YOU DO IT FOR EXPOSURE?", "MY COUSIN DOES IT FOR FREE"); the audience note conflicts (teens vs freelancers), so Manuel decides; a beginner-maker set of signs is an alternative (guess). Post by 31 Oct; keep it general, no real clients.

### Day 15: 15 DAYS. REAL NUMBERS. (M) [from DOCX]
- Concept: halfway recap in a 90s anime-opening style: freeze frames with tilted title cards, speed lines, shutter wipes, then big honest counters (followers start to now, views, tokens) and a lineup of the series' characters; story poll "What should Days 16-30 be?".
- Tools: Remotion compositing of the delivered MP4s (OffthreadVideo), halftone/speed-line effects, mono counters from a real stats.json supplied by Manuel (Instagram Insights + Claude usage).
- Why it fits: midpoint reset that converts new visitors, and the vote feeds Day 16.
- Adapt: use frames of what was actually posted (ARGENTA, OMNIEYE, the brain-grade judges), not the docx descriptions; Day 1 file is missing from the Desktop; "DAY 1: 2.8B TOKENS" in the docx is an example, not a verified fact; only real numbers, small is fine.

### Day 16: YOU VOTED. I BUILT IT. (M)
- Concept: build the winner of the Day 15 poll from three options already scripted in the docx: A masked comic hero swinging between towers (halftone, panel splits, 12 fps), B pasta macro ASMR, C 16-bit pixel-art quest (180x320).
- Tools: Remotion (+ Three.js for A and B, 2D pixel renderer for C), ElevenLabs SFX for B; no voice, so no IT video.
- Why it fits: pays off the vote promise that Day 9 skipped; audience participation right after the recap; first of the "new skill a day" run.
- Risks: small audience may give few votes, so Manuel breaks ties; if B wins, change Day 12's pot gag to avoid two pasta days.

### Day 17: 100 CLAUDES. ONE WINNER. (M)
- Concept: explainer #2 in the Day 11 format about the arena skill: many Claudes get the same task, fight in a single-elimination bracket, a judge scores each match, one answer survives ("your AI's first answer is a draft"); cartoon tournament bracket, CTA "Comment ARENA" for a guide.
- Tools: Remotion 2D reusing the Day 11 kit (timeline.ts, Kinetic, Judge), ElevenLabs v4 EN voice + IT voice + SFX, ui-ux-pro-max + taste, slopmonster for captions.
- Why it fits: tests whether "helping-out" content beats pure spectacle (compare saves/shares/DMs with Day 11); skill-explainer lane, cheap because the pipeline exists.
- Adapt: check the arena skill's author and licence and credit them; own palette (not cream/cobalt); EN + IT versions.

### Day 18: FROM ZERO TO CLAY (M)
- Concept: claymation at 12 fps: a lump of clay shapes itself, step by step, into one finished object, with fingerprints and wobble, ending on a held beauty shot.
- Tools: Remotion + Three.js (noise-displaced clay material, stepped time at 12 fps), ElevenLabs SFX (squish, pop); no voice.
- Why it fits: a tactile warm counterweight after two explainer-style days; first stepped-time/material study; a literal "start from zero" image.
- Adapt: tie to slashkern ("From zero to product.") only if Manuel wants it; copy rules in AGENTS.md apply.

### Day 19: CLAUDE'S FIRST SONG (M)
- Concept: a 25 s original track generated with ElevenLabs music, visualised as audio-reactive geometry; the sound is baked in.
- Tools: ElevenLabs eleven_music_v2_5, Remotion audio-reactive scene, ffmpeg loudness; also export a silent-window variant for his own song.
- Why it fits: first day with fully owned audio and no licensed song; tests sound-on reach; another new skill.
- Risks: Manuel normally adds songs in Instagram and cut the Day 9 score, so ask which export he prefers.

### Day 20: CLAUDE SAYS "DONE." (M)
- Concept: a two-character skit: a maker and a Claude mascot; Claude says "Done!" five times while the result on screen is visibly broken, and the sixth time it is right; lip-sync driven by audio amplitude.
- Tools: Remotion 2D/3D characters (reuse the Day 11 chat-bubble style), ElevenLabs v4 two voices EN + adapted IT, SFX.
- Why it fits: first dialogue sketch, relatable humour that echoes Day 11's "your AI flatters you", a release valve before the peak; characters can return in the finale.
- Adapt: keep the joke honest (a real failure he had, supplied by Manuel).

### Day 21: ONE TAKE (L) (production peak)
- Concept: a 30 s single continuous camera move, no cuts, flying through 6-8 miniature worlds with hidden match-move hand-offs (through a window, a pupil, a screen, a cup); some worlds echo earlier days.
- Tools: Remotion + Three.js camera spline, props reused from earlier day folders (Day 10 orb/console kit, Day 9 gearbox, etc.), optional hosted Blender hero asset, ElevenLabs SFX, beat grid with a silent window for his song.
- Why it fits: the technical showpiece of the run and a reward for people who followed; zero credits needed; prepares the finale.
- Risks: the largest build (budget 1-2 days); start the evening before; keep Day 22 as the recovery day.

### Day 22: THE CITY THAT GROWS (S)
- Concept: a satisfying isometric loop: a tiny city adds one building per beat in perfect cycles with soft ASMR clicks.
- Tools: Remotion + Three.js instanced meshes, orthographic camera, ElevenLabs SFX clicks; seamless loop, no voice.
- Why it fits: breather after the peak; loops invite replays (docx claim, unverified for his account); streak-saver; second loop day since Day 8.
- Adapt: use a fresh palette; the docx also keeps the Day 8 loop in a second colour as a spare.

### Day 23: ROUND 1: FIGHT (M)
- Concept: a fighting-game intro with a VS screen, two original fighters made of household objects, health bars, ROUND 1 and a KO.
- Tools: Remotion + Three.js toon shading or 2D, ElevenLabs SFX and an announcer voice (EN + adapted IT).
- Why it fits: high-energy genre not used since Day 4; a loud contrast to the calm Day 22.
- Risk: on 13 Oct he dropped game UI (boss bar, sliders) for the blackpill edit, so confirm he still wants a game-UI day.

### Day 24: YOUR FIRST THING IN 3 PROMPTS (M)
- Concept: beginner tutorial #3: from nothing to one small finished thing in 3 prompts, shown with honest counters, CTA "Comment START" for a guide.
- Tools: real screen recording + Remotion overlays (Day 13 pipeline), EN + IT voice, SFX.
- Why it fits: helping-out content for people starting from zero, in line with slashkern's idea; third explainer-lane episode only if Day 11/17 numbers justify it.
- Adapt: "3 prompts" must be true; any slashkern or waitlist mention is Manuel's call and AGENTS.md rules apply (nothing launched, no user numbers).

### Day 25: THE RENDER BAR (M)
- Concept: a symmetrical pastel diorama story (Wes Anderson mood, centred shots, whip pans, title cards): a small Mac waits while a progress bar crawls, with tiny dramas around it.
- Tools: Remotion + Three.js or flat 2D, foley SFX; optional soft narrator (EN + IT).
- Why it fits: quiet and personal pace change; relatable to anyone who has waited on a render.

### Day 26: THE RECEIPT (S)
- Concept: honest process: split screens of version 1 versus the final of Day 9 (22 versions) and Day 10 (27 versions), plus real costs and hours for the series.
- Tools: Remotion compositing, mono counters; data supplied by Manuel (Higgsfield transactions, ElevenLabs usage, Claude usage); old renders from the macOS Bin if they are still there (unverified), else stills.
- Why it fits: extends the "real numbers" promise and shows the work behind the polish right before the finale.
- Adapt: real figures only; section 5 cost figures are per-item, not totals.

### Day 27: YOUR COMMENTS, ANIMATED (M)
- Concept: five viewer comments become five short scenes, each in a different earlier style.
- Tools: Remotion 2D/3D kit reuse, optional ElevenLabs voice.
- Why it fits: community payoff before the end; uses the comments that the Comment-keyword days collect.
- Risks: needs five usable comments; fallback is the DM/comment requests from Days 11, 13 and 17. Use first names or no names only with permission; no personal data.

### Day 28: LEVEL 28 (M)
- Concept: a PlayStation-1-look liminal walk (240p dithering, affine texture warp, vertex wobble) through an empty corridor, the day number as the level, ending at a door marked "29".
- Tools: Remotion + Three.js with a low-res post pass, ElevenLabs ambience SFX; no voice.
- Why it fits: eerie contrast before the finale and another distinct look; the liminal-space trend is my guess about what teens watch.

### Day 29: THE MODEL EDIT (S)
- Concept: finish the liked Day 11 attempt-2 edit: the model-type character on a rainy neon street, no words, cut on his own song in Instagram, new end screen with the manuelslashkern handle.
- Tools: existing Kling clips and edit code in the Day 11 worktree (zero new credits; the v6 render itself may be trashed, re-render from code), Remotion beat grid.
- Why it fits: a quiet beauty piece before the largest finale build.
- Risks: Manuel must confirm he still wants it (he never approved a final cut); check that no "blackpill" wording appears on screen. Fallback: the Day 8 loop in a second colour.

### Day 30: 30 DAYS. 30 SECONDS. (L) (finale)
- Concept: one second per day, Days 1-30 in order on a beat grid; the last frame equals the first frame of Day 1 so the series loops; final 3 s show real totals and "what's next".
- Tools: Remotion compositing from the 30 delivered MP4s (OffthreadVideo), beat grid for his song in Instagram, custom end screen, stories + cover + EN/IT captions; optional thank-you voice line.
- Why it fits: closes the loop with Day 1 and differs from Day 15 (a no-explanation supercut, not a counter recap).
- Needs from Manuel: the Day 1 video (not in the Desktop folder), real totals (videos, tokens, hours, followers start to now), his decision on "what's next" and whether to mention slashkern (AGENTS.md copy rules apply). Start the evening before; budget 1-2 days.

### Reserve assets (not counted in the 19; Claude's guess, not data)
- Day11Perfume (BLACKPILL, serious cut v10): ready, but a third fake-product spot, and the word "blackpill" has an online-subculture meaning, so check brand safety with Manuel.
- Docx unbuilt scripts: Day 10 football "GOL." sports intro; Day 11 "GRAND THEFT PANETTONE: MILANO" (style only, no Rockstar names). Idea bank leftovers: kart racing (conflicts with the docx "no cars" note), synthwave, brick world, paper pop-up, 8-bit platformer (vote option C).
