import Quill from "quill";
const Module = Quill.import("core/module");

export default class CardEditableModule extends Module {
  constructor(quill, options) {
    super(quill, options);
    let is_selected = false;

    let listener = (e) => {
      if (!document.body.contains(quill.root)) {
        return document.body.removeEventListener("click", listener);
      }
      let elm = e.target.closest(".ql-mediacard");

      let deselectCard = () => {
        console.log("deselectCard");
        is_selected = false;
        if (elm.__onDeselect) {
          elm.__onDeselect(quill);
        } else {
          quill.setSelection(
            quill.getIndex(elm.__blot.blot) + 1,
            0,
            Quill.sources.USER
          );
        }
      };
      if (elm && elm.__blot && elm.__onSelect && !is_selected) {
        // not ideal yet, can trigger repaint
        quill.disable();
        is_selected = true;
        console.log("selectCard");

        elm.__onSelect(quill);

        let handleKeyPress = (e) => {
          if (e.keyCode === 27 || e.keyCode === 13) {
            window.removeEventListener("keypress", handleKeyPress);
            quill.enable(true);
            deselectCard();
          }
        };
        let handleClick = (e) => {
          const path = e.path || (e.composedPath && e.composedPath());
          if (e.which === 1 && !path.includes(elm)) {
            window.removeEventListener("click", handleClick);
            quill.enable(true);
            deselectCard();
          }
        };
        let handleDrag = (e) => {
          e;
          window.removeEventListener("dragover", handleDrag);
          quill.enable(true);
          deselectCard();
        };
        window.addEventListener("keypress", handleKeyPress);
        window.addEventListener("click", handleClick);
        window.addEventListener("dragover", handleDrag);
      }
    };
    quill.emitter.listenDOM("click", document.body, listener);
  }
}
