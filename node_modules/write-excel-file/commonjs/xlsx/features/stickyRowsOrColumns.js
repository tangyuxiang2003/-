"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _findElement = _interopRequireDefault(require("../../xml/findElement.js"));
var _replaceElement = _interopRequireDefault(require("../../xml/replaceElement.js"));
var _prependMarkupInsideElement = _interopRequireDefault(require("../../xml/prependMarkupInsideElement.js"));
var _appendMarkupInsideElement = _interopRequireDefault(require("../../xml/appendMarkupInsideElement.js"));
var _getOpeningTagMarkup = _interopRequireDefault(require("../../xml/getOpeningTagMarkup.js"));
var _getClosingTagMarkup = _interopRequireDefault(require("../../xml/getClosingTagMarkup.js"));
var _getSelfClosingTagMarkup = _interopRequireDefault(require("../../xml/getSelfClosingTagMarkup.js"));
var _findElementInsideElement = _interopRequireDefault(require("../../xml/findElementInsideElement.js"));
var _insertElementMarkupAccordingToOrderOfSiblings = _interopRequireDefault(require("../../xml/insertElementMarkupAccordingToOrderOfSiblings.js"));
var _getCellAddress = _interopRequireDefault(require("../helpers/getCellAddress.js"));
var _getOrderOfSiblings = _interopRequireDefault(require("../helpers/getOrderOfSiblings.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var _default = exports["default"] = {
  files: {
    transform: {
      'xl/worksheets/sheet{id}.xml': {
        transform: function transform(xml, sheetOptions, _ref) {
          var sheetIndex = _ref.sheetIndex,
            sheetId = _ref.sheetId;
          if (hasStickyRowsOrColumns(sheetOptions)) {
            var stickyRowsCount = sheetOptions.stickyRowsCount,
              stickyColumnsCount = sheetOptions.stickyColumnsCount;
            var paneAttributes = {
              // The vertical position of the split, in 1/20th of a point (twips),
              // or, when frozen, the number of visible rows in the top pane(s).
              ySplit: stickyRowsCount || 0,
              // The horizontal position of the split, in 1/20th of a point (twips),
              // or, when frozen, the number of visible columns in the left pane(s).
              xSplit: stickyColumnsCount || 0,
              // The visible cell in the top-left corner of the bottom-right pane.
              topLeftCell: (0, _getCellAddress["default"])(stickyRowsCount || 0, stickyColumnsCount || 0),
              // `activePane` defines which pane is active in a "split" or "frozen" `state`.
              // Possible values: "bottomLeft", "bottomRight", "topLeft", "topRight".
              activePane: 'bottomRight',
              // `state: "frozen"` indicates that the panes are frozen, meaning the split area
              // (usually top rows or leftmost columns) remains fixed while the rest of the sheet scrolls.
              // Other possible values:
              // "split" — Indicates that the window is split into separate panes that can be scrolled independently, but are not locked in place.
              // "frozenSplit" — A combination used in specific scenarios (often by Excel itself) to manage complex freezing.
              state: 'frozen'
            };
            var sheetViewElement = (0, _findElement["default"])(xml, 'sheetView');
            if (sheetViewElement) {
              // Add a `<pane/>` element inside the `<sheetView/>` element.
              // If a `<pane/>` element already exists, it will overwrite it.
              var paneElement = (0, _findElementInsideElement["default"])(xml, 'pane', sheetViewElement);
              var paneXml = (0, _getSelfClosingTagMarkup["default"])('pane', paneAttributes);
              if (paneElement) {
                // Overwrite the existing `<pane/>` element.
                // It doesn't seem to be any sense in patching the existing `<pane/>` element
                // because all of its properties would be rewritten anyway in the process.
                xml = (0, _replaceElement["default"])(xml, paneElement, paneXml);
              } else {
                // Add a `<pane/>` element.
                xml = (0, _appendMarkupInsideElement["default"])(xml, sheetViewElement, paneXml);
              }
            } else {
              // Add a `<sheetViews/>` element.
              // It isn't supposed to exist when no `<sheetView/>` element is present.
              var sheetViewsElement = (0, _findElement["default"])(xml, 'sheetViews');
              if (sheetViewsElement) {
                throw new Error("xl/worksheets/sheet".concat(sheetId, ".xml: <sheetViews/> element exists but it doesn't contain any <sheetView/> elements"));
              }
              var sheetViewAttributes = {
                tabSelected: sheetIndex === 0 ? 1 : 0,
                // The first sheet is selected by default.
                workbookViewId: 0
              };
              var sheetViewsXml = (0, _getOpeningTagMarkup["default"])('sheetViews') + (0, _getOpeningTagMarkup["default"])('sheetView', sheetViewAttributes) + (0, _getSelfClosingTagMarkup["default"])('pane', paneAttributes) + (0, _getClosingTagMarkup["default"])('sheetView', sheetViewAttributes) + (0, _getClosingTagMarkup["default"])('sheetViews');

              // Add a `<sheetViews/>` element with a child '<sheetView/>` element with a child `<pane/>` element.
              // For some reason, Excel 2007 demands `<sheetViews/>` element to be the first one in a `<worksheet/>` element.
              var worksheetElement = (0, _findElement["default"])(xml, 'worksheet');
              xml = (0, _prependMarkupInsideElement["default"])(xml, worksheetElement, sheetViewsXml);
            }
          }
          return xml;
        }
      },
      'xl/workbook.xml': {
        transform: function transform(xml, sheetsOptions) {
          // If "sticky rows" or "sticky columns" feature is used, there must exist a `<workbookView/>` element
          // because it will be referenced when configuring those "sticky rows" or "sticky columns".
          if (sheetsOptions.some(hasStickyRowsOrColumns)) {
            // Find a `<workbookView/>` element.
            // It is required to exist because it is referenced as `workbookViewId="0"`
            // attribute in `<sheetViews/>` element in `xl/worksheets/sheet{id}.xml` file.
            var workbookViewElement = (0, _findElement["default"])(xml, 'workbookView');
            if (!workbookViewElement) {
              // `<workbookView/>` element doesn't exist, so it should be created.
              // The parent element for it should be `<bookViews/>`.
              var bookViewsElement = (0, _findElement["default"])(xml, 'bookViews');
              if (bookViewsElement) {
                throw new Error("xl/workbook.xml: <bookViews/> element exists but it doesn't contain any <workbookView/> elements");
              }
              // Add a `<bookViews/>` element with a child '<workbookView/>` element.
              // For some reason, Excel 2007 demands `<bookViews/>` element to go before `<sheets/>` element.
              // And `<sheets/>` element always exists.
              return (0, _insertElementMarkupAccordingToOrderOfSiblings["default"])(xml, '<bookViews><workbookView/></bookViews>', (0, _getOrderOfSiblings["default"])('xl/workbook.xml', 'workbook'), 'workbook');
            }
          }
          return xml;
        }
      }
    }
  }
};
function hasStickyRowsOrColumns(sheetOptions) {
  return Boolean(sheetOptions.stickyRowsCount) || Boolean(sheetOptions.stickyColumnsCount);
}
//# sourceMappingURL=stickyRowsOrColumns.js.map