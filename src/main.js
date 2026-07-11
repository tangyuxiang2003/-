const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("node:path");
const fsp = require("node:fs/promises");
const crypto = require("node:crypto");
const writeXlsxFile = require("write-excel-file/node");

const CLOUD_URL = "https://yun.139.com/w/#/main";

function createWindow() {
  const win = new BrowserWindow({
    width: 1480,
    height: 920,
    minWidth: 1180,
    minHeight: 720,
    title: "移动云盘批量上传工具",
    backgroundColor: "#f6f7f9",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true
    }
  });

  win.loadFile(path.join(__dirname, "index.html"));
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

function idForPath(filePath) {
  return crypto.createHash("sha1").update(filePath).digest("hex").slice(0, 16);
}

async function statPath(filePath) {
  const stats = await fsp.stat(filePath);
  const name = path.basename(filePath);

  if (stats.isDirectory()) {
    const files = await listFilesRecursive(filePath);
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    return {
      id: idForPath(filePath),
      kind: "folder",
      name,
      path: filePath,
      size: totalSize,
      fileCount: files.length,
      files
    };
  }

  return {
    id: idForPath(filePath),
    kind: "file",
    name,
    path: filePath,
    size: stats.size,
    fileCount: 1,
    files: [{
      name,
      path: filePath,
      relativePath: name,
      size: stats.size
    }]
  };
}

async function listFilesRecursive(rootPath) {
  const results = [];

  async function walk(currentPath, relativeBase) {
    const entries = await fsp.readdir(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(currentPath, entry.name);
      const relativePath = path.join(relativeBase, entry.name);
      if (entry.isDirectory()) {
        await walk(entryPath, relativePath);
      } else if (entry.isFile()) {
        const stats = await fsp.stat(entryPath);
        results.push({
          name: entry.name,
          path: entryPath,
          relativePath,
          size: stats.size
        });
      }
    }
  }

  await walk(rootPath, "");
  return results;
}

ipcMain.handle("app:get-start-url", () => CLOUD_URL);

ipcMain.handle("local:choose-files", async () => {
  const result = await dialog.showOpenDialog({
    title: "选择要上传的文件",
    properties: ["openFile", "multiSelections"]
  });
  if (result.canceled) return [];
  return Promise.all(result.filePaths.map(statPath));
});

ipcMain.handle("local:choose-folders", async () => {
  const result = await dialog.showOpenDialog({
    title: "选择要上传的文件夹",
    properties: ["openDirectory", "multiSelections"]
  });
  if (result.canceled) return [];
  return Promise.all(result.filePaths.map(statPath));
});

ipcMain.handle("local:read-file-payload", async (_event, filePath) => {
  const stats = await fsp.stat(filePath);
  if (!stats.isFile()) {
    throw new Error("只能读取文件，不能直接读取文件夹。");
  }

  const maxBytes = 80 * 1024 * 1024;
  if (stats.size > maxBytes) {
    throw new Error(`文件超过单次上传限制：${path.basename(filePath)}。请拆分或使用网页原生上传。`);
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeMap = {
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".pdf": "application/pdf",
    ".txt": "text/plain",
    ".csv": "text/csv",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".zip": "application/zip",
    ".rar": "application/vnd.rar",
    ".7z": "application/x-7z-compressed"
  };

  return {
    name: path.basename(filePath),
    path: filePath,
    size: stats.size,
    mime: mimeMap[ext] || "application/octet-stream",
    b64: (await fsp.readFile(filePath)).toString("base64")
  };
});

ipcMain.handle("report:export-xlsx", async (_event, rows) => {
  const result = await dialog.showSaveDialog({
    title: "导出上传清单",
    defaultPath: `移动云盘上传清单-${new Date().toISOString().slice(0, 10)}.xlsx`,
    filters: [{ name: "Excel 工作簿", extensions: ["xlsx"] }]
  });
  if (result.canceled || !result.filePath) return { canceled: true };

  const headerStyle = {
    fontWeight: "bold",
    backgroundColor: "#EAF1FF"
  };
  const columns = [
    ["目标共享群", "groupName", 28],
    ["目标路径", "targetPath", 46],
    ["本地路径", "localPath", 56],
    ["上传后云端路径", "cloudPath", 56],
    ["类型", "kind", 12],
    ["大小", "size", 14],
    ["状态", "status", 14],
    ["失败/跳过原因", "reason", 34],
    ["完成时间", "completedAt", 22]
  ];
  const data = [
    columns.map(([title]) => ({ value: title, ...headerStyle })),
    ...rows.map((row) => columns.map(([, key]) => ({ value: row[key] ?? "" })))
  ];

  await writeXlsxFile(data, {
    columns: columns.map(([, , width]) => ({ width }))
  }).toFile(result.filePath);

  const stats = await fsp.stat(result.filePath);
  if (!stats.isFile() || stats.size === 0) {
    throw new Error("Export failed: output file was not created.");
  }

  return { canceled: false, filePath: result.filePath };
});
