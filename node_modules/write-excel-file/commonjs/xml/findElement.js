"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = findElement;
var _findElementsNonRecursive_ = _interopRequireDefault(require("./findElementsNonRecursive_.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
/**
 * Finds a single element in valid XML markup.
 * @param {string} xml — XML markup
 * @param {string} tagName — The name of the element to find
 * @returns {object|undefined} — A found element, represented by an object with propeties: `{ openingTagStartIndex: number, openingTagEndIndex: number, openingTagAttributes: object, selfClosingTag?: boolean, closingTagStartIndex?: number, closingTagEndIndex?: number }`
 */
function findElement(xml, tagName) {
  var elements = (0, _findElementsNonRecursive_["default"])(xml, {
    tagName: tagName,
    stopAfterFirstMatch: true
  });
  return elements[0];
}
//# sourceMappingURL=findElement.js.map