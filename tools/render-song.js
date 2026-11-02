// render-song: composes "Tum Se Hi Ghar" and renders it to a WAV file.
// Usage: npm i node-web-audio-api@1 && node tools/render-song.js song.wav

const { OfflineAudioContext } = require("node-web-audio-api");
const fs = require("fs");
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  const SONG = [
    { who: "Everyone", note: "softly, over the mandolin", kind: "spoken", tune: "intro", lines: [
      ["चौवन बरस… और वही एक मुस्कान", "Chauvan baras… aur wahi ek muskaan"],
      ["हैप्पी बर्थडे, पापा", "Happy birthday, Papa"] ] },
    { who: "Mumma", note: "verse 1", tune: "verse", lines: [
      ["तेरी ये मुस्कान, दिल को सुकून दे", "Teri ye muskaan, dil ko sukoon de"],
      ["हर पल तेरे साथ का, एहसास दे", "Har pal tere saath ka, ehsaas de"],
      ["लड़ूँ भी, झगड़ूँ भी, फिर भी ये जानूँ", "Ladoon bhi, jhagdoon bhi, phir bhi ye jaanoon"],
      ["प्यार के जादू से, तू मुझको मना ले", "Pyaar ke jaadoo se, tu mujhko mana le"] ] },
    { who: "Mumma", note: "pre-chorus", tune: "pre", lines: [
      ["मेरे नखरे, मेरी ख़्वाहिशें, तुम बिन कौन उठाए", "Mere nakhre, meri khwahishein, tum bin kaun uthaaye"],
      ["रब से बस ये माँगूँ, हर जनम तू ही आए", "Rab se bas ye maangoon, har janam tu hi aaye"] ] },
    { who: "Everyone", note: "chorus", kind: "chorus", tune: "chorus", lines: [
      ["तुम से ही घर, घर बनता है", "Tum se hi ghar, ghar banta hai"],
      ["तुम हँसो तो, ये घर हँसता है", "Tum hanso toh, ye ghar hansta hai"],
      ["मेरी उमर भी तुमको लग जाए", "Meri umar bhi tumko lag jaaye"],
      ["तुम बिन अपना, कोई जहाँ नहीं", "Tum bin apna, koi jahaan nahin"] ] },
    { who: "Bhaiya", note: "verse 2", tune: "verse", lines: [
      ["आप हो हीरो इस घर के, मेरे और श्रिया के", "Aap ho hero is ghar ke, mere aur Shriya ke"],
      ["हर मोड़ पे आपने, थामा हाथ", "Har mod pe aapne, thaama haath"],
      ["आपसे सीखा, गिर के सँभलना", "Aapse seekha, gir ke sambhalna"],
      ["आपसे सीखा, चलना साथ", "Aapse seekha, chalna saath"] ] },
    { who: "Bhaiya", note: "pre-chorus", tune: "pre", lines: [
      ["फ़ख़्र है हमको आप पे, पापा", "Fakhr hai humko aap pe, Papa"],
      ["अभी तो बहुत कुछ, सीखना है साथ", "Abhi toh bahut kuch, seekhna hai saath"] ] },
    { who: "Shriya", note: "verse 3", tune: "verse", lines: [
      ["वो लंबी बातें, वो आपकी सीखें", "Wo lambi baatein, wo aapki seekhein"],
      ["आपको सताना, सबसे हसीं पल", "Aapko sataana, sabse haseen pal"],
      ["कह ना सकें हम, दिल की ये बातें", "Keh na sakein hum, dil ki ye baatein"],
      ["आप ही प्रेरणा, आप ही हर पल", "Aap hi prerna, aap hi har pal"] ] },
    { who: "Shriya", note: "pre-chorus", tune: "pre", lines: [
      ["आप ख़ुश हो तो, हम ख़ुश रह पाते", "Aap khush ho toh, hum khush reh paate"],
      ["आप ही हमारे, सब कुछ हो", "Aap hi hamaare, sab kuch ho"] ] },
    { who: "Leo & Shiro", note: "bridge, with a playful flute", tune: "bridge", lines: [
      ["दरवाज़े पे बैठे, राह तकें हर शाम", "Darwaaze pe baithe, raah takein har shaam"],
      ["दो नन्ही पूँछें, हिल हिल कहें तेरा नाम", "Do nanhi poonchhein, hil hil kahein tera naam"] ] },
    { who: "Everyone", note: "last chorus, a step higher", kind: "chorus", tune: "chorus", up: 2, lines: [
      ["तुम से ही घर, घर बनता है", "Tum se hi ghar, ghar banta hai"],
      ["तुम हँसो तो, ये घर हँसता है", "Tum hanso toh, ye ghar hansta hai"],
      ["तुम हमेशा स्वस्थ रहो, ख़ुश रहो", "Tum hamesha swasth raho, khush raho"],
      ["तुम्हारी ख़ुशी में, हमारी ख़ुशी है", "Tumhaari khushi mein, hamaari khushi hai"] ] },
    { who: "Everyone", note: "outro", kind: "spoken", tune: "outro", up: 2, lines: [
      ["चौवन दीये, एक ही दुआ", "Chauvan diye, ek hi dua"],
      ["लव यू सो मच, पापा… हैप्पी 54th बर्थडे!", "Love you so much, Papa… Happy 54th birthday!"] ] },
  ];

  const A = { ctx: null, out: null };
  const SB = 60 / 76, BAR = 4 * SB;
  const CHORD = { C: [36, [55, 60, 64]], Am: [45, [57, 60, 64]], F: [41, [57, 60, 65]], G: [43, [55, 59, 62]], Dm: [38, [57, 62, 65]], Em: [40, [55, 59, 64]] };
  const TUNE = {
    verse: { ch: [["C", "Am"], ["F", "G"], ["Am", "F"], ["G", "C"]], mel: [
      [[64, 1], [67, 1], [69, 1.5], [67, .5], [64, 1], [62, 1], [60, 2]],
      [[64, 1], [67, 1], [69, 1], [72, 1], [71, 1.5], [69, .5], [67, 2]],
      [[69, 1], [69, .5], [67, .5], [69, 1], [72, 1], [74, 1.5], [72, .5], [69, 2]],
      [[67, 1], [64, 1], [67, 1], [69, .5], [67, .5], [64, 1], [62, 1], [60, 2]] ] },
    pre: { ch: [["Dm", "F"], ["Am", "G"]], mel: [
      [[69, 1], [72, 1], [74, 1], [76, 1], [74, 1], [72, 1], [69, 2]],
      [[72, 1], [74, 1], [76, 1], [79, 1], [76, 1.5], [74, .5], [74, 2]] ] },
    chorus: { ch: [["C", "Am"], ["F", "G"], ["F", "C"], ["G", "C"]], pad: true, mel: [
      [[79, 1.5], [76, .5], [74, 1], [72, 1], [74, 1], [76, 1], [72, 2]],
      [[79, 1.5], [76, .5], [74, 1], [72, 1], [74, 1], [76, 1], [74, 2]],
      [[81, 1], [79, 1], [76, 1], [79, 1], [81, 1], [79, 1], [76, 2]],
      [[74, 1], [76, 1], [79, 1], [76, 1], [74, 1.5], [72, .5], [72, 2]] ] },
    bridge: { ch: [["F", "C"], ["F", "G"]], flute: true, mel: [
      [[76, .5], [79, .5], [81, 1], [79, .5], [76, .5], [74, 1], [76, 1], [79, 1], [76, 2]],
      [[74, .5], [76, .5], [79, 1], [76, .5], [74, .5], [72, 1], [74, 1], [76, 1], [74, 2]] ] },
    intro: { ch: [["C", "Am"], ["F", "G"]], soft: true },
    outro: { ch: [["F", "G"], ["C", "C"]], soft: true },
  };
  // Split a line's notes across its two bars.
  function lineBars(mel) {
    const bars = [[], []]; let t = 0;
    (mel || []).forEach(([m, d]) => { bars[t < 4 ? 0 : 1].push([m, t % 4, d]); t += d; });
    return bars;
  }
  // The whole song as a list of bars, each with its chord, melody, and the lyric line it carries.
  const SONG_BARS = (() => {
    const bars = [], ch = TUNE.chorus, vs = TUNE.verse;
    // a four-bar flute intro on the chorus hook
    [0, 1].forEach(l => lineBars(ch.mel[l]).forEach((mel, b) => bars.push({ chord: ch.ch[l][b], mel, lead: "flute", up: 0, soft: true })));
    SONG.forEach((v, si) => {
      const t = TUNE[v.tune];
      v.lines.forEach((_, li) => {
        const mb = lineBars(t.mel && t.mel[li]);
        [0, 1].forEach(b => bars.push({ chord: t.ch[li][b], mel: mb[b], lead: t.flute ? "flute" : "voice", up: v.up || 0, pad: t.pad, soft: t.soft, line: si + "-" + li }));
      });
      if (si === 3) lineBars(vs.mel[0]).forEach((mel, b) => bars.push({ chord: vs.ch[0][b], mel, lead: "flute", up: 0 })); // interlude
    });
    bars.push({ chord: "C", mel: [[74, 0, 4]], lead: "flute", up: 2, pad: true, end: true });
    return bars;
  })();
  const SONG_LEN = SONG_BARS.length * BAR + 3;
  var P = { on: false, bus: null, t0: 0, next: 0, iv: null, ui: null, noise: null, rev: null, line: "" };

  function songBus() {
    const c = A.ctx, bus = c.createGain(), comp = c.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 3;
    if (!P.rev) {
      P.rev = c.createConvolver();
      const len = c.sampleRate * 2.4, ir = c.createBuffer(2, len, c.sampleRate);
      for (let k = 0; k < 2; k++) { const d = ir.getChannelData(k); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
      P.rev.buffer = ir;
      const nb = c.createBuffer(1, c.sampleRate, c.sampleRate), nd = nb.getChannelData(0);
      for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
      P.noise = nb;
    }
    const wet = c.createGain(); wet.gain.value = .22;
    bus.connect(comp); bus.connect(wet); wet.connect(P.rev); P.rev.connect(comp); comp.connect(A.out);
    bus.gain.value = 0; bus.gain.setTargetAtTime(1, c.currentTime, .05);
    bus._parts = [comp, wet];
    return bus;
  }
  function env(g, t, peak, att, hold, rel) {
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + att);
    g.gain.setValueAtTime(peak, t + Math.max(att, hold)); g.gain.linearRampToValueAtTime(0, t + Math.max(att, hold) + rel);
  }
  function osc(type, f, t, end, dest, det = 0) {
    const o = A.ctx.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = det;
    o.connect(dest); o.start(t); o.stop(end); return o;
  }
  function vibrato(o, f, t, end, depth) {
    const l = A.ctx.createOscillator(), g = A.ctx.createGain();
    l.frequency.value = 5.4; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(f * depth, t + .35);
    l.connect(g); g.connect(o.frequency); l.start(t); l.stop(end);
  }
  // A humming "aah": two detuned saws through vowel formants.
  function sing(m, t, dur, loud) {
    const c = A.ctx, f = hz(m), end = t + dur + .4, g = c.createGain(), mix = c.createGain();
    [[800, 6, 1], [1150, 8, .6], [2900, 10, .18]].forEach(([fq, q, lv]) => {
      const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = fq; bp.Q.value = q;
      const lg = c.createGain(); lg.gain.value = lv * 2.4; mix.connect(bp); bp.connect(lg); lg.connect(g);
    });
    const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900; const lg = c.createGain(); lg.gain.value = .35;
    mix.connect(lp); lp.connect(lg); lg.connect(g);
    [-7, 7].forEach(d => vibrato(osc("sawtooth", f, t, end, mix, d), f, t + .15, end, .007));
    env(g, t, .16 * loud, .09, dur - .05, .3); g.connect(P.bus);
  }
  function flute(m, t, dur, loud) {
    const c = A.ctx, f = hz(m), end = t + dur + .4, g = c.createGain();
    vibrato(osc("sine", f, t, end, g), f, t + .2, end, .006);
    const o2g = c.createGain(); o2g.gain.value = .12; osc("triangle", f * 2, t, end, o2g); o2g.connect(g);
    const n = c.createBufferSource(); n.buffer = P.noise; const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = f * 2; bp.Q.value = 2;
    const ng = c.createGain(); env(ng, t, .03 * loud, .02, .05, .15); n.connect(bp); bp.connect(ng); ng.connect(P.bus); n.start(t); n.stop(t + .3);
    env(g, t, .13 * loud, .06, dur - .05, .25); g.connect(P.bus);
  }
  function keys(m, t, dur, peak) {
    const c = A.ctx, f = hz(m), g = c.createGain();
    osc("triangle", f, t, t + dur + 1, g); const g2 = c.createGain(); g2.gain.value = .5; osc("sine", f * 2, t, t + dur + 1, g2); g2.connect(g);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + .01); g.gain.exponentialRampToValueAtTime(peak * .03, t + dur + .8); g.gain.linearRampToValueAtTime(0, t + dur + .95);
    g.connect(P.bus);
  }
  function pad(notes, t, dur) {
    const c = A.ctx, g = c.createGain(), lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1100;
    notes.forEach(m => [-8, 8].forEach(d => osc("sawtooth", hz(m), t, t + dur + 1, lp, d)));
    lp.connect(g); env(g, t, .022, .6, dur - .3, .8); g.connect(P.bus);
  }
  function bass(m, t, dur) {
    const c = A.ctx, g = c.createGain(); osc("sine", hz(m), t, t + dur + .3, g); osc("triangle", hz(m), t, t + dur + .3, g);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.16, t + .015); g.gain.exponentialRampToValueAtTime(.02, t + dur); g.gain.linearRampToValueAtTime(0, t + dur + .2);
    g.connect(P.bus);
  }
  function drum(kind, t, loud) {
    const c = A.ctx, out = c.createGain(); out.gain.value = loud; out.connect(P.bus);
    if (kind === "dha" || kind === "ge") { // bayan: a low skin that bends down
      const o = c.createOscillator(), g = c.createGain(); o.type = "sine";
      o.frequency.setValueAtTime(kind === "dha" ? 120 : 100, t); o.frequency.exponentialRampToValueAtTime(62, t + .28);
      g.gain.setValueAtTime(.3, t); g.gain.exponentialRampToValueAtTime(.001, t + .42);
      o.connect(g); g.connect(out); o.start(t); o.stop(t + .45);
    }
    if (kind !== "ge") { // dayan: a ringing "na", or a crisp "ti"/"ka"
      const hi = kind === "ti" || kind === "ka", o = c.createOscillator(), g = c.createGain();
      o.type = "sine"; o.frequency.value = hi ? 880 : 620;
      g.gain.setValueAtTime(hi ? .05 : .12, t); g.gain.exponentialRampToValueAtTime(.001, t + (hi ? .08 : .22));
      o.connect(g); g.connect(out); o.start(t); o.stop(t + .3);
      const n = c.createBufferSource(), bp = c.createBiquadFilter(), ng = c.createGain();
      n.buffer = P.noise; bp.type = "bandpass"; bp.frequency.value = hi ? 4200 : 2600; bp.Q.value = 1.5;
      ng.gain.setValueAtTime(.06, t); ng.gain.exponentialRampToValueAtTime(.001, t + .05);
      n.connect(bp); bp.connect(ng); ng.connect(out); n.start(t); n.stop(t + .1);
    }
  }
  const KEHERWA = ["dha", "ge", "na", "ti", "na", "ka", "dhi", "na"];
  function scheduleBar(b, t) {
    const up = b.up, [root, tri] = CHORD[b.chord], tones = tri.map(m => m + up);
    if (b.end) {
      tones.concat(tones.map(m => m + 12)).forEach((m, i) => keys(m, t + i * .06, 3.2, .05));
      pad(tones, t, 4); bass(root + up, t, 3.5); drum("dha", t, 1);
      b.mel.forEach(([m, s, d]) => flute(m + up, t + s * SB, d * SB * 1.3, 1));
      return;
    }
    // piano: a gentle eighth-note arpeggio
    const arp = [tones[0], tones[1], tones[2], tones[1] + 12, tones[2], tones[1], tones[0] + 12, tones[1]];
    arp.forEach((m, i) => keys(m, t + i * SB / 2, SB * .9, b.soft ? .03 : .045));
    bass(root + up, t, SB * 1.6); bass(root + up + 7, t + 2 * SB, SB * 1.4);
    if (b.pad) pad(tones, t, BAR);
    KEHERWA.forEach((k, i) => drum(k === "dhi" ? "dha" : k, t + i * SB / 2, b.soft ? .5 : 1));
    (b.mel || []).forEach(([m, s, d]) => (b.lead === "flute" ? flute : sing)(m + up, t + s * SB, d * SB * .95, b.soft ? .8 : 1));
  }


