"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = generateColumnsDescription;
var _column = _interopRequireDefault(require("./column.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function generateColumnsDescription(tag, columns) {
  // If column options are specified.
  if (columns) {
    // `cols` format is described here:
    // https://msdn.microsoft.com/en-us/library/office/documentformat.openxml.spreadsheet.columns.aspx
    var columnsXml = columns.map(function (column, index) {
      return (0, _column["default"])(tag, column, index);
    }).join('');

    // If any column has any custom properties, create a `<cols/>` element.
    // An empty `<cols></cols>` element would produce an error in some versions of Excel.
    // https://gitlab.com/catamphetamine/write-excel-file/-/issues/6
    if (columnsXml) {
      return tag('cols', null, columnsXml);
    }
  }

  // Return an empty string rather than an empty `<cols></cols>` element.
  // An empty `<cols></cols>` element would produce an error in some versions of Excel.
  // https://gitlab.com/catamphetamine/write-excel-file/-/issues/6
  return '';
}
//# sourceMappingURL=columns.js.map