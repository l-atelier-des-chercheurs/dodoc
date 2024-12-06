import Quill from "quill";
let BlockEmbed = Quill.import("blots/block/embed");

// inspired from https://gist.github.com/tranduongms1/584d43ec7d8ddeab458f087adbeef950
export default class MediaBlot extends BlockEmbed {
  static blotName = "media";
  static tagName = "figure";
  static className = "ql-mediacard";

  static create({ type, src, content, caption, meta_filename }) {
    console.log(`CollaborativeEditor • MediaBlot : create for type = ${type}`);

    let node = super.create();
    let container = window.document.createElement("div");
    container.classList.add("ql-mediacard-container");

    node.setAttribute("contenteditable", false);
    // let bg = window.document.createElement("div");
    // bg.setAttribute("class", "ql-mediacard--background");
    // node.appendChild(bg);

    let tag;

    if (!type || !meta_filename) {
      alert(
        `Missing type or meta_filename : type = ${type} and meta_filename = ${meta_filename}`
      );
      return;
    }

    if (type === "image") {
      tag = window.document.createElement("img");
    } else if (type === "video") {
      tag = window.document.createElement("video");
      tag.setAttribute("controls", true);
    } else if (type === "audio") {
      tag = window.document.createElement("audio");
      tag.setAttribute("controls", true);
    } else if (type === "text") {
      tag = window.document.createElement("blockquote");
      tag.innerHTML = content;
    }

    if (src) {
      tag.setAttribute("src", src);
    }
    tag.setAttribute("draggable", false);
    container.appendChild(tag);

    if (caption) {
      let caption_tag = window.document.createElement("figcaption");
      caption_tag.innerHTML = caption;
      container.appendChild(caption_tag);
    }
    node.dataset.type = type;
    node.dataset.meta_filename = meta_filename;
    node.setAttribute("draggable", false);
    // todo for later: allow drag from cards in quill to move inside document or to composition
    node.addEventListener("dragstart", ($event) => {
      $event.dataTransfer.setData("text/plain", "media_in_quill");
      $event.dataTransfer.effectAllowed = "move";
    });

    node.appendChild(container);

    return node;
  }

  constructor(node) {
    super(node);

    let btnRow, caption, captionInput;

    node.__onSelect = () => {
      const quill = Quill.find(node.parentElement.parentElement);

      if (!quill.container.classList.contains("is--editable")) return;
      node.classList.add("is--focused");

      btnRow = window.document.createElement("div");

      let removeButton = window.document.createElement("button");
      removeButton.innerHTML = "supprimer ×";
      removeButton.setAttribute("type", "button");
      removeButton.classList.add("_button_removeMedia");
      removeButton.addEventListener("click", () => {
        quill.enable(true);
        super.remove();
      });
      btnRow.appendChild(removeButton);

      let ratioButton = window.document.createElement("select");
      ratioButton.innerHTML = `
        <option>default</option>
        <option>1/4</option>
        <option>2/4</option>
        <option>3/4</option>
        `;
      ratioButton.classList.add("_select_ratio");
      ratioButton.addEventListener("change", (event) => {
        const ratio = event.target.value;
        node.dataset.ratio = ratio;
        ratioButton.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      });
      btnRow.appendChild(ratioButton);

      node.appendChild(btnRow);

      caption = node.querySelector("figcaption");
      captionInput = window.document.createElement("input");
      captionInput.setAttribute("type", "text");
      captionInput.setAttribute("autofocus", true);
      captionInput.placeholder = "Légende…";

      if (caption) {
        captionInput.value = caption.innerText;
        caption.innerHTML = "";
        caption.appendChild(captionInput);
      } else {
        caption = window.document.createElement("figcaption");
        caption.appendChild(captionInput);
        node.querySelector(".ql-mediacard-container").appendChild(caption);
      }

      setTimeout(() => {
        captionInput.focus();
      }, 50);
    };
    node.__onDeselect = () => {
      let value = captionInput.value;
      if (!value || value === "") {
        caption.remove();
      } else {
        captionInput.remove();
        caption.innerText = value;
      }
      node.classList.remove("is--focused");
      btnRow.remove();
    };
  }

  // deleteAt() {
  //   console.log("deleteAt for custom mediablock: prevented");
  //   return false;
  //   // prevent removing on backspace after block
  // }

  static value(node) {
    if (node.dataset.type === "image") {
      let img = node.querySelector("img");
      let figcaption = node.querySelector("figcaption");
      if (!img) return false;
      return {
        alt: img.getAttribute("alt"),
        src: img.getAttribute("src"),
        meta_filename: node.dataset.meta_filename,
        type: node.dataset.type,
        caption: figcaption ? figcaption.innerText : null,
      };
    } else if (node.dataset.type === "video") {
      let video = node.querySelector("video");
      let figcaption = node.querySelector("figcaption");
      if (!video) return false;
      return {
        alt: video.getAttribute("alt"),
        src: video.getAttribute("src"),
        meta_filename: node.dataset.meta_filename,
        type: node.dataset.type,
        caption: figcaption ? figcaption.innerText : null,
      };
    } else if (node.dataset.type === "audio") {
      let audio = node.querySelector("audio");
      let figcaption = node.querySelector("figcaption");
      if (!audio) return false;
      return {
        alt: audio.getAttribute("alt"),
        src: audio.getAttribute("src"),
        meta_filename: node.dataset.meta_filename,
        type: node.dataset.type,
        caption: figcaption ? figcaption.innerText : null,
      };
    } else if (node.dataset.type === "text") {
      let blockquote = node.querySelector("blockquote");
      let figcaption = node.querySelector("figcaption");
      if (!blockquote) return false;
      return {
        meta_filename: node.dataset.meta_filename,
        content: blockquote.innerHTML,
        type: node.dataset.type,
        caption: figcaption ? figcaption.innerText : null,
      };
    }
  }
}
