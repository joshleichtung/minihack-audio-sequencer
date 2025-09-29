// Instrument presets separated from factory for better organization

export const INSTRUMENT_PRESETS: Record<string, Record<string, Record<string, unknown>>> = {
  polySynth: {
    pad: {
      oscillatorType: 'sine',
      attack: 0.8,
      decay: 0.3,
      sustain: 0.8,
      release: 2.0,
      filterFrequency: 2000,
    },
    pluck: {
      oscillatorType: 'triangle',
      attack: 0.01,
      decay: 0.3,
      sustain: 0.1,
      release: 0.8,
      filterFrequency: 4000,
    },
    brass: {
      oscillatorType: 'sawtooth',
      attack: 0.1,
      decay: 0.2,
      sustain: 0.9,
      release: 0.3,
      filterFrequency: 1500,
    },
  },

  monoSynth: {
    bass: {
      oscillatorType: 'square',
      attack: 0.01,
      decay: 0.1,
      sustain: 0.8,
      release: 0.2,
      portamento: 0.02,
    },
    lead: {
      oscillatorType: 'sawtooth',
      attack: 0.01,
      decay: 0.05,
      sustain: 0.9,
      release: 0.1,
      portamento: 0,
    },
    wobble: {
      oscillatorType: 'square',
      attack: 0.01,
      decay: 0.3,
      sustain: 0.6,
      release: 0.1,
      portamento: 0.1,
    },
  },

  drumKit: {
    hiphop: {
      kitType: '808',
      kickTune: -2,
      snareTune: 0,
      hihatDecay: 0.05,
    },
    house: {
      kitType: '909',
      kickTune: 0,
      snareTune: 2,
      hihatDecay: 0.03,
    },
    acoustic: {
      kitType: 'acoustic',
      kickTune: 0,
      snareTune: 0,
      hihatDecay: 0.1,
    },
  },
}
