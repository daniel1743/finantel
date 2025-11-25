/**
 * Utilidades para efectos de audio
 * Genera sonidos usando Web Audio API (no requiere archivos externos)
 */

/**
 * Reproduce un sonido de "beep" corto y agradable
 * Estilo "activación" como los asistentes de voz
 */
export const playStartRecordingSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Crear oscilador (generador de tono)
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Conectar: Oscilador → Ganancia → Salida
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configurar sonido: tono ascendente rápido
    oscillator.type = 'sine'; // Onda suave
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime); // Frecuencia inicial (400 Hz)
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1); // Sube a 800 Hz

    // Volumen: fade in/out para suavizar
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.02); // Fade in
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15); // Fade out

    // Reproducir durante 150ms
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);

    // Limpiar después
    oscillator.onended = () => {
      audioContext.close();
    };
  } catch (error) {
    console.warn('No se pudo reproducir el sonido de inicio:', error);
  }
};

/**
 * Reproduce un sonido de "confirmación" al detener
 * Tono descendente suave
 */
export const playStopRecordingSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Tono descendente
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.12);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.12);

    oscillator.onended = () => {
      audioContext.close();
    };
  } catch (error) {
    console.warn('No se pudo reproducir el sonido de detención:', error);
  }
};

/**
 * Reproduce un sonido de "éxito" al completar
 * Doble tono alegre
 */
export const playSuccessSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Primera nota
    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    osc1.connect(gain1);
    gain1.connect(audioContext.destination);

    osc1.type = 'sine';
    osc1.frequency.value = 523; // Do (C5)

    gain1.gain.setValueAtTime(0, audioContext.currentTime);
    gain1.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
    gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

    osc1.start(audioContext.currentTime);
    osc1.stop(audioContext.currentTime + 0.15);

    // Segunda nota (un poco después)
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.connect(gain2);
    gain2.connect(audioContext.destination);

    osc2.type = 'sine';
    osc2.frequency.value = 659; // Mi (E5)

    gain2.gain.setValueAtTime(0, audioContext.currentTime + 0.08);
    gain2.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.23);

    osc2.start(audioContext.currentTime + 0.08);
    osc2.stop(audioContext.currentTime + 0.23);

    // Limpiar
    setTimeout(() => {
      audioContext.close();
    }, 300);
  } catch (error) {
    console.warn('No se pudo reproducir el sonido de éxito:', error);
  }
};

/**
 * Reproduce un sonido de "error" suave
 * Tono bajo y corto
 */
export const playErrorSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Tono bajo constante
    oscillator.type = 'sine';
    oscillator.frequency.value = 200;

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);

    oscillator.onended = () => {
      audioContext.close();
    };
  } catch (error) {
    console.warn('No se pudo reproducir el sonido de error:', error);
  }
};
