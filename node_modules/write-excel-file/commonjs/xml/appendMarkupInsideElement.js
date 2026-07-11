"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = appendMarkupInsideElement;
var _setMarkupInsideElement = _interopRequireDefault(require("./setMarkupInsideElement.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
/**
 * Appends XML inside an `element` that was found in `xml` using `findElement()` function.
 * @param {string} xml
 * @param {FoundElement} element
 * @param {string} addedXml
 * @returns {string}
 */
function appendMarkupInsideElement(xml, element, addedXml) {
  if (element.selfClosingTag) {
    return (0, _setMarkupInsideElement["default"])(xml, element, addedXml);
  }
  return xml.slice(0, element.closingTagStartIndex) + addedXml + xml.slice(element.closingTagStartIndex);
}
//# sourceMappingURL=appendMarkupInsideElement.js.map