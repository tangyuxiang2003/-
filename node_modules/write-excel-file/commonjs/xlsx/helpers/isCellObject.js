"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = isCellObject;
var _isObject = _interopRequireDefault(require("./isObject.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
/**
 * Tells if a cell in sheet data is a simple value like `1` or "abc"
 * or if it's a fully-specified object like `{ value: "abc", type: String, ... }`.
 * https://gitlab.com/catamphetamine/write-excel-file/-/issues/107
 * @returns {boolean}
 */
function isCellObject(cell) {
  // (cell: Cell): value is CellObject {
  return (0, _isObject["default"])(cell);
}
//# sourceMappingURL=isCellObject.js.map