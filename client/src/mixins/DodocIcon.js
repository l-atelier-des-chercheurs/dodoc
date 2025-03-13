export default {
  computed: {
    dodoc_icon_capture() {
      return `
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 168 168" style="enable-background:new 0 0 168 168;" xml:space="preserve">
          <path style="fill:var(--c-orange);" d="M84,0C37.6,0,0,37.6,0,84c0,46.4,37.6,84,84,84c46.4,0,84-37.6,84-84
            C168,37.6,130.4,0,84,0z"/>
          <path style="fill:var(--c-rouge);" d="M84,41.3c-23.6,0-42.7,19.1-42.7,42.7c0,23.6,19.1,42.7,42.7,42.7
            c23.6,0,42.7-19.1,42.7-42.7C126.7,60.4,107.6,41.3,84,41.3z"/>
        </svg>
      `;
    },
    dodoc_icon_collect() {
      return `
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
       viewBox="0 0 168 168" style="enable-background:new 0 0 168 168;" xml:space="preserve">
            <path style="fill:var(--c-rouge);" d="M84,0C37.6,0,0,37.6,0,84c0,46.4,37.6,84,84,84c46.4,0,84-37.6,84-84 C168,37.6,130.4,0,84,0z"/>
            <path style="fill:var(--c-orange);" d="m42 42h21.6v21h-21.6z"/>
            <path style="fill:var(--c-orange);" d="m73.2 42h21.6v21h-21.6z"/>
            <path style="fill:var(--c-orange);" d="m104.4 42h21.6v21h-21.6z"/>
            <path style="fill:var(--c-orange);" d="m42 73.5h21.6v21h-21.6z"/>
            <path style="fill:var(--c-orange);" d="m73.2 73.5h21.6v21h-21.6z"/>
            <path style="fill:var(--c-orange);" d="m104.4 73.5h21.6v21h-21.6z"/>
            <path style="fill:var(--c-orange);" d="m42 105h21.6v21h-21.6z"/>
            <path style="fill:var(--c-orange);" d="m73.2 105h21.6v21h-21.6z"/>
            <path style="fill:var(--c-orange);" d="m104.4 105h21.6v21h-21.6z"/>
          </svg>
        `;
    },
    dodoc_icon_make() {
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 168">
          <circle cx="84.13" cy="84" r="84" style="fill: var(--c-bleuvert)"/>
          <path d="M115.33,27.75A4.07,4.07,0,0,1,118,25.89a4.44,4.44,0,0,1,3.48.67,4.51,4.51,0,0,1,2,3,4.13,4.13,0,0,1-.7,3.17l-10.6,14.72h-8.91ZM90.85,28.89A5.87,5.87,0,1,1,85,34.76,5.87,5.87,0,0,1,90.85,28.89Zm-21.39-10a8.53,8.53,0,1,1-8.53,8.53A8.54,8.54,0,0,1,69.46,18.92ZM45.51,50.58h77v8.78h-77ZM49.35,67.3h69.3c9.74,8.63,15.1,20.17,15.1,32.56a42.54,42.54,0,0,1-9.38,26.47L119.63,121l-4.41-5-4.41,5-6.35,7.18L98.11,121l-4.41-5-4.41,5-6.35,7.18L76.59,121l-4.41-5-4.41,5-6.35,7.18L55.07,121l-4.41-5-4.41,5-3.6,4.08a42.38,42.38,0,0,1-8.4-25.2C34.26,87.47,39.61,75.93,49.35,67.3ZM35.24,136.49h5.15l10.28-11.63L61.42,137l10.76-12.17L82.94,137,93.7,124.86,104.46,137l10.75-12.17,10.28,11.63h5.15v8.59H35.24Z" 
            style="fill: var(--c-bleumarine)"/>
        </svg>
      `;
    },
    dodoc_icon_publish() {
      return `
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 168">
          <circle cx="84" cy="84" r="84" style="fill: var(--c-bleumarine)"/>
          <path d="M129.4,143.86H38.62V25.42H129.4Z" style="fill: var(--c-bleuvert)"/>
          <rect x="53.82" y="39.01" width="26.85" height="10.37" style="fill: var(--c-bleumarine)"/>
          <rect x="53.82" y="54.17" width="26.84" height="9.53" style="fill: var(--c-bleumarine)"/>
          <rect x="87.34" y="39.01" width="26.85" height="24.68" style="fill: var(--c-bleumarine)"/>
          <rect x="53.76" y="71.22" width="60.49" height="29.07" style="fill: var(--c-bleumarine)"/>
          <rect x="53.76" y="105.8" width="26.85" height="23.66" style="fill: var(--c-bleumarine)"/>
          <rect x="87.35" y="105.8" width="26.85" height="23.66" style="fill: var(--c-bleumarine)"/>
        </svg>
      `;
    },
  },
};
