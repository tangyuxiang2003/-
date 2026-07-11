"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = getChildElements;
var _getMarkupInsideElement = _interopRequireDefault(require("./getMarkupInsideElement.js"));
var _applyEnclosingElementOffset = _interopRequireDefault(require("./applyEnclosingElementOffset.js"));
var _findElementsNonRecursive_ = _interopRequireDefault(require("./findElementsNonRecursive_.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _createForOfIteratorHelperLoose(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (t) return (t = t.call(r)).next.bind(t); if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var o = 0; return function () { return o >= r.length ? { done: !0 } : { done: !1, value: r[o++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
/**
 * Returns all child elements of a given element.
 * @param {string} xml — XML markup
 * @param {object} element — A parent element that was previously found using `findElement()` function.
 * @returns {object[]} — Child elements, each element represented by an object with propeties: `{ openingTagStartIndex: number, openingTagEndIndex: number, openingTagAttributes: object, selfClosingTag?: boolean, closingTagStartIndex?: number, closingTagEndIndex?: number }`
 */
function getChildElements(xml, element) {
  var children = (0, _findElementsNonRecursive_["default"])((0, _getMarkupInsideElement["default"])(xml, element));
  for (var _iterator = _createForOfIteratorHelperLoose(children), _step; !(_step = _iterator()).done;) {
    var child = _step.value;
    (0, _applyEnclosingElementOffset["default"])(child, element);
  }
  return children;
}
//# sourceMappingURL=getChildElements.js.map