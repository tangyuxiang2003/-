"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = getOpeningTagMarkup;
var _getAttributesString = _interopRequireDefault(require("./getAttributesString.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
/**
 * Returns XML for an "opening tag" with a given `tagName` and optional `attributes`.
 * @param {string} tagName
 * @param {object} [attributes]
 * @returns {string}
 */
function getOpeningTagMarkup(tagName, attributes) {
  return '<' + tagName + (attributes ? (0, _getAttributesString["default"])(attributes) : '') + '>';
}
//# sourceMappingURL=getOpeningTagMarkup.js.map