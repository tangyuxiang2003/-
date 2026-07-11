"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = generateSheetData;
var _row = _interopRequireDefault(require("./row.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function generateSheetData(tag, sheetData, parameters) {
  var sheetDataXml = sheetData.map(function (row, index) {
    return (0, _row["default"])(tag, row, index, parameters);
  }).join('');
  return tag('sheetData', null, sheetDataXml);
}
//# sourceMappingURL=sheetData.js.map