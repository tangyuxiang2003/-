"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = findElementInsideElement;
var _findElement = _interopRequireDefault(require("./findElement.js"));
var _getMarkupInsideElement = _interopRequireDefault(require("./getMarkupInsideElement.js"));
var _applyEnclosingElementOffset = _interopRequireDefault(require("./applyEnclosingElementOffset.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
/**
 * Finds a single element in valid XML markup within bounds of a given element that was previously found using `findElement()` function.
 * @param {string} xml — XML markup
 * @param {string} tagName — The name of the element to find
 * @param {object} enclosingElement — An enclosing element that was previously found using `findElement()` function.
 * @returns {object|undefined} — A found element, represented by an object with propeties: `{ openingTagStartIndex: number, openingTagEndIndex: number, openingTagAttributes: object, selfClosingTag?: boolean, closingTagStartIndex?: number, closingTagEndIndex?: number }`
 */
function findElementInsideElement(xml, tagName, enclosingElement) {
  var element = (0, _findElement["default"])((0, _getMarkupInsideElement["default"])(xml, enclosingElement), tagName);
  if (element) {
    (0, _applyEnclosingElementOffset["default"])(element, enclosingElement);
    return element;
  }
}
//# sourceMappingURL=findElementInsideElement.js.map