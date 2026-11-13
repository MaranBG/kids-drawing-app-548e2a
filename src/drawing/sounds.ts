/** Tiny, gentle sound effects made with the Web Audio API (no audio files). */

let audioCtx: AudioContext | null = null

function getCtx() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!Ctor) return null
    audioCtx = new Ctor()
  }
  if (audioCtx.state === 'suspended') void audioCtx.resume()
  return audioCtx
}

function tone(freq: number, endFreq: number, duration: number, volume = 0.15) {
  const ctx = getCtx()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration)
  gain.gain.setValueAtTime(volume, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  osc.connect(gain).connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + duration)
}

export const sounds = {
  pop: () => tone(520, 900, 0.12),
  tap: () => tone(700, 500, 0.06, 0.08),
  fill: () => tone(300, 700, 0.22, 0.12),
  undo: () => tone(600, 300, 0.12, 0.1),
  shutter: () => {
    const ctx = getCtx()
    if (!ctx) return
    const length = Math.floor(ctx.sampleRate * 0.12)
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const channel = buffer.getChannelData(0)
    for (let i = 0; i < length; i++) {
      channel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3)
    }
    const src = ctx.createBufferSource()
    const gain = ctx.createGain()
    gain.gain.value = 0.25
    src.buffer = buffer
    src.connect(gain).connect(ctx.destination)
    src.start()
    setTimeout(() => tone(900, 1400, 0.15, 0.1), 120)
  },
}
