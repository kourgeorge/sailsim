// Short cached samples keep horn timing independent of graphics frame rate.
// The large ship has a low two-tone voice; small boats use brighter reeds.
export function hornSamples(voice, signal, sampleRate) {
  const ship = voice === 'ship';
  const blast = signal === 'warning' ? 1 : ship ? 1.2 : 0.45;
  const gap = 0.22,
    count = signal === 'warning' ? 5 : 1;
  const data = new Float32Array(Math.ceil((count * (blast + gap) + 0.15) * sampleRate));
  const frequency = ship ? 82 : 330;
  for (let index = 0; index < data.length; index++) {
    const time = index / sampleRate,
      part = time % (blast + gap);
    if (Math.floor(time / (blast + gap)) >= count || part > blast) continue;
    const envelope = Math.min(1, part / 0.045) * Math.min(1, (blast - part) / 0.09);
    const phase = Math.PI * 2 * frequency * time;
    data[index] =
      envelope *
      (Math.sin(phase) * 0.47 +
        Math.sin(phase * (ship ? 1.5 : 1.24)) * 0.23 +
        Math.sin(phase * 2) * 0.12 +
        Math.sin(phase * 3) * 0.05);
  }
  return data;
}

export function createHornPlayer(context, output) {
  const cache = new Map(),
    active = new Map();
  return {
    play(event, volume) {
      const key = `${event.voice}:${event.signal}`;
      if (!cache.has(key)) {
        const samples = hornSamples(event.voice, event.signal, context.sampleRate);
        const buffer = context.createBuffer(1, samples.length, context.sampleRate);
        buffer.copyToChannel(samples, 0);
        cache.set(key, buffer);
      }
      const source = context.createBufferSource(),
        gain = context.createGain();
      const pan = context.createStereoPanner?.();
      source.buffer = cache.get(key);
      gain.gain.value = volume * event.gain * 0.65;
      source.connect(gain);
      if (pan) {
        pan.pan.value = event.pan;
        gain.connect(pan);
        pan.connect(output);
      } else gain.connect(output);
      source.onended = () => {
        source.disconnect();
        gain.disconnect();
        pan?.disconnect();
        active.delete(source);
      };
      active.set(source, { gain, attenuation: event.gain * 0.65 });
      source.start();
    },
    setVolume(volume) {
      for (const { gain, attenuation } of active.values()) {
        gain.gain.setTargetAtTime(volume * attenuation, context.currentTime, 0.03);
      }
    },
    stop() {
      for (const source of active.keys()) source.stop();
      active.clear();
    },
  };
}
