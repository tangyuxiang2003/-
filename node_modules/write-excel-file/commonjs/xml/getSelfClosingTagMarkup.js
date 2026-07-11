"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = getSelfClosingTagMarkup;
var _getOpeningTagMarkup = _interopRequireDefault(require("./getOpeningTagMarkup.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
/**
 * Returns XML for an element with a given `tagName`, optional `attributes` and no child elements.
 * @param {string} tagName
 * @param {object} [attributes]
 * @returns {string}
 */
function getSelfClosingTagMarkup(tagName, attributes) {
  return (0, _getOpeningTagMarkup["default"])(tagName, attributes).slice(0, -1) + '/>';
}
//# sourceMappingURL=getSelfClosingTagMarkup.js.map