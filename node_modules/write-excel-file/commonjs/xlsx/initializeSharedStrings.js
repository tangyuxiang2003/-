"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = initializeSharedStrings;
function initializeSharedStrings() {
  var sharedStrings = [];
  var sharedStringIdByString = {};
  return {
    getSharedStrings: function getSharedStrings() {
      return sharedStrings;
    },
    findOrCreateSharedString: function findOrCreateSharedString(string) {
      var id = sharedStringIdByString[string];
      if (id === undefined) {
        id = sharedStrings.length;
        sharedStringIdByString[string] = id;
        sharedStrings.push(string);
      }
      return id;
    }
  };
}
//# sourceMappingURL=initializeSharedStrings.js.map