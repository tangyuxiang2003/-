"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = getClosingTagMarkup;
/**
 * Returns XML for a "closing tag" with a given `tagName`.
 * @param {string} tagName
 * @returns {string}
 */
function getClosingTagMarkup(tagName) {
  return '</' + tagName + '>';
}
//# sourceMappingURL=getClosingTagMarkup.js.map