<template>
  <div>
    <VueEditor 
      v-model="htmlForEditor"
      class="mediaTextContent"
      ref="textField"
      autocorrect="off"
      :editorToolbar="customToolbar"
      autofocus
      @text-change="textChange"
    />
  </div>
</template>
<script>
import { VueEditor } from 'vue2-editor';
import ReconnectingWebSocket from 'reconnectingwebsocket'
import sharedb from 'sharedb/lib/client'
import richText from 'rich-text'
sharedb.types.register(richText.type)

export default {
  props: {
    value: {
      type: String,
      default: '…'
    },
  },
  components: {
    VueEditor
  },
  data() {
    return {
      customToolbar: [
        [{ 'header': [false, 1, 2, 3, 4] }],
        // [{ 'header': 1 }, { 'header': 2 }, { 'header': 3 }, { 'header': 4 }],
        ['bold', 'italic', 'underline', 'link', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet'} ],
        ['clean']  
      ],
      htmlForEditor: this.value
    }
  },
  
  created() {
  },
  mounted() {
    // Update the range in other editors when the selection changes
    // ed.on('cursorActivity', e => {

    //     const stPos = ed.getCursor('start')
    //     const edPos = ed.getCursor('end')
    //     const hdPos = ed.getCursor('head')

    //     const stindex = ed.indexFromPos(stPos)
    //     const edindex = ed.indexFromPos(edPos)
    //     const hdindex = ed.indexFromPos(hdPos)
    //     const prefixed = hdindex === stindex && stindex !== edindex

    //     io.emit('anchor-update', { stindex, edindex, prefixed })
    // })
    const socket = new ReconnectingWebSocket(
      `ws://${window.location.hostname}:8079`
    );
    const connection = new sharedb.Connection(socket);
    connection.on('state', (state, reason) => {
      var indicatorColor;

      console.log(
        '[sharedb] New connection state: ' + state + ' Reason: ' + reason
      );

      // sharedbSocketStateEl.innerHTML = state.toString();
      switch (state.toString()) {
        case 'connecting':
          indicatorColor = 'silver';
          break;
        case 'connected':
          indicatorColor = 'lime';
          break;
        case 'disconnected':
        case 'closed':
        case 'stopped':
          indicatorColor = 'red';
          break;
      }
      // sharedbSocketIndicatorEl.style.backgroundColor = indicatorColor;
    });

    const docMatches = window.location.href.match(/\?doc=([a-zA-Z1-9]+)/);

    // sharedoc
    const doc = connection.get('docs', docMatches ? docMatches[1] : 'default');

    var textField = this.$refs.textField;

    // Create local Doc instance mapped to 'examples' collection document with id 'richtext'
    // var doc = connection.get('examples', 'richtext');
    this.$nextTick(() => {
      doc.subscribe((err) => {
        if (err) throw err;

        if(!textField || !textField.hasOwnProperty('quill')) return;

        let quill = textField.quill;

        quill.setContents(doc.data);
        quill.on('text-change', (delta, oldDelta, source) => {
          if (source !== 'user') return;
          doc.submitOp(delta, { source: quill });
        });
        doc.on('op', (op, source) => {
          if (source === quill) return;
          // quill.updateContents(op);
          quill.updateContents(op);
        });
      });
    });

    // // ShareDB-Independent update events
    const addName = (id, name) => {
      const userslist = document.querySelector('#users');
      const usericon = document.createElement('li');
      usericon.classList.add(`u-${id}`);
      usericon.innerHTML = name;
      userslist.appendChild(usericon);

      const color = idToColor(id);
      const styleTag = document.createElement('style');
      styleTag.id = `style-${id}`;
      styleTag.innerHTML = `
            .u-${id} { background-color: ${color}; }
            .CodeMirror-line .u-${id}                   { background-color: ${hexToRgbaStyle(
        color,
        0.35
      )}; }
            .CodeMirror-line .u-${id}.cursor            { opacity: 1; }
            .CodeMirror-line .u-${id}.cursor.left       { border-left: 2px solid ${color}; }
            .CodeMirror-line .u-${id}.cursor.right      { border-right: 2px solid ${color}; }
            .CodeMirror-line .u-${id}.empty             { background-color: transparent; }

        `;
      document.querySelector('head').appendChild(styleTag);
    };

    const anchorMap = {};
    const setAnchor = (id, anchor) => {
      if (id in anchorMap) {
        anchorMap[id].forEach(m => m.clear());
        delete anchorMap[id];
      }

      // Whether or not the cursor is actually at the beginning
      // or end of the selection
      let emptyClass = '';
      let stindex = anchor.stindex;
      const edindex = anchor.edindex;

      // Add selection
      let stPos, edPos, range;
      anchorMap[id] = [];

      if (stindex !== edindex) {
        stPos = ed.posFromIndex(stindex);
        edPos = ed.posFromIndex(edindex);

        anchorMap[id].push(ed.markText(stPos, edPos, { className: `u-${id}` }));
      }

      if (stindex === edindex) {
        stindex = Math.max(0, stindex - 1);
        emptyClass = 'empty';
      }

      // Add cursor
      const index = anchor.prefixed ? stindex : edindex;
      stPos = ed.posFromIndex(index + (anchor.prefixed ? 0 : -1));
      edPos = ed.posFromIndex(index + (anchor.prefixed ? 1 : 0));

      anchorMap[id].push(
        ed.markText(stPos, edPos, {
          className: `u-${id} ${emptyClass} cursor ${
            anchor.prefixed ? 'left' : 'right'
          }`
        })
      );
    };

    const removeId = id => {
      document.querySelector(`#users li.u-${id}`).remove();
      document.querySelector(`#style-${id}`).remove();
      if (id in anchorMap) {
        anchorMap[id].forEach(m => m.clear());
        delete anchorMap[id];
      }
    };

    const idToColor = id => {
      let total = 0;
      for (let c of id) total += c.charCodeAt(0);

      let hex = total.toString(16);
      while (hex.length < 3) hex += hex[hex.length - 1];
      hex = hex.substr(0, 3);

      let color = '#';
      for (let c of hex) color += `${c}0`;

      return color;
    };

    const hexToRgbaStyle = (hex, opacity) => {
      hex = hex.replace('#', '');
      let r, g, b, den;
      if (hex.length === 3) {
        r = hex[0] + hex[0];
        g = hex[1] + hex[1];
        b = hex[2] + hex[2];
      } else {
        r = hex.substr(0, 2);
        g = hex.substr(2, 2);
        b = hex.substr(4, 2);
      }

      r = parseInt(r, 16);
      g = parseInt(g, 16);
      b = parseInt(b, 16);

      return `rgba(${r},${g},${b},${opacity})`;
    };

    const clearAll = () => {
      for (let key in anchorMap) removeId(key);
    };

    // Websocket Initialization
    // io = io();
    // io.on('connect', () => {
    //   io.on('disconnect', () => clearAll());

    //   io.once('initialize', e => {
    //     // for (let id in e.anchors) io.id !== id && setAnchor(id, e.anchors[id]);
    //     for (let id in e.names) io.id !== id && addName(id, e.names[id]);
    //   });
    //   io.on('anchor-update', e => {
    //     if (io.id === e.id) return;

    //     // setAnchor(e.id, e.anchor);
    //   });
    //   io.on('id-join', e => {
    //     if (io.id === e.id) return;

    //     addName(e.id, e.name);
    //     // setAnchor(e.id, e.anchor);
    //   });
    //   io.on('id-left', e => {
    //     if (io.id === e.id) return;

    //     removeId(e.id);
    //   });
    // });
  },
  beforeDestroy() {
  },

  watch: {
    'htmlForEditor': function() {
      this.$emit('input', this.htmlForEditor);
    }
  },
  computed: {
  },
  methods: {
    textChange(delta, oldDelta, source) {
      // if (source !== 'user') return;
      // this.$root.deltaText({
      //   slugFolderName: this.slugProjectName, 
      //   slugMediaName: this.slugMediaName,        
      //   delta,
      // });
    },    
  }
}
</script>
