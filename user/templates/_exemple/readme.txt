This is an example for the basic bricks to make a custom template. Templates are used to layout a publication and can be selected independently for each publication.

To be complete, a template needs:

- (required) an icone.svg file used to select this template,

- (required) a style.css file used to override dodoc’s default for a publication’s title, media and caption layout (on both the library and the publication’s pages),

- (optional, not enabled as of dodoc v6) a script.js file used to load custom behaviors (only on the publication’s page). You can use jQuery’s $ to manipulate the DOM.

The simplest way to create a new template is to duplicate this folder and to rename it to something else (without underscore in the name or it will be hidden from the templates selector in dodoc).
You can then edit style.css and replace icone.svg according to your template.