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
  const music = context.createGain();
  music.gain.value = 0;
  music.connect(output);

  const room = context.createConvolver(),
    wet = context.createGain();
  room.buffer = reverbBuffer(context);
  wet.gain.value = 0.3;
  room.connect(wet).connect(music);
  const timbre = context.createPeriodicWave(
    new Float32Array([0, 0, 0, 0]),
    new Float32Array([0, 1, 0.16, 0.035]),
  );
  const voices = new Set();
  let origin;
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
    voices.add(voice);
    voice.onended = () => {
      voices.delete(voice);
      voice.disconnect();
      envelope.disconnect();
    };
  }
  function schedule(until = context.currentTime + 1) {
    origin ??= context.currentTime + 0.08;
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
  function stop(when = context.currentTime) {
    for (const voice of voices) voice.stop(when);
    voices.clear();
    origin = undefined;
    chordIndex = 0;
  }
  return { output, music, schedule, stop };
}
