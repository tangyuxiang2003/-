"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = convertFileContentToUint8Array;
var _nodeStream = _interopRequireDefault(require("node:stream"));
var _nodeBuffer = require("node:buffer");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
// This function doesn't use `async`/`await` in order to avoid adding `@babel/runtime` to `dependencies`.
// https://gitlab.com/catamphetamine/write-excel-file/-/issues/105

/**
 * Converts file content to a `Uint8Array`.
 * @param {Stream|Buffer|Blob} fileContent
 * @returns {Promise<Uint8Array>}
 */
function convertFileContentToUint8Array(fileContent) {
  if (fileContent instanceof _nodeStream["default"]) {
    return streamToUint8Array(fileContent);
  }
  if (fileContent instanceof _nodeBuffer.Blob) {
    return blobToUint8Array(fileContent);
  }
  if (fileContent instanceof _nodeBuffer.Buffer) {
    // `Buffer` is an instance of `Uint8Array`.
    return Promise.resolve(fileContent);
  }
  throw new Error('Unsupported file content type. Expected a `Stream`, a `Blob` or a `Buffer`');
}
function streamToUint8Array(stream) {
  return new Promise(function (resolve, reject) {
    var chunks = [];
    stream.on('data', function (chunk) {
      chunks.push(chunk);
    });
    stream.on('end', function () {
      // `Buffer` is a subclass of `Uint8Array`
      resolve(_nodeBuffer.Buffer.concat(chunks));
    });
    stream.on('error', reject);
  });
}
function blobToUint8Array(blob) {
  return blob.arrayBuffer().then(function (arrayBuffer) {
    return new Uint8Array(arrayBuffer);
  });
}
//# sourceMappingURL=convertFileContentToUint8ArrayNode.js.map