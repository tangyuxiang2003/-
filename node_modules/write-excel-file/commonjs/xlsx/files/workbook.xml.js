"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = generateWorkbookXml;
var _getAdditionalContent = _interopRequireDefault(require("../helpers/features/getAdditionalContent.js"));
var _transformContent = _interopRequireDefault(require("../helpers/features/transformContent.js"));
var _sanitizeAttributeValue = _interopRequireDefault(require("../../xml/sanitizeAttributeValue.js"));
var _getElementXml = _interopRequireDefault(require("../helpers/features/getElementXml.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function generateWorkbookXml(_ref) {
  var sheetIdsAndNames = _ref.sheetIdsAndNames,
    features = _ref.features,
    sheetsOptions = _ref.sheetsOptions;
  /**
   * Creates XML tag markup.
   * @param {string} tagName
   * @param {object} attributes
   * @param {string} [innerXml]
   * @param {number} [index]
   * @returns {string}
   */
  var tag = function tag(tagName, attributes, innerXml, index) {
    return (0, _getElementXml["default"])('xl/workbook.xml', tagName, attributes, innerXml, index, EMPTY_OBJECT, sheetsOptions, features);
  };
  var xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mx="http://schemas.microsoft.com/office/mac/excel/2008/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:mv="urn:schemas-microsoft-com:mac:vml" xmlns:x14="http://schemas.microsoft.com/office/spreadsheetml/2009/9/main" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac" xmlns:xm="http://schemas.microsoft.com/office/excel/2006/main">' +
  // The order of elements is dictated by the XLSX spec.
  //
  // <workbookPr/>
  tag('workbookPr') +
  // <bookViews/>
  tag('bookViews', null, tag('workbookView', null, null, 0)) +
  // <sheets/>
  tag('sheets', null, sheetIdsAndNames.map(function (_ref2, i) {
    var sheetId = _ref2.sheetId,
      sheetName = _ref2.sheetName;
    return tag('sheet', {
      'r:id': "rId".concat(sheetId),
      sheetId: sheetId,
      name: sheetName
    }, null, i);
  }).join('')) +
  // <definedNames/>
  tag('definedNames') +
  // <calcPr/>
  tag('calcPr') +
  // Apply any plugins that insert additional content to this XML.
  (0, _getAdditionalContent["default"])('xl/workbook.xml', features, sheetsOptions) + '</workbook>';

  // Apply any plugins that transform this XML.
  xml = (0, _transformContent["default"])(xml, 'xl/workbook.xml', features, sheetsOptions);
  return xml;
}
var EMPTY_OBJECT = {};
//# sourceMappingURL=workbook.xml.js.map