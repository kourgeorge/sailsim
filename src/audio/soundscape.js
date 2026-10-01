// Original, gently evolving ambience. Native audio nodes keep it independent of
// rendering frame rate, network availability, and third-party recordings.
const CHORD_SECONDS = 20;
const CHORDS = [
  [50, 57, 61, 64, 66], // D major 9
  [45, 52, 59, 61, 64], // A add 9
  [47, 54, 57, 62, 66], // B minor 7
  [43, 50, 57, 59, 66], // G major 9
];

function random(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function seaBuffer(context) {
  const buffer = context.createBuffer(2, context.sampleRate * 24, context.sampleRate);
  const next = random(7319);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let low = 0,
      mid = 0,
      high = 0;
    for (let i = 0; i < data.length; i++) {
      const white = next() * 2 - 1;
      low = 0.99765 * low + white * 0.099046;
      mid = 0.963 * mid + white * 0.2965164;
      high = 0.57 * high + white * 1.0526913;
      // A short taper removes clicks at the loop seam.
      const taper = Math.min(1, i / 2048, (data.length - 1 - i) / 2048);
      data[i] = (low + mid + high + white * 0.1848) * 0.12 * taper;
    }
  }
  return buffer;
}

function reverbBuffer(context) {
  const buffer = context.createBuffer(2, context.sampleRate * 3.5, context.sampleRate);
  const next = random(281);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < data.length; i++) {
      data[i] = (next() * 2 - 1) * Math.pow(1 - i / data.length, 3);
    }
  }
  return buffer;
}

export function createSoundscape(context) {
  const output = context.createGain();
  output.gain.value = 0;
  output.connect(context.destination);
  const music = context.createGain(),
    sea = context.createGain();
  music.gain.value = 0;
  sea.gain.value = 0;
  music.connect(output);
  sea.connect(output);

  const wash = context.createBufferSource();
  wash.buffer = seaBuffer(context);
  wash.loop = true;
  const rumbleCut = context.createBiquadFilter();
  rumbleCut.type = 'highpass';
  rumbleCut.frequency.value = 90;
  const softness = context.createBiquadFilter();
  softness.type = 'lowpass';
  softness.frequency.value = 1100;
  softness.Q.value = 0.35;
  const swell = context.createGain();
  swell.gain.value = 0.65;
  wash.connect(rumbleCut).connect(softness).connect(swell).connect(sea);
  // Different swell periods make the sea breathe without a mechanical beat.
  for (const [period, depth] of [
    [13.7, 0.28],
    [19.3, 0.1],
  ]) {
    const wave = context.createOscillator(),
      amount = context.createGain();
    wave.frequency.value = 1 / period;
    amount.gain.value = depth;
    wave.connect(amount).connect(swell.gain);
    wave.start();
  }
  const surf = context.createOscillator(),
    brightness = context.createGain();
  surf.frequency.value = 1 / 13.7;
  brightness.gain.value = 650;
  surf.connect(brightness).connect(softness.frequency);
  surf.start();
  wash.start();

  const room = context.createConvolver(),
    wet = context.createGain();
  room.buffer = reverbBuffer(context);
  wet.gain.value = 0.3;
  room.connect(wet).connect(music);
  const timbre = context.createPeriodicWave(
    new Float32Array([0, 0, 0, 0]),
    new Float32Array([0, 1, 0.16, 0.035]),
  );
  const origin = context.currentTime + 0.08;
  let chordIndex = 0;
  function note(midi, when, duration, level, attack, detune = 0) {
    const voice = context.createOscillator(),
      envelope = context.createGain();
    voice.setPeriodicWave(timbre);
    voice.frequency.value = 440 * 2 ** ((midi - 69) / 12);
    voice.detune.value = detune;
    envelope.gain.setValueAtTime(0, when);
    envelope.gain.linearRampToValueAtTime(level, when + attack);
    if (duration > 20) envelope.gain.linearRampToValueAtTime(level * 0.8, when + duration - 7);
    envelope.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    envelope.gain.linearRampToValueAtTime(0, when + duration + 0.1);
    voice.connect(envelope);
    envelope.connect(music);
    envelope.connect(room);
    voice.start(when);
    voice.stop(when + duration + 0.15);
    voice.onended = () => {
      voice.disconnect();
      envelope.disconnect();
    };
  }
  function schedule(until = context.currentTime + 1) {
    while (origin + chordIndex * CHORD_SECONDS < until) {
      const when = origin + chordIndex * CHORD_SECONDS;
      const chord = CHORDS[chordIndex % CHORDS.length];
      chord.forEach((pitch, i) => note(pitch, when, 24, 0.085, 4.5, i % 2 ? 2 : -2));
      // Sparse upper notes, without percussion or abrupt attacks.
      [2, 4, 3, 1].forEach((index, i) =>
        note(chord[index] + 12, when + 2.5 + i * 4.6, 6, 0.055, 0.18),
      );
      chordIndex++;
    }
  }
  return { output, music, sea, schedule };
}
