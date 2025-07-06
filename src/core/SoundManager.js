export default class SoundManager {
    constructor(scene) {
        this.scene = scene;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.currentBgm = null;
    }
    playSe(key, config = {}) { this.scene.sound.play(key, config); }
    playBgm(key, volume = 0.5, fadeInTime = 0) {
        if (this.currentBgm && this.currentBgm.key === key) return;
        if (this.currentBgm) { this.stopBgm(); }
        this.currentBgm = this.scene.sound.add(key, { loop: true, volume: fadeInTime > 0 ? 0 : volume });
        this.currentBgm.play();
        if (fadeInTime > 0) { this.scene.tweens.add({ targets: this.currentBgm, volume: volume, duration: fadeInTime, ease: 'Linear' }); }
    }
    stopBgm(fadeOutTime = 0) {
        if (!this.currentBgm) return;
        if (fadeOutTime > 0) {
            this.scene.tweens.add({ targets: this.currentBgm, volume: 0, duration: fadeOutTime, ease: 'Linear', onComplete: () => { this.currentBgm.stop(); this.currentBgm = null; } });
        } else {
            this.currentBgm.stop();
            this.currentBgm = null;
        }
    }
    
    /**
     * 指定された波形の音を短時間だけ再生する (Web Audio APIを使用)
     * @param {string} waveType - 'sine', 'square', 'sawtooth', 'triangle' のいずれか
     * @param {number} frequency - 周波数 (Hz)。例: 440は「ラ」の音
     * @param {number} duration - 音の長さ（秒）
     */
    playSynth(waveType = 'square', frequency = 1200, duration = 0.05) {
        if (!this.audioContext) return;

        // 1. オシレーター（発振器）を作成。これが音の元になる。
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = waveType; // 波形を設定
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime); // 周波数（音の高さ）を設定

        // 2. ゲイン（音量）を制御するノードを作成
        const gainNode = this.audioContext.createGain();
        // 音がブツッと切れないように、最後に少しだけ音量を下げる
        gainNode.gain.setValueAtTime(1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

        // 3. オシレーターをゲインノードに、ゲインノードを最終出力（スピーカー）に接続
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // 4. 再生を開始し、指定時間後に停止する
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
}
