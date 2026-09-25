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
      console.log(`${fn} Getting desktop sources with options:`, options);
      const sources = await desktopCapturer.getSources(options);
      console.log(`${fn} Found ${sources.length} sources`);

      const processedSources = sources.map((el) => ({
        ...el,
        thumbnail: el.thumbnail.toDataURL(),
      }));

      console.log(
        `${fn} Processed sources:`,
        processedSources.map((s) => ({ id: s.id, name: s.name }))
      );
      return processedSources;
    } catch (err) {
      console.error(`${fn} error getting sources: ${err}`);
      throw err;
    }
  },
});
