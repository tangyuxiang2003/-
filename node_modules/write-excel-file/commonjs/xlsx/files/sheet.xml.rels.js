"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = generateSheetXmlRels;
exports.getDrawingRelationshipXml = getDrawingRelationshipXml;
var _getAdditionalContent = _interopRequireDefault(require("../helpers/features/getAdditionalContent.js"));
var _transformContent = _interopRequireDefault(require("../helpers/features/transformContent.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function generateSheetXmlRels(_ref) {
  var sheetIndex = _ref.sheetIndex,
    sheetId = _ref.sheetId,
    sheetOptions = _ref.sheetOptions,
    features = _ref.features;
  var xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
  // Each sheet has at most one "drawing", so a globally-unique drawing ID is assumed to be the sheet ID.
  getDrawingRelationshipXml(sheetId) +
  // Apply any plugins that insert additional content to this XML.
  (0, _getAdditionalContent["default"])('xl/worksheets/_rels/sheet{id}.xml.rels', features, sheetOptions, {
    sheetIndex: sheetIndex,
    sheetId: sheetId
  }) + '</Relationships>';

  // Apply any plugins that transform this XML.
  xml = (0, _transformContent["default"])(xml, 'xl/worksheets/_rels/sheet{id}.xml.rels', features, sheetOptions, {
    sheetIndex: sheetIndex,
    sheetId: sheetId
  });
  return xml;
}
function getDrawingRelationshipXml(sheetId) {
  return "<Relationship Id=\"rId-drawing-1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing\" Target=\"../drawings/drawing".concat(sheetId, ".xml\"/>");
}
//# sourceMappingURL=sheet.xml.rels.js.map