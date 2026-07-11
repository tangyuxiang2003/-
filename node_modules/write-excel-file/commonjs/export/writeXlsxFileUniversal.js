"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = writeXlsxFile;
exports.generateXlsxFileAsync = generateXlsxFileAsync;
exports.generateXlsxFileSync = generateXlsxFileSync;
var _convertFileContentToUint8ArrayUniversal = _interopRequireDefault(require("./convertFileContentToUint8ArrayUniversal.js"));
var _zipToArrayBuffer = _interopRequireDefault(require("../zip/zipToArrayBuffer.js"));
var _zipToArrayBufferSync = _interopRequireDefault(require("../zip/zipToArrayBufferSync.js"));
var _convertFilesContentToUint8Arrays = _interopRequireDefault(require("./convertFilesContentToUint8Arrays.js"));
var _generateXlsxFileContents = _interopRequireDefault(require("../xlsx/generateXlsxFileContents.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
// This function doesn't use `async`/`await` in order to avoid adding `@babel/runtime` to `dependencies`.
// https://gitlab.com/catamphetamine/write-excel-file/-/issues/105

/**
 * Creates an `*.xlsx` file.
 * @param {SheetData|Object[]|Sheet[]} arg1
 * @param {object} arg2 — If `arg1` is `SheetData`, `arg2` is `SheetOptions` and `arg3` is `Options`. If `arg1` is `Sheet[]`, `arg2` is `Options`.
 * @param {object} [arg3] — If `arg1` is `SheetData`, `arg2` is `SheetOptions` and `arg3` is `Options`. If `arg1` is `Sheet[]`, `arg2` is `Options`.
 * @returns {object} Returns an object with `async` methods: `toBlob()`.
 */
function writeXlsxFile(arg1, arg2, arg3) {
  return {
    toBlob: function toBlob() {
      return generateXlsxFileAsync(arg1, arg2, arg3, _convertFileContentToUint8ArrayUniversal["default"]);
    }
  };
}

/**
 * @return {Promise<Blob>}
 */
function generateXlsxFile(arg1, arg2, arg3, convertFileContentToUint8Array, createZipArchiveAsArrayBuffer, isAsyncZip) {
  // Generate the sub-files inside the `.xlsx` file.
  var files = (0, _generateXlsxFileContents["default"])(arg1, arg2, arg3);

  // Convert files' content to `Uint8Array`s.
  return (0, _convertFilesContentToUint8Arrays["default"])(files, convertFileContentToUint8Array).then(function (files) {
    // Create a `.zip` archive from the files.
    // An `.xlsx` file is just a `.zip` archive with an `.xlsx` file extension.
    // `result` is either `Uint8Array` or `Promise<Uint8Array>`
    var result = createZipArchiveAsArrayBuffer(files);
    // Return a `Blob` with the `.zip` archive data.
    if (isAsyncZip) {
      return result.then(function (result) {
        return convertArrayBufferToBlob(result);
      });
    } else {
      return convertArrayBufferToBlob(result);
    }
  });
}

// Converts `ArrayBuffer` to `Blob`.
function convertArrayBufferToBlob(arrayBuffer) {
  return new Blob([arrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
}

/**
 * Generates an *.xlsx file "synchronously".
 * @return {Promise<Blob>}
 */
function generateXlsxFileSync(arg1, arg2, arg3, convertFileContentToUint8Array) {
  return generateXlsxFile(arg1, arg2, arg3, convertFileContentToUint8Array, _zipToArrayBufferSync["default"], false);
}

/**
 * Generates an *.xlsx file "asynchronously".
 * @return {Promise<Blob>}
 */
function generateXlsxFileAsync(arg1, arg2, arg3, convertFileContentToUint8Array) {
  return generateXlsxFile(arg1, arg2, arg3, convertFileContentToUint8Array, _zipToArrayBuffer["default"], true);
}
//# sourceMappingURL=writeXlsxFileUniversal.js.map