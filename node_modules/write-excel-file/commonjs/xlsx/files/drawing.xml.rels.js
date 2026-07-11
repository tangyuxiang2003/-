"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = generateDrawingXmlRels;
var _getAdditionalContent = _interopRequireDefault(require("../helpers/features/getAdditionalContent.js"));
var _transformContent = _interopRequireDefault(require("../helpers/features/transformContent.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function generateDrawingXmlRels(_ref) {
  var sheetIndex = _ref.sheetIndex,
    sheetId = _ref.sheetId,
    sheetOptions = _ref.sheetOptions,
    features = _ref.features;
  var xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
  // Apply any plugins that insert additional content to this XML.
  (0, _getAdditionalContent["default"])('xl/drawings/_rels/drawing{id}.xml.rels', features, sheetOptions, {
    sheetIndex: sheetIndex,
    sheetId: sheetId
  }) + '</Relationships>';

  // Apply any plugins that transform this XML.
  xml = (0, _transformContent["default"])(xml, 'xl/drawings/_rels/drawing{id}.xml.rels', features, sheetOptions, {
    sheetIndex: sheetIndex,
    sheetId: sheetId
  });
  return xml;
}
//# sourceMappingURL=drawing.xml.rels.js.map