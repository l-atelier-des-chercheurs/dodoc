/**
 * Shared utils façade — same flat API as the former core2/utils.js.
 * Domain modules mutate/return methods onto a shared API object so they can
 * call each other via API.* without circular requires.
 */
const API = {};

Object.assign(API, require("./meta-utils")(API));
Object.assign(API, require("./path-utils")(API));
Object.assign(API, require("./media-utils")(API));
Object.assign(API, require("./fs-utils")(API));
Object.assign(API, require("./misc")(API));

module.exports = API;
