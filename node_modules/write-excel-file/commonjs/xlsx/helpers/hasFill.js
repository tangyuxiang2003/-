"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = hasFill;
function hasFill(_ref) {
  var backgroundColor = _ref.backgroundColor,
    fillPatternStyle = _ref.fillPatternStyle,
    fillPatternColor = _ref.fillPatternColor;
  return Boolean(backgroundColor || fillPatternStyle && fillPatternColor);
}
//# sourceMappingURL=hasFill.js.map