"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = applyEnclosingElementOffset;
function applyEnclosingElementOffset(element, enclosingElement) {
  var enclosingElementOffset = enclosingElement.openingTagEndIndex + 1;
  element.openingTagStartIndex += enclosingElementOffset;
  element.openingTagEndIndex += enclosingElementOffset;
  if (!element.selfClosingTag) {
    element.closingTagStartIndex += enclosingElementOffset;
    element.closingTagEndIndex += enclosingElementOffset;
  }
}
//# sourceMappingURL=applyEnclosingElementOffset.js.map