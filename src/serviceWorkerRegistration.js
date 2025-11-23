
export function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    const publicUrl = new URL(import.meta.env.BASE_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `/serviceWorker.js`; // This should be compiled to root dist in real build

      // For dev environment simulation or simplified setup without specific build config for SW
      // we might skip actual registration or use a mock if SW file isn't in public root.
      // Assuming user puts serviceWorker.js content into public/sw.js manually or build tool handles it.
      // Here we just register it.
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
