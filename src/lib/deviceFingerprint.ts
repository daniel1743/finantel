// ============================================================================
// DEVICE FINGERPRINT COLLECTOR
// ============================================================================
// Recolecta información del dispositivo para crear un fingerprint único
// ============================================================================

interface DeviceFingerprint {
  browser: string;
  userAgent: string;
  resolution: string;
  timezone: string;
  platform: string;
  language: string;
  webgl: string;
  screen: {
    width: number;
    height: number;
    colorDepth: number;
  };
  hardware: {
    cores: number;
    memory?: number;
  };
  canvas?: string;
  audio?: string;
}

/**
 * Obtiene el hash WebGL del dispositivo
 */
function getWebGLHash(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      return 'no-webgl';
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      return `${vendor}-${renderer}`;
    }

    return 'webgl-available';
  } catch (e) {
    return 'webgl-error';
  }
}

/**
 * Obtiene el hash del canvas (fingerprint adicional)
 */
function getCanvasHash(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return 'no-canvas';
    }

    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Device fingerprint', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Device fingerprint', 4, 17);

    return canvas.toDataURL().slice(-50); // Últimos 50 caracteres
  } catch (e) {
    return 'canvas-error';
  }
}

/**
 * Obtiene el hash de audio (fingerprint adicional)
 */
function getAudioHash(): string {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const analyser = audioContext.createAnalyser();
    const gainNode = audioContext.createGain();
    const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

    gainNode.gain.value = 0;
    oscillator.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'triangle';
    oscillator.start(0);

    let hash = 'audio-available';
    scriptProcessor.onaudioprocess = (event) => {
      const inputBuffer = event.inputBuffer;
      const inputData = inputBuffer.getChannelData(0);
      hash = inputData.slice(0, 10).join('-');
    };

    oscillator.stop();
    audioContext.close();
    return hash;
  } catch (e) {
    return 'audio-error';
  }
}

/**
 * Recolecta el fingerprint completo del dispositivo
 */
export async function collectDeviceFingerprint(): Promise<DeviceFingerprint> {
  const fingerprint: DeviceFingerprint = {
    browser: getBrowser(),
    userAgent: navigator.userAgent,
    resolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platform: navigator.platform,
    language: navigator.language,
    webgl: getWebGLHash(),
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      colorDepth: window.screen.colorDepth,
    },
    hardware: {
      cores: navigator.hardwareConcurrency || 0,
      memory: (navigator as any).deviceMemory || undefined,
    },
  };

  // Agregar canvas hash (puede ser lento, hacerlo opcional)
  try {
    fingerprint.canvas = getCanvasHash();
  } catch (e) {
    fingerprint.canvas = 'error';
  }

  // Agregar audio hash (puede ser lento, hacerlo opcional)
  try {
    fingerprint.audio = getAudioHash();
  } catch (e) {
    fingerprint.audio = 'error';
  }

  return fingerprint;
}

/**
 * Detecta el navegador
 */
function getBrowser(): string {
  const ua = navigator.userAgent;
  
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  
  return 'Unknown';
}

/**
 * Verifica el riesgo de IP antes del registro
 */
export async function checkIPRisk(
  supabase: any,
  email?: string
): Promise<{
  allowed: boolean;
  risk_level: string;
  risk_score: number;
  reason: string;
  requires_verification: boolean;
  action_taken: string;
}> {
  try {
    // Recolectar fingerprint
    const fingerprint = await collectDeviceFingerprint();

    // Llamar a la Edge Function
    const { data, error } = await supabase.functions.invoke('check-ip-risk', {
      body: {
        device_fingerprint: fingerprint,
        email: email,
      },
    });

    if (error) {
      console.error('Error al verificar riesgo de IP:', error);
      // En caso de error, permitir registro pero con verificación requerida
      return {
        allowed: true,
        risk_level: 'unknown',
        risk_score: 0,
        reason: 'Error al verificar riesgo',
        requires_verification: true,
        action_taken: 'verification_required',
      };
    }

    return {
      allowed: data.allowed || false,
      risk_level: data.risk_level || 'normal',
      risk_score: data.risk_score || 0,
      reason: data.reason || '',
      requires_verification: data.requires_verification || false,
      action_taken: data.action_taken || 'allowed',
      event_id: data.event_id,
      ip_address: data.ip_address,
      device_fingerprint: data.stats?.fingerprint_hash,
    };
  } catch (error) {
    console.error('Error al recolectar fingerprint:', error);
    // En caso de error, permitir registro pero con verificación requerida
    return {
      allowed: true,
      risk_level: 'unknown',
      risk_score: 0,
      reason: 'Error al recolectar fingerprint',
      requires_verification: true,
      action_taken: 'verification_required',
    };
  }
}

/**
 * Hook para usar en componentes React
 */
export function useDeviceFingerprint() {
  return {
    collect: collectDeviceFingerprint,
    checkRisk: checkIPRisk,
  };
}

