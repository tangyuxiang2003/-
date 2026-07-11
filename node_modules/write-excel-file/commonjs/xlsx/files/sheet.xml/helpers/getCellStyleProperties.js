"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = getCellStyleProperties;
var _hasAlignment = _interopRequireDefault(require("../../../helpers/hasAlignment.js"));
var _hasBorder = _interopRequireDefault(require("../../../helpers/hasBorder.js"));
var _hasFill = _interopRequireDefault(require("../../../helpers/hasFill.js"));
var _hasFont = _interopRequireDefault(require("../../../helpers/hasFont.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function getCellStyleProperties(cell, features) {
  var align = cell.align,
    alignVertical = cell.alignVertical,
    textRotation = cell.textRotation,
    indent = cell.indent,
    wrap = cell.wrap,
    fontFamily = cell.fontFamily,
    fontSize = cell.fontSize,
    fontWeight = cell.fontWeight,
    fontStyle = cell.fontStyle,
    textDecoration = cell.textDecoration,
    textColor = cell.textColor,
    backgroundColor = cell.backgroundColor,
    fillPatternStyle = cell.fillPatternStyle,
    fillPatternColor = cell.fillPatternColor,
    borderColor = cell.borderColor,
    borderStyle = cell.borderStyle,
    leftBorderColor = cell.leftBorderColor,
    leftBorderStyle = cell.leftBorderStyle,
    rightBorderColor = cell.rightBorderColor,
    rightBorderStyle = cell.rightBorderStyle,
    topBorderColor = cell.topBorderColor,
    topBorderStyle = cell.topBorderStyle,
    bottomBorderColor = cell.bottomBorderColor,
    bottomBorderStyle = cell.bottomBorderStyle;
  if ((0, _hasAlignment["default"])({
    align: align,
    alignVertical: alignVertical,
    textRotation: textRotation,
    indent: indent,
    wrap: wrap
  }) || (0, _hasFont["default"])({
    fontFamily: fontFamily,
    fontSize: fontSize,
    fontWeight: fontWeight,
    fontStyle: fontStyle,
    textDecoration: textDecoration,
    textColor: textColor
  }) || (0, _hasFill["default"])({
    backgroundColor: backgroundColor,
    fillPatternStyle: fillPatternStyle,
    fillPatternColor: fillPatternColor
  }) || (0, _hasBorder["default"])({
    borderColor: borderColor,
    borderStyle: borderStyle,
    leftBorderColor: leftBorderColor,
    leftBorderStyle: leftBorderStyle,
    rightBorderColor: rightBorderColor,
    rightBorderStyle: rightBorderStyle,
    topBorderColor: topBorderColor,
    topBorderStyle: topBorderStyle,
    bottomBorderColor: bottomBorderColor,
    bottomBorderStyle: bottomBorderStyle
  })) {
    return omitUndefinedProperties({
      // alignment
      align: align,
      alignVertical: alignVertical,
      textRotation: textRotation,
      indent: indent,
      wrap: wrap,
      // font
      fontFamily: fontFamily,
      fontSize: fontSize,
      fontWeight: fontWeight,
      fontStyle: fontStyle,
      textDecoration: textDecoration,
      textColor: textColor,
      // fill
      backgroundColor: backgroundColor,
      fillPatternStyle: fillPatternStyle,
      fillPatternColor: fillPatternColor,
      // border
      borderColor: borderColor,
      borderStyle: borderStyle,
      leftBorderColor: leftBorderColor,
      leftBorderStyle: leftBorderStyle,
      rightBorderColor: rightBorderColor,
      rightBorderStyle: rightBorderStyle,
      topBorderColor: topBorderColor,
      topBorderStyle: topBorderStyle,
      bottomBorderColor: bottomBorderColor,
      bottomBorderStyle: bottomBorderStyle
    });
  }
}
function omitUndefinedProperties(object) {
  var filteredObject = {};
  for (var key in object) {
    if (object[key] !== undefined) {
      filteredObject[key] = object[key];
    }
  }
  return filteredObject;
}
//# sourceMappingURL=getCellStyleProperties.js.map