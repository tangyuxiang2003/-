"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = sanitizeAttributeName;
var _removeInvalidXmlCharacters = _interopRequireDefault(require("./removeInvalidXmlCharacters.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
/**
 * Removes invalid characters and escapes "speciaL" characters in an XML attribute's name.
 * @param {string} attributeName
 * @returns {string}
 */
function sanitizeAttributeName(attributeName) {
  if (typeof attributeName !== 'string') {
    throw new TypeError('Argument must be a string');
  }
  // Remove characters that're invalid in XML.
  attributeName = (0, _removeInvalidXmlCharacters["default"])(attributeName);
  // Remove characters that're invalid in an XML attribute name.
  return attributeName.replace(/[^a-zA-Z_0-9-.:]/g, '').replace(/^[^a-zA-Z_]+/, '');
}
//# sourceMappingURL=sanitizeAttributeName.js.map