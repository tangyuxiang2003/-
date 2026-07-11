"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = getFillXml;
var _sanitizeAttributeValue = _interopRequireDefault(require("../../xml/sanitizeAttributeValue.js"));
var _getXlsxColorForHexColor = _interopRequireDefault(require("./getXlsxColorForHexColor.js"));
var _hasFill = _interopRequireDefault(require("./hasFill.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function getFillXml(fill) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
    conditionalFormatting = _ref.conditionalFormatting;
  var backgroundColor = fill.backgroundColor,
    fillPatternStyle = fill.fillPatternStyle,
    fillPatternColor = fill.fillPatternColor;
  var isSolidFill = !fillPatternStyle || fillPatternStyle === 'solid';
  if (!(0, _hasFill["default"])(fill)) {
    return '<fill>' + '<patternFill patternType="none"/>' + '</fill>';
  }
  var xml = '<fill>';

  // In XLSX, a background could be one of two types:
  //
  // * Some background color
  //   * `<patternFill patternType="solid"/>`
  //   * `<fgColor rgb="..."/>` — extremely weirdly, "background color" is specified as "foreground color" in XLSX standard.
  //   * `<bgColor indexed="64"/>` — just ignore this extremely weird mandatory element in XLSX standard.
  // * Some background color + Some pattern over it
  //   * `<patternFill patternType="...something-other-than-solid..."/>`
  //   * `<fgColor rgb="..."/>` — Pattern color
  //   * `<bgColor rgb="..."/>` — Background color
  //
  // As weird as it is, it gets more weird when it comes to "conditional formatting":
  // for some weird reason, it doesn't work same way in case of "conditional formatting".
  // Specifically, `<bgColor indexed="64"/>` should not be used and instead it should specify
  // `<bgColor rgb="..."/>` same as `<fgColor rgb="..."/>`.

  xml += "<patternFill patternType=\"".concat(isSolidFill ? 'solid' : fillPatternStyle, "\">");
  xml += "<fgColor rgb=\"".concat((0, _sanitizeAttributeValue["default"])((0, _getXlsxColorForHexColor["default"])(isSolidFill ? backgroundColor : fillPatternColor)), "\"/>");
  xml += "<bgColor ".concat(isSolidFill && !conditionalFormatting ? 'indexed="64"' : 'rgb="' + (0, _sanitizeAttributeValue["default"])((0, _getXlsxColorForHexColor["default"])(backgroundColor)) + '"', "/>");
  xml += '</patternFill>';

  // Close the `<fill>` element.
  xml += '</fill>';

  // Return the XML.
  return xml;
}
//# sourceMappingURL=getFillXml.js.map