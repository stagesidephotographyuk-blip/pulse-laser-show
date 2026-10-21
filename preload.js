const { desktopCapturer } = require('electron');

async function getAudioStream() {
  const args = process.argv;
  const audioArg = args.find(a => a.startsWith('--audioSource='));
  const audioSourceId = audioArg ? audioArg.split('=')[1] : null;

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: audioSourceId
      }
    },
    video: false
  });

  return stream;
}

async function setupAudio() {
  const stream = await getAudioStream();
  const audioCtx = new AudioContext();
  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();

  analyser.fftSize = 256;
  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  source.connect(analyser);

  function update() {
    analyser.getByteFrequencyData(dataArray);
    window.audioLevels = dataArray;
    requestAnimationFrame(update);
  }

  update();
}

window.addEventListener('DOMContentLoaded', () => {
  setupAudio();
});
