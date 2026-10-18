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

export const plyr_options_without_sound = {
  ...plyr_options,
  controls: plyr_options.controls.filter(
    (c) => !["mute", "volume"].includes(c)
  ),
};
