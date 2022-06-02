// see https://github.com/michael-mml/electron-remote-web-app-wrapper/blob/99f939a40ea0d3c41d91f2349309d6b815f114b4/src/preload.ts
const { contextBridge, desktopCapturer, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  send: (channel, data) => {
    // whitelist channels
    let validChannels = ["toMain"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    let validChannels = ["fromMain"];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  desktopCapturer: async (options) => {
    const fn = "[desktopCapturer]";
    try {
      const sources = await desktopCapturer.getSources(options);

      return sources.map((el) => ({
        ...el,
        thumbnail: el.thumbnail.toDataURL(),
      }));
    } catch (err) {
      log.error(`${ns}${fn} error getting sources: ${err}`);
      throw err;
    }
  },
});
