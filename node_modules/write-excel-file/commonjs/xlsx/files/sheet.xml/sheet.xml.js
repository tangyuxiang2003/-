"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = generateSheetXml;
var _sheetViews = _interopRequireDefault(require("./sheetViews.js"));
var _columns = _interopRequireDefault(require("./columns.js"));
var _sheetData = _interopRequireDefault(require("./sheetData.js"));
var _processMergedCells2 = _interopRequireDefault(require("./processMergedCells.js"));
var _mergedCellsDescription = _interopRequireDefault(require("./mergedCellsDescription.js"));
var _pageMargins = _interopRequireDefault(require("./pageMargins.js"));
var _pageSetup = _interopRequireDefault(require("./pageSetup.js"));
var _drawingReference = _interopRequireDefault(require("./drawingReference.js"));
var _getAdditionalContent = _interopRequireDefault(require("../../helpers/features/getAdditionalContent.js"));
var _transformContent = _interopRequireDefault(require("../../helpers/features/transformContent.js"));
var _getElementXml = _interopRequireDefault(require("../../helpers/features/getElementXml.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function generateSheetXml(sheetXmlParameters, features) {
  var sheetData_ = sheetXmlParameters.sheetData,
    sheetOptions = sheetXmlParameters.sheetOptions,
    sheetIndex = sheetXmlParameters.sheetIndex,
    sheetId = sheetXmlParameters.sheetId,
    hasDefaultFont = sheetXmlParameters.hasDefaultFont,
    findOrCreateCellStyle = sheetXmlParameters.findOrCreateCellStyle,
    findOrCreateSharedString = sheetXmlParameters.findOrCreateSharedString;
  var columns = sheetOptions.columns,
    dateFormat = sheetOptions.dateFormat,
    orientation = sheetOptions.orientation,
    showGridLines = sheetOptions.showGridLines,
    rightToLeft = sheetOptions.rightToLeft,
    zoomScale = sheetOptions.zoomScale;
  var _processMergedCells = (0, _processMergedCells2["default"])(sheetData_, {
      features: features
    }),
    sheetData = _processMergedCells.sheetData,
    mergedCells = _processMergedCells.mergedCells;

  // A parameter that will be used inside the `tag()` function below.
  var tagFunctionProperties = {
    sheetIndex: sheetIndex,
    sheetId: sheetId
  };

  /**
   * Creates XML tag markup.
   * @param {string} tagName
   * @param {object} attributes
   * @param {string} [innerXml]
   * @param {number} [index]
   * @returns {string}
   */
  var tag = function tag(tagName, attributes, innerXml, index) {
    return (0, _getElementXml["default"])('xl/worksheets/sheet{id}.xml', tagName, attributes, innerXml, index, tagFunctionProperties, sheetOptions, features);
  };
  var xml = '<?xml version="1.0" ?>' + '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:mv="urn:schemas-microsoft-com:mac:vml" xmlns:mx="http://schemas.microsoft.com/office/mac/excel/2008/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:x14="http://schemas.microsoft.com/office/spreadsheetml/2009/9/main" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac" xmlns:xm="http://schemas.microsoft.com/office/excel/2006/main">' +
  // The order of elements is dictated by the XLSX spec.
  //
  // `<sheetViews/>`
  (0, _sheetViews["default"])(tag, {
    showGridLines: showGridLines,
    rightToLeft: rightToLeft,
    zoomScale: zoomScale
  }, sheetIndex) +
  // `<cols/>`
  (0, _columns["default"])(tag, columns) +
  // `<sheetData/>`
  (0, _sheetData["default"])(tag, sheetData, {
    findOrCreateCellStyle: findOrCreateCellStyle,
    findOrCreateSharedString: findOrCreateSharedString,
    hasDefaultFont: hasDefaultFont,
    dateFormat: dateFormat,
    features: features
  }) +
  // `<mergeCells/>`
  (0, _mergedCellsDescription["default"])(tag, mergedCells) +
  // `<pageMargins/>`
  (0, _pageMargins["default"])(tag, {
    orientation: orientation
  }) +
  // `<pageSetup/>`
  (0, _pageSetup["default"])(tag, {
    orientation: orientation
  }) +
  // `<drawing/>`
  (0, _drawingReference["default"])(tag) +
  // Apply any plugins that insert additional content to this XML.
  (0, _getAdditionalContent["default"])('xl/worksheets/sheet{id}.xml', features, sheetOptions, {
    sheetIndex: sheetIndex,
    sheetId: sheetId
  }) + '</worksheet>';

  // Apply any plugins that transform this XML.
  xml = (0, _transformContent["default"])(xml, 'xl/worksheets/sheet{id}.xml', features, sheetOptions, {
    sheetIndex: sheetIndex,
    sheetId: sheetId
  });
  return xml;
}
//# sourceMappingURL=sheet.xml.js.map