"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = writeXlsxFile;
var _writeXlsxFileUniversal = require("./writeXlsxFileUniversal.js");
var _convertFileContentToUint8ArrayBrowser = _interopRequireDefault(require("./convertFileContentToUint8ArrayBrowser.js"));
var _downloadBlob = _interopRequireDefault(require("./downloadBlob.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
// Uses an "async" function of the zipper function
// just because it feels more correct to use it over the "sync" one
// because it isn't supposed to ever freeze the "main thread" (GUI).
//
// import { generateXlsxFileSync } from './writeXlsxFileUniversal.js'

// This function doesn't use `async`/`await` in order to avoid adding `@babel/runtime` to `dependencies`.
// https://gitlab.com/catamphetamine/write-excel-file/-/issues/105

/**
 * Creates an `*.xlsx` file.
 * @param {SheetData|Object[]|Sheet[]} arg1
 * @param {object} arg2 — If `arg1` is `SheetData`, `arg2` is `SheetOptions` and `arg3` is `Options`. If `arg1` is `Sheet[]`, `arg2` is `Options`.
 * @param {object} [arg3] — If `arg1` is `SheetData`, `arg2` is `SheetOptions` and `arg3` is `Options`. If `arg1` is `Sheet[]`, `arg2` is `Options`.
 * @returns {object} Returns an object with `async` methods: `toBlob()`, `toFile(fileName)`.
 */
function writeXlsxFile(arg1, arg2, arg3) {
  var createBlob = function createBlob() {
    return (0, _writeXlsxFileUniversal.generateXlsxFileAsync)(arg1, arg2, arg3, _convertFileContentToUint8ArrayBrowser["default"]);
  };
  return {
    toBlob: function toBlob() {
      return createBlob();
    },
    toFile: function toFile(fileName) {
      return createBlob().then(function (blob) {
        (0, _downloadBlob["default"])(blob, fileName);
      });
    }
  };
}
//# sourceMappingURL=writeXlsxFileBrowser.js.map