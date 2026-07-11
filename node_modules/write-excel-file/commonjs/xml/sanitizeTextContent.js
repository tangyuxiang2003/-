"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = sanitizeTextContent;
var _escapeXmlSpecialCharacters = _interopRequireDefault(require("./escapeXmlSpecialCharacters.js"));
var _removeInvalidXmlCharacters = _interopRequireDefault(require("./removeInvalidXmlCharacters.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
/**
 * Removes invalid characters and escapes "speciaL" characters in an XML element's text content.
 * @param {string} textContent
 * @returns {string}
 */
function sanitizeTextContent(textContent) {
  if (typeof textContent !== 'string') {
    throw new TypeError('Argument must be a string');
  }
  // Remove characters that're invalid in XML.
  textContent = (0, _removeInvalidXmlCharacters["default"])(textContent);
  // Escape "special" characters.
  return (0, _escapeXmlSpecialCharacters["default"])(textContent, {
    isAttributeValue: false
  });
}
//# sourceMappingURL=sanitizeTextContent.js.map