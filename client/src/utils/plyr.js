export const plyr_options = {
  controls: [
    "play-large",
    "play",
    "progress",
    "current-time",
    "mute",
    "volume",
    "fullscreen",
  ],
  iconUrl: "",
};

// for videos detected as silent: start muted but keep the mute button,
// in case detection was wrong
export const plyr_options_muted = {
  ...plyr_options,
  controls: plyr_options.controls.filter((c) => c !== "volume"),
  muted: true,
  // the stored muted state would override `muted` and leak to other videos
  storage: { enabled: false },
};
