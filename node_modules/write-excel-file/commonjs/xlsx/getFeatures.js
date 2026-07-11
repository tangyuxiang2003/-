"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = getFeatures;
var _conditionalFormatting = _interopRequireDefault(require("./features/conditionalFormatting.js"));
var _images = _interopRequireDefault(require("./features/images.js"));
var _stickyRowsOrColumns = _interopRequireDefault(require("./features/stickyRowsOrColumns.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function getFeatures(customFeatures) {
  var features = [];

  // Add "conditional formatting" feature implicitly.
  features.push(_conditionalFormatting["default"]);

  // Add "images" feature implicitly.
  features.push(_images["default"]);

  // Add "sticky rows or columns" feature implicitly.
  features.push(_stickyRowsOrColumns["default"]);

  // Custom features might depend on "default" features
  // so the order of inclusion of custom features is after including "default" features.
  if (customFeatures) {
    customFeatures.forEach(validateFeature);
    features = features.concat(customFeatures);
  }
  return features;
}
var TRANSFORMABLE_FILES = ['[Content_Types].xml', '_rels/.rels', 'xl/styles.xml', 'xl/workbook.xml', 'xl/_rels/workbook.xml.rels', 'xl/worksheets/sheet{id}.xml', 'xl/worksheets/_rels/sheet{id}.xml.rels', 'xl/drawings/drawing{id}.xml', 'xl/drawings/_rels/drawing{id}.xml.rels'];
function validateFeature(feature) {
  if (feature.files && feature.files.transform) {
    for (var _i = 0, _Object$keys = Object.keys(feature.files.transform); _i < _Object$keys.length; _i++) {
      var key = _Object$keys[_i];
      if (TRANSFORMABLE_FILES.indexOf(key) < 0) {
        throw new Error("Unknown file to transform: ".concat(key));
      }
    }
  }
}
//# sourceMappingURL=getFeatures.js.map