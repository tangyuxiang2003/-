"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = getAttributesString;
var _sanitizeAttributeName = _interopRequireDefault(require("./sanitizeAttributeName.js"));
var _sanitizeAttributeValue = _interopRequireDefault(require("./sanitizeAttributeValue.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
/**
 * Converts an object with XML attribute values to a string.
 * Examples:
 * { a: 'b', c: 'd' } → ' a="b" c="d"'
 * {} → ''
 * @param {object} attributes
 * @returns {string}
 */
function getAttributesString(attributes) {
  return Object.keys(attributes).map(function (name) {
    return "".concat((0, _sanitizeAttributeName["default"])(name), "=\"").concat((0, _sanitizeAttributeValue["default"])(String(attributes[name])), "\"");
  }).reduce(function (combined, part) {
    return combined + ' ' + part;
  }, '');
}
//# sourceMappingURL=getAttributesString.js.map