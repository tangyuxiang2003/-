"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = sanitizeAttributeValue;
var _escapeXmlSpecialCharacters = _interopRequireDefault(require("./escapeXmlSpecialCharacters.js"));
var _removeInvalidXmlCharacters = _interopRequireDefault(require("./removeInvalidXmlCharacters.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
/**
 * Removes invalid characters and escapes "speciaL" characters in an XML attribute's value.
 * @param {string} attributeValue
 * @returns {string}
 */
function sanitizeAttributeValue(attributeValue) {
  if (typeof attributeValue !== 'string') {
    throw new TypeError('Argument must be a string');
  }
  // Remove characters that're invalid in XML.
  attributeValue = (0, _removeInvalidXmlCharacters["default"])(attributeValue);
  // Escape "special" characters.
  return (0, _escapeXmlSpecialCharacters["default"])(attributeValue, {
    isAttributeValue: true
  });
}
//# sourceMappingURL=sanitizeAttributeValue.js.map