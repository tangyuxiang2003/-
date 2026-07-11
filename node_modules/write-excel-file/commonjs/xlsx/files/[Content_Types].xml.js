"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = generateContentTypesXml;
exports.getDrawingContentTypeXml = getDrawingContentTypeXml;
var _getAdditionalContent = _interopRequireDefault(require("../helpers/features/getAdditionalContent.js"));
var _transformContent = _interopRequireDefault(require("../helpers/features/transformContent.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function generateContentTypesXml(_ref) {
  var sheetIds = _ref.sheetIds,
    features = _ref.features,
    sheetsOptions = _ref.sheetsOptions;
  var xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' + '<Default ContentType="application/xml" Extension="xml"/>' + '<Default ContentType="application/vnd.openxmlformats-package.relationships+xml" Extension="rels"/>' + '<Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" PartName="/xl/workbook.xml"/>' + '<Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml" PartName="/xl/sharedStrings.xml"/>' + '<Override ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml" PartName="/xl/styles.xml"/>' + sheetIds.map(function (sheetId) {
    return "<Override ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml\" PartName=\"/xl/worksheets/sheet".concat(sheetId, ".xml\"/>");
  }).join('') + sheetIds.map(function (sheetId) {
    return getDrawingContentTypeXml(sheetId);
  }).join('') +
  // Apply any plugins that insert additional content to this XML.
  (0, _getAdditionalContent["default"])('[Content_Types].xml', features, sheetsOptions) + '</Types>';

  // Apply any plugins that transform this XML.
  xml = (0, _transformContent["default"])(xml, '[Content_Types].xml', features, sheetsOptions);
  return xml;
}
function getDrawingContentTypeXml(sheetId) {
  return "<Override ContentType=\"application/vnd.openxmlformats-officedocument.drawing+xml\" PartName=\"/xl/drawings/drawing".concat(sheetId, ".xml\"/>");
}
//# sourceMappingURL=[Content_Types].xml.js.map