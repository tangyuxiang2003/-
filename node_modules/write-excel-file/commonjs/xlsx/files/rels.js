"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = generateRelsXml;
var _getAdditionalContent = _interopRequireDefault(require("../helpers/features/getAdditionalContent.js"));
var _transformContent = _interopRequireDefault(require("../helpers/features/transformContent.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function generateRelsXml(_ref) {
  var features = _ref.features,
    sheetsOptions = _ref.sheetsOptions;
  var xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + '<Relationship Id="rId-workbook-1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
  // Apply any plugins that insert additional content to this XML.
  (0, _getAdditionalContent["default"])('_rels/.rels', features, sheetsOptions) + '</Relationships>';

  // Apply any plugins that transform this XML.
  xml = (0, _transformContent["default"])(xml, '_rels/.rels', features, sheetsOptions);
  return xml;
}
//# sourceMappingURL=rels.js.map