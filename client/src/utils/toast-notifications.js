import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import "./toast-notifications.scss";

function createAlertifyCompat(Vue) {
  return {
    delay: (time) => ({
      error: (message) => Vue.prototype.$toast.error(message, { timeout: time }),
      success: (message) =>
        Vue.prototype.$toast.success(message, { timeout: time }),
      log: (message) => Vue.prototype.$toast.info(message, { timeout: time }),
    }),
    closeLogOnClick: (enabled) => ({
      delay: (time) => ({
        error: (message) =>
          Vue.prototype.$toast.error(message, {
            timeout: time,
            closeOnClick: enabled,
          }),
        success: (message) =>
          Vue.prototype.$toast.success(message, {
            timeout: time,
            closeOnClick: enabled,
          }),
        log: (message) =>
          Vue.prototype.$toast.info(message, {
            timeout: time,
            closeOnClick: enabled,
          }),
      }),
      error: (message) =>
        Vue.prototype.$toast.error(message, { closeOnClick: enabled }),
      success: (message) =>
        Vue.prototype.$toast.success(message, { closeOnClick: enabled }),
      log: (message) =>
        Vue.prototype.$toast.info(message, { closeOnClick: enabled }),
    }),
    error: (message) => Vue.prototype.$toast.error(message),
    success: (message) => Vue.prototype.$toast.success(message),
    log: (message) => Vue.prototype.$toast.info(message),
  };
}

export function init_toast_notifications(Vue) {
  Vue.use(Toast, {
    position: "bottom-left",
    timeout: 4000,
    closeOnClick: true,
    pauseOnFocusLoss: false,
    closeButton: "button",
    transition: "Vue-Toastification__fade",
    maxToasts: 12,
  });

  Vue.prototype.$alertify = createAlertifyCompat(Vue);
}
