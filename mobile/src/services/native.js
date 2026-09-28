// Mobile Native Bridge with Web / Capacitor compatibility

export const NativeService = {
  // Haptic Feedback
  async triggerHaptic(type = "medium") {
    try {
      if (window?.Capacitor?.Plugins?.Haptics) {
        const Haptics = window.Capacitor.Plugins.Haptics;
        if (type === "heavy" || type === "error") {
          await Haptics.impact({ style: "HEAVY" });
        } else if (type === "light") {
          await Haptics.impact({ style: "LIGHT" });
        } else {
          await Haptics.impact({ style: "MEDIUM" });
        }
        return;
      }
    } catch (e) {}

    // Web vibration fallback
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      if (type === "heavy" || type === "error") navigator.vibrate([100, 50, 100]);
      else if (type === "warning") navigator.vibrate([80, 40, 80]);
      else navigator.vibrate(40);
    }
  },

  // Geolocation
  async getCurrentPosition() {
    try {
      if (window?.Capacitor?.Plugins?.Geolocation) {
        const pos = await window.Capacitor.Plugins.Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });
        return {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          speed: pos.coords.speed || 38,
          heading: pos.coords.heading || 45,
          accuracy: pos.coords.accuracy || 10,
        };
      }
    } catch (e) {}

    // Browser Geolocation fallback
    return new Promise((resolve) => {
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              speed: pos.coords.speed || 38,
              heading: pos.coords.heading || 45,
              accuracy: pos.coords.accuracy || 10,
            });
          },
          () => {
            resolve({
              latitude: 40.758,
              longitude: -73.9855,
              speed: 38,
              heading: 45,
              accuracy: 10,
            });
          },
          { timeout: 5000 }
        );
      } else {
        resolve({
          latitude: 40.758,
          longitude: -73.9855,
          speed: 38,
          heading: 45,
          accuracy: 10,
        });
      }
    });
  },

  // Capture Photo
  async capturePhoto() {
    try {
      if (window?.Capacitor?.Plugins?.Camera) {
        const image = await window.Capacitor.Plugins.Camera.getPhoto({
          quality: 80,
          allowEditing: false,
          resultType: "dataUrl",
          source: "PROMPT",
        });
        return image.dataUrl;
      }
    } catch (e) {}
    return null;
  },

  // Status Bar
  async setDarkStatusBar() {
    try {
      if (window?.Capacitor?.Plugins?.StatusBar) {
        await window.Capacitor.Plugins.StatusBar.setStyle({ style: "DARK" });
        await window.Capacitor.Plugins.StatusBar.setBackgroundColor({ color: "#070714" });
      }
    } catch (e) {}
  },
};