(async () => {
  const sr = 44100;
  A.ctx = new OfflineAudioContext(2, Math.ceil(sr * SONG_LEN), sr); A.out = A.ctx.destination;
  P.bus = songBus();
  SONG_BARS.forEach((b, i) => scheduleBar(b, .1 + i * BAR));
  const buf = await A.ctx.startRendering();
  const L = buf.getChannelData(0), R = buf.getChannelData(1);
  let peak = 0; const seg = []; 
  for (let i = 0; i < L.length; i += sr * 10) { let s2 = 0, n = 0; for (let j = i; j < Math.min(L.length, i + sr * 10); j++) { s2 += L[j] * L[j]; n++; peak = Math.max(peak, Math.abs(L[j]), Math.abs(R[j])); } seg.push(Math.sqrt(s2 / n).toFixed(3)); }
  console.log("bars", SONG_BARS.length, "len", SONG_LEN.toFixed(1), "peak", peak.toFixed(3), "rms/10s", seg.join(" "));
  // 16-bit WAV
  const n = L.length, out = Buffer.alloc(44 + n * 4);
  out.write("RIFF", 0); out.writeUInt32LE(36 + n * 4, 4); out.write("WAVEfmt ", 8); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(2, 22);
  out.writeUInt32LE(sr, 24); out.writeUInt32LE(sr * 4, 28); out.writeUInt16LE(4, 32); out.writeUInt16LE(16, 34); out.write("data", 36); out.writeUInt32LE(n * 4, 40);
  const g = peak > .98 ? .98 / peak : 1;
  for (let i = 0; i < n; i++) { out.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(L[i] * g * 32767))), 44 + i * 4); out.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(R[i] * g * 32767))), 46 + i * 4); }
  fs.writeFileSync(process.argv[2], out);
})().catch(e => { console.error("ERR", e); process.exit(1); });
