const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("cloudTool", {
  getStartUrl: () => ipcRenderer.invoke("app:get-start-url"),
  chooseFiles: () => ipcRenderer.invoke("local:choose-files"),
  chooseFolders: () => ipcRenderer.invoke("local:choose-folders"),
  readFilePayload: (filePath) => ipcRenderer.invoke("local:read-file-payload", filePath),
  exportReport: (rows) => ipcRenderer.invoke("report:export-xlsx", rows)
});
