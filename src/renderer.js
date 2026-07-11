const state = {
  localItems: [],
  targets: [],
  results: [],
  uploading: false
};

const $ = (selector) => document.querySelector(selector);

const els = {
  webview: $("#cloud-webview"),
  cloudStatus: $("#cloud-status"),
  cloudUrl: $("#cloud-url"),
  refreshCloud: $("#refresh-cloud"),
  chooseFiles: $("#choose-files"),
  chooseFolders: $("#choose-folders"),
  addTargets: $("#add-targets"),
  startUpload: $("#start-upload"),
  exportReport: $("#export-report"),
  localSummary: $("#local-summary"),
  targetSummary: $("#target-summary"),
  resultSummary: $("#result-summary"),
  localList: $("#local-list"),
  targetList: $("#target-list"),
  resultList: $("#result-list"),
  modal: $("#confirm-modal"),
  confirmLocal: $("#confirm-local"),
  confirmTargets: $("#confirm-targets"),
  cancelUpload: $("#cancel-upload"),
  confirmUpload: $("#confirm-upload")
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatSize(bytes) {
  if (!Number.isFinite(bytes)) return "";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function uniqById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function targetId(target) {
  return [
    target.parentUrl,
    target.groupName,
    target.parentPath,
    target.folderName,
    target.cloudId || ""
  ].join("|");
}

function formatTargetDisplayPath(parts) {
  return parts
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join("/");
}

function render() {
  renderLocalItems();
  renderTargets();
  renderResults();
  const canUpload = state.localItems.length > 0 && state.targets.length > 0 && !state.uploading;
  els.startUpload.disabled = !canUpload;
  els.exportReport.disabled = state.results.length === 0;
}

function renderLocalItems() {
  const count = state.localItems.length;
  const totalFiles = state.localItems.reduce((sum, item) => sum + item.fileCount, 0);
  els.localSummary.textContent = count ? `${count} 项，${totalFiles} 个文件` : "未选择";

  if (!count) {
    els.localList.className = "list empty";
    els.localList.textContent = "暂无本地内容";
    return;
  }

  els.localList.className = "list";
  els.localList.innerHTML = state.localItems.map((item) => `
    <div class="item">
      <div class="item-main">
        <div class="item-name">${escapeHtml(item.kind === "folder" ? `文件夹：${item.name}` : item.name)}</div>
        <div class="item-meta">${escapeHtml(item.path)} · ${item.fileCount} 个文件 · ${formatSize(item.size)}</div>
      </div>
      <button class="remove-button" data-remove-local="${escapeHtml(item.id)}" title="移除">移除</button>
    </div>
  `).join("");
}

function renderTargets() {
  els.targetSummary.textContent = `${state.targets.length} 个`;

  if (!state.targets.length) {
    els.targetList.className = "list empty";
    els.targetList.textContent = "暂无目标文件夹";
    return;
  }

  els.targetList.className = "list";
  els.targetList.innerHTML = state.targets.map((target) => `
    <div class="item">
      <div class="item-main">
        <div class="item-name">${escapeHtml(target.displayPath)}</div>
        <div class="item-meta">${escapeHtml(target.parentUrl)}</div>
      </div>
      <button class="remove-button" data-remove-target="${escapeHtml(target.id)}" title="删除目标">删除</button>
    </div>
  `).join("");
}

function renderResults() {
  const success = state.results.filter((row) => row.status === "成功").length;
  const skipped = state.results.filter((row) => row.status === "跳过").length;
  const failed = state.results.filter((row) => row.status === "失败").length;
  els.resultSummary.textContent = state.results.length
    ? `成功 ${success}，跳过 ${skipped}，失败 ${failed}`
    : "等待上传";

  if (!state.results.length) {
    els.resultList.className = "list result-list empty";
    els.resultList.textContent = "暂无上传记录";
    return;
  }

  els.resultList.className = "list result-list";
  els.resultList.innerHTML = state.results.map((row) => {
    const className = row.status === "成功" ? "success" : row.status === "跳过" ? "skipped" : row.status === "失败" ? "failed" : "";
    const reason = row.reason || "";
    const tooltip = row.status === "失败" && reason ? `失败原因：${reason}` : "";
    return `
      <div class="item result-item"${tooltip ? ` data-tooltip="${escapeHtml(tooltip)}"` : ""}>
        <div class="item-main">
          <div class="item-name">${escapeHtml(row.cloudPath || row.localPath)}</div>
          <div class="item-meta">${escapeHtml(row.targetPath)} · ${escapeHtml(reason)}</div>
        </div>
        <span class="status ${className}">${escapeHtml(row.status)}</span>
      </div>
    `;
  }).join("");
}

function addResult(row) {
  state.results.unshift({
    completedAt: new Date().toLocaleString(),
    ...row
  });
  render();
}

function setBusy(value) {
  state.uploading = value;
  els.chooseFiles.disabled = value;
  els.chooseFolders.disabled = value;
  els.addTargets.disabled = value;
  els.confirmUpload.disabled = value;
  els.cancelUpload.disabled = value;
  render();
}

function cloudEval(fn, ...args) {
  const source = `(${fn})(${args.map((arg) => JSON.stringify(arg)).join(",")})`;
  return els.webview.executeJavaScript(source, true);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForWebviewLoad(timeoutMs = 12000) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      els.webview.removeEventListener("did-stop-loading", finish);
      resolve();
    };
    const timer = setTimeout(finish, timeoutMs);
    els.webview.addEventListener("did-stop-loading", finish, { once: true });
  });
}

async function waitForCloudIdle(extraDelay = 900) {
  await wait(extraDelay);
}

function getPageSelectionScript() {
  const visibleText = (el) => (el?.innerText || el?.textContent || "").replace(/\s+/g, " ").trim();
  const isVisible = (el) => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
  };
  const bodyText = visibleText(document.body);
  const inSharedGroup = bodyText.includes("共享群") || location.href.includes("group");

  const selectedCount = Number((bodyText.match(/已选择\s*(\d+)\s*项/) || [])[1] || 0);
  const cleanText = (text) => String(text || "").replace(/\s+/g, " ").trim();
  const isBlue = (value) => /rgb\(\s*(2[0-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9])\s*,\s*(9[0-9]|1[0-5][0-9])\s*,\s*(18[0-9]|19[0-9]|2[0-5][0-9])\s*\)|#(2d7dff|2563eb|3b82f6|409eff)/i.test(value || "");
  const parseRgb = (value) => {
    const match = String(value || "").match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    return match ? { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) } : null;
  };
  const isSelectedTint = (value) => {
    const rgb = parseRgb(value);
    return Boolean(rgb && rgb.b >= 220 && rgb.g >= 220 && rgb.r >= 205 && rgb.b - rgb.r >= 8);
  };
  const getClassName = (el) => {
    const raw = el?.className;
    return String(typeof raw === "object" && raw ? raw.baseVal || raw.value || "" : raw || "").toLowerCase();
  };
  const hasSelectedClass = (el) => /checked|selected|is-check|is-select|is_checked|is_selected/.test(getClassName(el));
  const hasMarkerStateClass = (el) => /checked|selected|active|is-check|is-select|is_checked|is_selected/.test(getClassName(el));
  const markerLooksChecked = (el) => {
    const style = window.getComputedStyle(el);
    const markerText = visibleText(el);
    const markerStyle = `${style.color} ${style.backgroundColor} ${style.borderColor} ${style.fill} ${style.stroke} ${getClassName(el)}`;
    return el.matches("input[type='checkbox']:checked,[aria-checked='true'],[aria-selected='true']")
      || /✓|√|✔/.test(markerText)
      || ((el.getAttribute("role") === "checkbox" || /checkbox|check/.test(getClassName(el))) && (hasMarkerStateClass(el) || isBlue(markerStyle)));
  };
  const isNoise = (text) => {
    const value = cleanText(text);
    if (!value) return true;
    if (/^已选择\s*\d+\s*项/.test(value)) return true;
    if (/^共\s*\d+\s*项$/.test(value)) return true;
    if (/^\d+$/.test(value)) return true;
    if (/^\d{3}\*+\d{4}$/.test(value)) return true;
    if (/^\d+(\.\d+)?\s*(B|KB|MB|GB)$/i.test(value)) return true;
    if (/^\d+(\.\d+)?[MGK]?$/.test(value)) return true;
    if (/今天|昨天|\d{1,2}:\d{2}/.test(value)) return true;
    if (/云空间|我的文件|全部|文档|图片|视频|传输列表|保险箱|分享|回收站|搜索/.test(value)) return true;
    return ["文件名", "创建者", "修改时间", "大小", "上传", "下载", "转存", "删除", "更多"].includes(value);
  };
  const allVisible = Array.from(document.querySelectorAll("body *")).filter(isVisible);
  const headerNodes = allVisible
    .map((el) => ({ el, text: visibleText(el), rect: el.getBoundingClientRect() }))
    .filter((item) => ["文件名", "创建者", "修改时间", "大小"].includes(item.text));
  const fileNameHeader = headerNodes.find((item) => item.text === "文件名");
  const listTop = fileNameHeader ? fileNameHeader.rect.bottom : 0;
  const listLeft = fileNameHeader ? Math.max(0, fileNameHeader.rect.left - 90) : Math.max(0, window.innerWidth * 0.25);

  const getUsefulText = (el) => {
    const title = cleanText(el.getAttribute?.("title"));
    const aria = cleanText(el.getAttribute?.("aria-label"));
    const text = cleanText(visibleText(el));
    return [title, aria, text].find((value) => value && !isNoise(value)) || text;
  };
  const pathTextItems = allVisible
    .map((el) => ({ el, text: getUsefulText(el), rect: el.getBoundingClientRect() }))
    .filter((item) => item.text && item.text.length <= 120)
    .filter((item) => item.rect.top < Math.max(listTop, 220))
    .filter((item) => item.rect.left >= listLeft - 40);
  const shareItemIndex = pathTextItems.findIndex((item) => item.text.includes("共享群"));
  const pathParts = (shareItemIndex >= 0 ? pathTextItems.slice(shareItemIndex + 1, shareItemIndex + 6) : pathTextItems)
    .flatMap((item) => item.text.split(/>|\/|\\/).map(cleanText))
    .filter(Boolean)
    .filter((part) => !isNoise(part))
    .filter((part) => !/^共享群组?$/.test(part))
    .filter((part, index, arr) => arr.indexOf(part) === index);
  const groupName = pathParts[0] || "共享群";
  const parentFolders = pathParts.slice(1).filter((part) => part !== groupName);
  const parentPath = parentFolders.join("/");

  const rowSelector = "tr,[role='row'],li,.file-item,.list-item,[class*='row' i],[class*='item' i],[class*='file' i]";
  const possibleRows = Array.from(document.querySelectorAll(rowSelector))
    .filter(isVisible)
    .map((row) => ({ row, rect: row.getBoundingClientRect(), text: visibleText(row) }))
    .filter((item) => item.rect.top > listTop - 8 && item.rect.left >= listLeft - 80)
    .filter((item) => item.rect.height >= 28 && item.rect.height <= 130 && item.rect.width >= 240)
    .filter((row) => {
      if (!row.text || row.text.includes("文件名") || row.text.includes("创建者") || row.text.includes("修改时间")) return false;
      return row.row.querySelector("[class*='folder' i], img[src*='folder' i], svg")
        || /今天|昨天|\d{1,2}:\d{2}|-/.test(row.text);
    })
    .sort((a, b) => a.rect.top - b.rect.top);

  const extractFolderName = (row) => {
    const rawText = visibleText(row.row);
    const smallTexts = Array.from(row.row.querySelectorAll("span,a,div,p"))
      .filter(isVisible)
      .map(getUsefulText)
      .filter(Boolean)
      .map(cleanText)
      .filter((text, index, arr) => arr.indexOf(text) === index)
      .filter((text) => text.length <= 80)
      .filter((text) => !/\*{3,}/.test(text))
      .filter((text) => !isNoise(text));
    const afterIcon = smallTexts.find((text) => !/\.(docx?|xlsx?|pptx?|pdf|txt|csv|zip|rar|7z)$/i.test(text));
    if (afterIcon) return afterIcon.replace(/^已选择\s*/, "").trim();
    return rawText
      .replace(/^已选择\s*\d+\s*项\s*/, "")
      .replace(/\s+\d{3}\*+\d{4}.*$/, "")
      .replace(/\s+今天.*$/, "")
      .replace(/\s+昨天.*$/, "")
      .trim();
  };

  const checkedMarkers = allVisible
    .map((el) => ({ el, rect: el.getBoundingClientRect() }))
    .filter((item) => item.rect.top > listTop - 12 && item.rect.left >= listLeft - 130)
    .filter((item) => item.rect.width >= 8 && item.rect.width <= 42 && item.rect.height >= 8 && item.rect.height <= 42)
    .filter((item) => markerLooksChecked(item.el));

  const rowLooksSelected = (item) => {
    const row = item.row;
    const rowRect = item.rect;
    if (row.getAttribute("aria-selected") === "true" || row.getAttribute("aria-checked") === "true") return true;
    if (hasSelectedClass(row)) return true;
    return [row, ...Array.from(row.querySelectorAll("div,li,tr,[role='row']"))]
      .filter(isVisible)
      .some((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width < Math.min(160, rowRect.width * 0.45)) return false;
        if (rect.bottom < rowRect.top + 8 || rect.top > rowRect.bottom - 8) return false;
        return isSelectedTint(window.getComputedStyle(el).backgroundColor);
      });
  };

  const isRowChecked = (item) => {
    const row = item.row;
    const rowRect = item.rect;
    if (selectedCount > 0 && rowLooksSelected(item)) return true;
    const folderIcon = Array.from(row.querySelectorAll("svg,img,i,span,div"))
      .filter(isVisible)
      .map((el) => ({ el, rect: el.getBoundingClientRect(), style: window.getComputedStyle(el) }))
      .filter((part) => part.rect.width >= 16 && part.rect.width <= 54 && part.rect.height >= 16 && part.rect.height <= 54)
      .find((part) => part.rect.left > rowRect.left + 18 && isBlue(`${part.style.color} ${part.style.backgroundColor} ${part.style.fill}`));
    const maxMarkerLeft = folderIcon ? folderIcon.rect.left : rowRect.left + 90;
    const hasInlineMarker = Array.from(row.querySelectorAll("input,svg,path,span,i,div"))
      .filter(isVisible)
      .some((el) => {
        const rect = el.getBoundingClientRect();
        if (Math.abs((rect.top + rect.height / 2) - (rowRect.top + rowRect.height / 2)) > Math.max(22, rowRect.height / 2)) return false;
        if (rect.left < rowRect.left - 110 || rect.left > maxMarkerLeft - 2) return false;
        if (rect.width < 8 || rect.width > 38 || rect.height < 8 || rect.height > 38) return false;
        return markerLooksChecked(el);
      });
    if (hasInlineMarker) return true;
    return checkedMarkers.some((marker) => {
      const rect = marker.rect;
      if (Math.abs((rect.top + rect.height / 2) - (rowRect.top + rowRect.height / 2)) > Math.max(22, rowRect.height / 2)) return false;
      return rect.left >= rowRect.left - 130 && rect.left <= rowRect.left + 110;
    });
  };

  const checkedRows = possibleRows
    .map((item) => ({ ...item, folderName: cleanText(extractFolderName(item)) }))
    .filter((item) => item.folderName && !isNoise(item.folderName))
    .filter(isRowChecked)
    .filter((item, index, arr) => arr.findIndex((other) => other.folderName === item.folderName) === index);

  const debug = {
    expectedCount: selectedCount,
    recognizedCount: checkedRows.length,
    recognizedNames: checkedRows.map((row) => row.folderName),
    listRows: possibleRows.map((row) => extractFolderName(row)).filter(Boolean).slice(0, 12),
    pathParts
  };

  if (selectedCount > 0 && checkedRows.length !== selectedCount) {
    return {
      ok: false,
      reason: `页面显示已选择 ${selectedCount} 项，但工具只识别到 ${checkedRows.length} 项。为避免加入错误目标，已停止。`,
      expectedCount: selectedCount,
      targets: [],
      debug
    };
  }

  const targets = checkedRows.map((item, index) => {
    const row = item.row;
    const folderName = item.folderName;
    const dataset = { ...row.dataset };
    const cloudId = dataset.id || dataset.fileid || dataset.fileId || dataset.path || row.getAttribute("data-id") || row.getAttribute("data-fileid") || "";
    return {
      folderName,
      groupName,
      parentPath,
      displayPath: [groupName, parentPath, folderName].filter(Boolean).join("/"),
      parentUrl: location.href,
      cloudId,
      rowIndex: index
    };
  }).filter((target) => target.folderName);

  return {
    ok: inSharedGroup,
    reason: inSharedGroup ? "" : "当前页面不在共享群区域。",
    url: location.href,
    title: document.title,
    groupName,
    parentPath,
    expectedCount: selectedCount,
    debug,
    targets
  };
}

function enterTargetFolderScript(target) {
  const visibleText = (el) => (el?.innerText || el?.textContent || "").replace(/\s+/g, " ").trim();
  const isVisible = (el) => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
  };
  const cleanText = (text) => String(text || "").replace(/\s+/g, " ").trim();
  const isNoise = (text) => {
    const value = cleanText(text);
    if (!value) return true;
    if (/已选择|共\s*\d+\s*项|今天|昨天|\d{1,2}:\d{2}|\*{3,}/.test(value)) return true;
    return ["文件名", "创建者", "修改时间", "大小"].includes(value);
  };
  const header = Array.from(document.querySelectorAll("span,a,div,p"))
    .filter(isVisible)
    .map((el) => ({ el, text: visibleText(el), rect: el.getBoundingClientRect() }))
    .find((item) => item.text === "文件名");
  const listTop = header ? header.rect.bottom : 0;
  const listLeft = header ? Math.max(0, header.rect.left - 90) : Math.max(0, window.innerWidth * 0.25);
  const rowSelector = "tr,[role='row'],li,.file-item,.list-item,[class*='row' i],[class*='item' i],[class*='file' i]";
  const rows = Array.from(document.querySelectorAll(rowSelector))
    .filter(isVisible)
    .map((row) => ({ row, rect: row.getBoundingClientRect(), text: visibleText(row) }))
    .filter((item) => item.rect.top > listTop - 8 && item.rect.left >= listLeft - 80)
    .filter((item) => item.rect.height >= 28 && item.rect.height <= 130 && item.rect.width >= 240)
    .filter((item) => item.text && !item.text.includes("文件名") && !item.text.includes("创建者"));
  const match = rows.find((item) => {
    const names = Array.from(item.row.querySelectorAll("span,a,div,p"))
      .filter(isVisible)
      .map((el) => cleanText(el.getAttribute("title") || el.getAttribute("aria-label") || visibleText(el)))
      .filter((text) => text && !isNoise(text));
    return names.includes(target.folderName) || cleanText(item.text).split(/\s{2,}|\n/).includes(target.folderName);
  });
  if (!match) return { ok: false, reason: `未找到目标文件夹：${target.folderName}` };
  match.row.scrollIntoView({ block: "center" });
  const clickable = Array.from(match.row.querySelectorAll("span,a,div,p"))
    .filter(isVisible)
    .find((el) => cleanText(el.getAttribute("title") || el.getAttribute("aria-label") || visibleText(el)) === target.folderName)
    || match.row;
  clickable.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
  clickable.dispatchEvent(new MouseEvent("dblclick", { bubbles: true, cancelable: true, view: window }));
  return { ok: true };
}

function getCurrentFolderInfoScript() {
  const visibleText = (el) => (el?.innerText || el?.textContent || "").replace(/\s+/g, " ").trim();
  const isVisible = (el) => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
  };
  const cleanText = (text) => String(text || "").replace(/\s+/g, " ").trim();
  const isNoise = (text) => {
    const value = cleanText(text);
    if (!value) return true;
    if (/^已选择\s*\d+\s*项$/.test(value)) return true;
    if (/^共\s*\d+\s*项$/.test(value)) return true;
    if (/^\d+$/.test(value)) return true;
    if (/^\d{3}\*+\d{4}$/.test(value)) return true;
    if (/云空间|我的文件|全部|文档|图片|视频|传输列表|保险箱|分享|回收站|搜索/.test(value)) return true;
    return ["文件名", "创建者", "修改时间", "大小", "上传", "下载", "转存", "删除", "更多"].includes(value);
  };
  const header = Array.from(document.querySelectorAll("span,a,div,p"))
    .filter(isVisible)
    .map((el) => ({ el, text: visibleText(el), rect: el.getBoundingClientRect() }))
    .find((item) => item.text === "文件名");
  const listTop = header ? header.rect.bottom : 220;
  const listLeft = header ? Math.max(0, header.rect.left - 90) : Math.max(0, window.innerWidth * 0.25);
  const breadcrumbParts = Array.from(document.querySelectorAll(".document_title_item_text, .document_title_item"))
    .filter(isVisible)
    .map((el) => cleanText(el.getAttribute("title") || el.getAttribute("aria-label") || visibleText(el)))
    .filter(Boolean)
    .filter((text) => !isNoise(text))
    .filter((text) => !/^共享群组?$/.test(text))
    .filter((text, index, arr) => arr.indexOf(text) === index);
  if (breadcrumbParts.length) {
    return {
      href: location.href,
      title: document.title,
      parts: breadcrumbParts,
      pathText: breadcrumbParts.join("/")
    };
  }

  const candidates = Array.from(document.querySelectorAll("[class*='bread' i], [class*='crumb' i], a, span, div"))
    .filter(isVisible)
    .map((el) => ({ text: cleanText(el.getAttribute("title") || el.getAttribute("aria-label") || visibleText(el)), rect: el.getBoundingClientRect() }))
    .filter((item) => item.text && item.text.length <= 120)
    .filter((item) => item.rect.top < listTop && item.rect.left >= listLeft - 40);
  const start = candidates.findIndex((item) => item.text.includes("共享群"));
  const raw = start >= 0 ? candidates.slice(start + 1, start + 7).map((item) => item.text) : candidates.map((item) => item.text);
  const parts = raw
    .flatMap((text) => text.split(/>|\/|\\/).map(cleanText))
    .filter(Boolean)
    .filter((text) => !isNoise(text))
    .filter((text) => !/^共享群组?$/.test(text))
    .filter((text, index, arr) => arr.indexOf(text) === index);
  return {
    href: location.href,
    title: document.title,
    parts,
    pathText: parts.join("/")
  };
}

function pageListEntryInfoScript(name) {
  const visibleText = (el) => (el?.innerText || el?.textContent || "").replace(/\s+/g, " ").trim();
  const isVisible = (el) => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
  };
  const cleanText = (text) => String(text || "").replace(/\s+/g, " ").trim();
  const targetName = cleanText(name);
  const isNoise = (text) => {
    const value = cleanText(text);
    if (!value) return true;
    if (/^已选择\s*\d+\s*项/.test(value)) return true;
    if (/^共\s*\d+\s*项$/.test(value)) return true;
    if (/^\d+$/.test(value)) return true;
    if (/^\d{3}\*+\d{4}$/.test(value)) return true;
    if (/^\d+(\.\d+)?\s*(B|KB|MB|GB)$/i.test(value)) return true;
    if (/今天|昨天|\d{1,2}:\d{2}/.test(value)) return true;
    if (/云空间|我的文件|全部|文档|图片|视频|传输列表|保险箱|分享|回收站|搜索/.test(value)) return true;
    return ["文件名", "创建者", "修改时间", "大小", "上传", "下载", "转存", "删除", "更多"].includes(value);
  };
  const header = Array.from(document.querySelectorAll("span,a,div,p"))
    .filter(isVisible)
    .map((el) => ({ el, text: visibleText(el), rect: el.getBoundingClientRect() }))
    .find((item) => item.text === "文件名");
  const listTop = header ? header.rect.bottom : 0;
  const listLeft = header ? Math.max(0, header.rect.left - 90) : Math.max(0, window.innerWidth * 0.25);
  const rowSelector = "tr,[role='row'],li,.file-item,.list-item,[class*='row' i],[class*='item' i],[class*='file' i]";
  const rows = Array.from(document.querySelectorAll(rowSelector))
    .filter(isVisible)
    .map((row) => ({ row, rect: row.getBoundingClientRect(), text: visibleText(row) }))
    .filter((item) => item.rect.top > listTop - 8 && item.rect.left >= listLeft - 80)
    .filter((item) => item.rect.height >= 28 && item.rect.height <= 130 && item.rect.width >= 240)
    .filter((item) => item.text && !item.text.includes("文件名") && !item.text.includes("创建者") && !item.text.includes("修改时间"));

  const extractEntryName = (item) => {
    const names = Array.from(item.row.querySelectorAll("span,a,div,p"))
      .filter(isVisible)
      .map((el) => cleanText(el.getAttribute("title") || el.getAttribute("aria-label") || visibleText(el)))
      .filter((text) => text && !isNoise(text));
    const exact = names.find((text) => text === targetName);
    if (exact) return exact;
    const preferred = names.find((text) => !/\.(docx?|xlsx?|pptx?|pdf|txt|csv|zip|rar|7z)$/i.test(text));
    if (preferred) return preferred.replace(/^已选择\s*/, "").trim();
    return cleanText(item.text)
      .replace(/^已选择\s*\d+\s*项\s*/, "")
      .replace(/\s+\d{3}\*+\d{4}.*$/, "")
      .replace(/\s+今天.*$/, "")
      .replace(/\s+昨天.*$/, "")
      .trim();
  };

  const entries = rows
    .map((item) => extractEntryName(item))
    .filter(Boolean)
    .filter((entry, index, arr) => arr.indexOf(entry) === index);
  return {
    exists: entries.includes(targetName),
    target: targetName,
    entries: entries.slice(0, 10)
  };
}

function goBackScript() {
  window.history.back();
  return { ok: true };
}

function clickParentBreadcrumbScript(target) {
  const visibleText = (el) => (el?.innerText || el?.textContent || "").replace(/\s+/g, " ").trim();
  const isVisible = (el) => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
  };
  const cleanText = (text) => String(text || "").replace(/\s+/g, " ").trim();
  const header = Array.from(document.querySelectorAll("span,a,div,p"))
    .filter(isVisible)
    .map((el) => ({ el, text: visibleText(el), rect: el.getBoundingClientRect() }))
    .find((item) => item.text === "文件名");
  const listTop = header ? header.rect.bottom : 220;
  const listLeft = header ? Math.max(0, header.rect.left - 90) : Math.max(0, window.innerWidth * 0.25);
  const parentParts = [target.groupName, target.parentPath].filter(Boolean).join("/").split("/").filter(Boolean);
  const wanted = parentParts[parentParts.length - 1] || target.groupName;
  const breadcrumbCandidate = Array.from(document.querySelectorAll(".document_title_item_text, .document_title_item"))
    .filter(isVisible)
    .map((el) => ({ el, text: cleanText(el.getAttribute("title") || el.getAttribute("aria-label") || visibleText(el)) }))
    .find((item) => item.text === wanted || item.text.includes(wanted) || wanted.includes(item.text));
  if (breadcrumbCandidate) {
    breadcrumbCandidate.el.click();
    return { ok: true, via: "breadcrumb" };
  }

  const crumbs = Array.from(document.querySelectorAll("[class*='bread' i] a,[class*='bread' i] span,[class*='bread' i] div,[class*='crumb' i] a,[class*='crumb' i] span,[class*='crumb' i] div,a,span,div"))
    .filter(isVisible)
    .map((el) => ({ el, text: cleanText(el.getAttribute("title") || el.getAttribute("aria-label") || visibleText(el)), rect: el.getBoundingClientRect() }))
    .filter((item) => item.text && item.text.length <= 120)
    .filter((item) => item.rect.top < listTop && item.rect.left >= listLeft - 40);
  const shareIndex = crumbs.findIndex((item) => item.text.includes("共享群"));
  const pathCrumbs = (shareIndex >= 0 ? crumbs.slice(shareIndex + 1) : crumbs)
    .filter((item) => item.text !== target.folderName)
    .filter((item, index, arr) => arr.findIndex((other) => other.text === item.text) === index);
  const candidate = pathCrumbs.find((item) => item.text === wanted || item.text.includes(wanted) || wanted.includes(item.text))
    || pathCrumbs[pathCrumbs.length - 1];
  if (!candidate) return { ok: false, reason: "未找到父级面包屑。" };
  candidate.el.click();
  return { ok: true };
}

function refreshCurrentFolderScript() {
  const button = Array.from(document.querySelectorAll("button,a,div,span"))
    .find((el) => /刷新/.test((el.innerText || el.textContent || "").replace(/\s+/g, "")));
  if (button) {
    button.click();
    return { ok: true, via: "button" };
  }
  location.reload();
  return { ok: true, via: "reload" };
}

function fileListReadyScript() {
  const visibleText = (el) => (el?.innerText || el?.textContent || "").replace(/\s+/g, " ").trim();
  const isVisible = (el) => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
  };
  const bodyText = visibleText(document.body);
  const hasHeader = bodyText.includes("文件名");
  const rows = Array.from(document.querySelectorAll(".document_table_list,.file-item,.list-item,tr,[role='row'],[class*='row' i],[class*='item' i],[class*='file' i]"))
    .filter(isVisible)
    .map((row) => visibleText(row))
    .filter((text) => text && !text.includes("文件名") && !text.includes("创建者") && !text.includes("修改时间"));
  return {
    ready: hasHeader && (rows.length > 0 || /暂无文件|暂无内容|共\s*0\s*项/.test(bodyText)),
    rowCount: rows.length
  };
}

async function waitForFileListReady(timeoutMs = 8000) {
  const startedAt = Date.now();
  let last = { ready: false, rowCount: 0 };
  while (Date.now() - startedAt < timeoutMs) {
    last = await cloudEval(fileListReadyScript);
    if (last.ready) return last;
    await waitForCloudIdle(500);
  }
  return last;
}

function createFolderScript(name) {
  const visibleText = (el) => (el?.innerText || el?.textContent || "").replace(/\s+/g, " ").trim();
  const isVisible = (el) => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
  };
  const clickTarget = Array.from(document.querySelectorAll("button,a,div,span"))
    .filter(isVisible)
    .find((el) => /新建文件夹|新建目录|创建文件夹|新建/.test(visibleText(el)));
  if (!clickTarget) return { ok: false, reason: "未找到新建文件夹入口。" };
  clickTarget.click();

  return new Promise((resolve) => {
    setTimeout(() => {
      const input = Array.from(document.querySelectorAll("input,textarea"))
        .filter(isVisible)
        .find((el) => !el.disabled && !el.readOnly);
      if (!input) {
        resolve({ ok: false, reason: "未找到文件夹名称输入框。" });
        return;
      }
      input.focus();
      input.value = name;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));

      const confirm = Array.from(document.querySelectorAll("button,a,div,span"))
        .filter(isVisible)
        .find((el) => /确定|确认|保存|创建/.test(visibleText(el)));
      if (!confirm) {
        resolve({ ok: false, reason: "未找到新建文件夹确认按钮。" });
        return;
      }
      confirm.click();
      resolve({ ok: true });
    }, 500);
  });
}

function uploadFileScript(payload) {
  const input = document.querySelector("#UploadFileBtn")
    || document.querySelector("#UploadFileBtn01")
    || document.querySelector("#UploadFileBtn02")
    || Array.from(document.querySelectorAll("input[type='file']")).find((el) => !el.webkitdirectory);

  if (!input) return { ok: false, reason: "未找到网页上传控件。" };

  const bin = atob(payload.b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  const file = new File([bytes], payload.name, {
    type: payload.mime || "application/octet-stream",
    lastModified: Date.now()
  });
  const dt = new DataTransfer();
  dt.items.add(file);
  input.files = dt.files;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  return { ok: true, name: payload.name, size: payload.size };
}

function openTransferListScript() {
  const visibleText = (el) => (el?.innerText || el?.textContent || "").replace(/\s+/g, " ").trim();
  const isVisible = (el) => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
  };
  const target = Array.from(document.querySelectorAll("button,a,div,span"))
    .filter(isVisible)
    .find((el) => /传输列表|传输|上传列表|任务/.test([
      visibleText(el),
      el.getAttribute("title"),
      el.getAttribute("aria-label")
    ].filter(Boolean).join(" ")));
  if (!target) return { ok: false, reason: "未找到传输列表入口。" };
  target.click();
  return { ok: true };
}

function getTransferStatusScript(fileName) {
  const visibleText = (el) => (el?.innerText || el?.textContent || "").replace(/\s+/g, " ").trim();
  const isVisible = (el) => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
  };
  const rows = Array.from(document.querySelectorAll("tr,[role='row'],li,.file-item,.list-item,[class*='row' i],[class*='item' i],[class*='transfer' i]"))
    .filter(isVisible)
    .map((row) => visibleText(row))
    .filter(Boolean);
  const rowText = rows.find((text) => text.includes(fileName)) || "";
  if (!rowText) {
    return {
      found: false,
      done: false,
      failed: false,
      text: visibleText(document.body).includes(fileName) ? fileName : ""
    };
  }
  const failed = /失败|错误|异常|取消/.test(rowText);
  const done = !failed && (/完成|成功|已上传|100%/.test(rowText) || !/等待|排队|上传中|暂停|处理中|\d{1,2}%|\/s|剩余/.test(rowText));
  return { found: true, done, failed, text: rowText };
}

async function waitForTransferComplete(fileName) {
  const opened = await cloudEval(openTransferListScript);
  if (!opened.ok) {
    await waitForCloudIdle(1800);
    return { ok: true, skipped: true, reason: opened.reason };
  }

  await waitForCloudIdle(800);
  let sawFile = false;
  let lastStatus = null;
  for (let i = 0; i < 60; i += 1) {
    lastStatus = await cloudEval(getTransferStatusScript, fileName);
    if (lastStatus.found) sawFile = true;
    if (lastStatus.failed) return { ok: false, reason: lastStatus.text || "传输列表显示上传失败。" };
    if (lastStatus.done) return { ok: true };
    if (sawFile && !lastStatus.found && i > 2) return { ok: true };
    await waitForCloudIdle(1000);
  }
  return { ok: false, reason: "传输列表长时间未显示上传完成。" };
}

async function addSelectedTargets() {
  const selection = await cloudEval(getPageSelectionScript);
  if (!selection.ok) {
    const names = selection.debug?.recognizedNames?.length
      ? `\n已识别到：${selection.debug.recognizedNames.join("、")}`
      : "";
    const rows = selection.debug?.listRows?.length
      ? `\n当前列表：${selection.debug.listRows.join("、")}`
      : "";
    alert(`${selection.reason || "请先进入共享群页面。"}${names}${rows}`);
    return;
  }
  if (!selection.targets.length) {
    alert("请先在右侧勾选一个或多个文件夹。");
    return;
  }

  const normalized = selection.targets.map((target) => ({
    ...target,
    id: targetId(target),
    displayPath: target.displayPath || formatTargetDisplayPath([target.groupName, target.parentPath, target.folderName])
  }));
  state.targets = uniqById([...state.targets, ...normalized]);
  render();
}

async function chooseLocal(kind) {
  const picked = kind === "files"
    ? await window.cloudTool.chooseFiles()
    : await window.cloudTool.chooseFolders();
  state.localItems = uniqById([...state.localItems, ...picked]);
  render();
}

function showConfirmModal() {
  els.confirmLocal.innerHTML = state.localItems.map((item) => `
    <div class="confirm-row">${escapeHtml(item.kind === "folder" ? `文件夹：${item.name}` : item.name)}<br>${escapeHtml(item.path)}</div>
  `).join("");
  els.confirmTargets.innerHTML = state.targets.map((target) => `
    <div class="confirm-row">${escapeHtml(target.displayPath)}</div>
  `).join("");
  els.modal.classList.remove("hidden");
}

function hideConfirmModal() {
  els.modal.classList.add("hidden");
}

function expectedParentPath(target) {
  return [target.groupName, target.parentPath].filter(Boolean).join("/");
}

async function navigateToParentList(target) {
  if (els.webview.getURL() !== target.parentUrl) {
    els.webview.loadURL(target.parentUrl);
    await waitForWebviewLoad();
  }
  await waitForCloudIdle();

  const parentPath = expectedParentPath(target);
  let lastListInfo = { exists: false, entries: [] };
  for (let i = 0; i < 10; i += 1) {
    const info = await cloudEval(getCurrentFolderInfoScript);
    const lastPart = info.parts[info.parts.length - 1] || "";
    lastListInfo = await cloudEval(pageListEntryInfoScript, target.folderName);
    if (lastListInfo.exists) return;

    if (lastPart === target.folderName || info.parts.length > parentPath.split("/").filter(Boolean).length || els.webview.getURL().includes("transfer")) {
      const clicked = await cloudEval(clickParentBreadcrumbScript, target);
      if (!clicked.ok) await cloudEval(goBackScript);
      await waitForCloudIdle(900);
      continue;
    }

    await cloudEval(refreshCurrentFolderScript);
    await waitForCloudIdle(1200);
  }

  const finalInfo = await cloudEval(pageListEntryInfoScript, target.folderName);
  if (!finalInfo.exists) {
    const entries = (finalInfo.entries?.length ? finalInfo.entries : lastListInfo.entries || []).join("、") || "未识别到列表项";
    throw new Error(`未回到目标文件夹所在列表：${target.displayPath}。当前识别到：${entries}`);
  }
}

async function navigateToTarget(target) {
  await navigateToParentList(target);
  const entered = await cloudEval(enterTargetFolderScript, target);
  if (!entered.ok) throw new Error(entered.reason || "无法进入目标文件夹。");
  let confirmed = false;
  let lastInfo = null;
  for (let i = 0; i < 12; i += 1) {
    await waitForCloudIdle(500);
    lastInfo = await cloudEval(getCurrentFolderInfoScript);
    const lastPart = lastInfo.parts[lastInfo.parts.length - 1];
    if (lastPart === target.folderName) {
      confirmed = true;
      break;
    }
  }
  if (!confirmed) {
    throw new Error(`没有确认进入目标文件夹：${target.displayPath}。为避免传到同级目录，已停止上传。`);
  }
  await waitForFileListReady();
}

async function navigateToCloudPath(target, cloudPathParts) {
  await navigateToTarget(target);
  const descendants = cloudPathParts.slice(1).filter(Boolean);
  for (const folderName of descendants) {
    const entered = await cloudEval(enterTargetFolderScript, { folderName });
    if (!entered.ok) throw new Error(entered.reason || `无法进入文件夹：${folderName}`);
    let confirmed = false;
    for (let i = 0; i < 12; i += 1) {
      await waitForCloudIdle(500);
      const info = await cloudEval(getCurrentFolderInfoScript);
      const lastPart = info.parts[info.parts.length - 1];
      if (lastPart === folderName) {
        confirmed = true;
        break;
      }
    }
    if (!confirmed) throw new Error(`没有确认进入文件夹：${folderName}`);
    await waitForFileListReady();
  }
}

async function ensureFolder(name) {
  const exists = await cloudEval(pageListEntryInfoScript, name);
  if (exists.exists) return { ok: false, skipped: true, reason: "目标位置已有同名文件夹。" };
  const created = await cloudEval(createFolderScript, name);
  if (!created.ok) return created;
  await waitForCloudIdle(1200);
  return { ok: true };
}

async function uploadOneFile(target, file, cloudPathParts) {
  const exists = await cloudEval(pageListEntryInfoScript, file.name);
  const cloudPath = [...cloudPathParts, file.name].join(" / ");
  if (exists.exists) {
    addResult({
      groupName: target.groupName,
      targetPath: target.displayPath,
      localPath: file.path,
      cloudPath,
      kind: "文件",
      size: file.size,
      status: "跳过",
      reason: "目标位置已有同名文件。"
    });
    return;
  }

  const payload = await window.cloudTool.readFilePayload(file.path);
  const uploaded = await cloudEval(uploadFileScript, payload);
  if (!uploaded.ok) throw new Error(uploaded.reason || `上传失败：${file.name}`);
  const transfer = await waitForTransferComplete(file.name);
  if (!transfer.ok && !/长时间未显示上传完成/.test(transfer.reason || "")) {
    throw new Error(transfer.reason || `上传失败：${file.name}`);
  }

  let verified = false;
  let lastReason = transfer.ok ? "" : (transfer.reason || "");
  for (let i = 0; i < 30; i += 1) {
    await waitForCloudIdle(1000);
    try {
      await navigateToCloudPath(target, cloudPathParts);
      if (i === 0 || i % 5 === 0) {
        await cloudEval(refreshCurrentFolderScript);
        await waitForCloudIdle(1200);
      }
      verified = (await cloudEval(pageListEntryInfoScript, file.name)).exists;
      if (verified) break;
      lastReason = "目标目录暂未出现该文件，仍在等待云盘处理。";
    } catch (error) {
      lastReason = error.message || "校验上传结果时失败。";
    }
  }
  addResult({
    groupName: target.groupName,
    targetPath: target.displayPath,
    localPath: file.path,
    cloudPath,
    kind: "文件",
    size: file.size,
    status: verified ? "成功" : "失败",
    reason: verified ? "" : (lastReason || "上传后未在目标目录中找到该文件。")
  });
}

function buildFolderTree(files) {
  const root = { name: "", files: [], dirs: new Map() };
  for (const file of files) {
    const parts = file.relativePath.split(/[\\/]+/).filter(Boolean);
    const fileName = parts.pop();
    let node = root;
    for (const part of parts) {
      if (!node.dirs.has(part)) {
        node.dirs.set(part, { name: part, files: [], dirs: new Map() });
      }
      node = node.dirs.get(part);
    }
    node.files.push({ ...file, name: fileName || file.name });
  }
  return root;
}

async function processFolderTree(target, item, node, cloudPathParts, localPathParts = []) {
  for (const file of node.files) {
    await uploadOneFile(target, file, cloudPathParts);
  }

  for (const child of node.dirs.values()) {
    const localFolderPath = [item.path, ...localPathParts, child.name].join("\\");
    const created = await ensureFolder(child.name);
    const childCloudPath = [...cloudPathParts, child.name].join(" / ");
    if (created.skipped) {
      addResult({
        groupName: target.groupName,
        targetPath: target.displayPath,
        localPath: localFolderPath,
        cloudPath: childCloudPath,
        kind: "文件夹",
        size: "",
        status: "跳过",
        reason: created.reason
      });
      continue;
    }
    if (!created.ok) throw new Error(created.reason || `无法创建文件夹：${child.name}`);

    const entered = await cloudEval(enterTargetFolderScript, { folderName: child.name });
    if (!entered.ok) throw new Error(entered.reason || `无法进入文件夹：${child.name}`);
    await waitForCloudIdle(1000);
    await processFolderTree(target, item, child, [...cloudPathParts, child.name], [...localPathParts, child.name]);
    await cloudEval(goBackScript);
    await waitForCloudIdle(1000);
  }
}

async function uploadFolder(target, item) {
  const created = await ensureFolder(item.name);
  const cloudFolderPath = `${target.displayPath} / ${item.name}`;
  if (created.skipped) {
    addResult({
      groupName: target.groupName,
      targetPath: target.displayPath,
      localPath: item.path,
      cloudPath: cloudFolderPath,
      kind: "文件夹",
      size: item.size,
      status: "跳过",
      reason: created.reason
    });
    return;
  }
  if (!created.ok) throw new Error(created.reason || `无法创建文件夹：${item.name}`);

  const entered = await cloudEval(enterTargetFolderScript, { folderName: item.name });
  if (!entered.ok) throw new Error(entered.reason || `无法进入文件夹：${item.name}`);
  await waitForCloudIdle(1200);

  const tree = buildFolderTree(item.files);
  await processFolderTree(target, item, tree, [target.displayPath, item.name]);
  addResult({
    groupName: target.groupName,
    targetPath: target.displayPath,
    localPath: item.path,
    cloudPath: cloudFolderPath,
    kind: "文件夹",
    size: item.size,
    status: "成功",
    reason: ""
  });
}

async function uploadToTarget(target) {
  for (const item of state.localItems) {
    try {
      await navigateToTarget(target);
      if (item.kind === "file") {
        await uploadOneFile(target, item, [target.displayPath]);
      } else {
        await uploadFolder(target, item);
      }
    } catch (error) {
      addResult({
        groupName: target.groupName,
        targetPath: target.displayPath,
        localPath: item.path,
        cloudPath: `${target.displayPath} / ${item.name}`,
        kind: item.kind === "folder" ? "文件夹" : "文件",
        size: item.size,
        status: "失败",
        reason: error.message || "上传失败。"
      });
    }
  }
}

async function startUpload() {
  hideConfirmModal();
  setBusy(true);
  try {
    for (const target of state.targets) {
      await uploadToTarget(target);
    }
  } finally {
    setBusy(false);
  }
}

async function exportReport() {
  const rows = state.results.slice().reverse();
  try {
    const result = await window.cloudTool.exportReport(rows);
    if (!result.canceled) {
      alert(`已导出：${result.filePath}`);
    }
  } catch (error) {
    alert(`导出失败：${error.message || error}`);
  }
}

function bindResultTooltip() {
  const tooltip = document.createElement("div");
  tooltip.className = "result-tooltip";
  document.body.appendChild(tooltip);

  const hideTooltip = () => {
    tooltip.classList.remove("visible");
  };

  const moveTooltip = (event) => {
    const margin = 12;
    const rect = tooltip.getBoundingClientRect();
    let left = event.clientX + margin;
    let top = event.clientY + margin;

    if (left + rect.width > window.innerWidth - margin) {
      left = Math.max(margin, window.innerWidth - rect.width - margin);
    }
    if (top + rect.height > window.innerHeight - margin) {
      top = Math.max(margin, event.clientY - rect.height - margin);
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  };

  const showTooltip = (target, event) => {
    const text = target.dataset.tooltip;
    if (!text) {
      hideTooltip();
      return;
    }

    tooltip.textContent = text;
    tooltip.classList.add("visible");
    moveTooltip(event);
  };

  els.resultList.addEventListener("mouseover", (event) => {
    const target = event.target.closest?.(".result-item[data-tooltip]");
    if (!target || !els.resultList.contains(target)) {
      hideTooltip();
      return;
    }
    showTooltip(target, event);
  });

  els.resultList.addEventListener("mousemove", (event) => {
    const target = event.target.closest?.(".result-item[data-tooltip]");
    if (!target || !els.resultList.contains(target)) {
      hideTooltip();
      return;
    }
    moveTooltip(event);
  });

  els.resultList.addEventListener("mouseleave", hideTooltip);
  els.resultList.addEventListener("scroll", hideTooltip);
}

function bindEvents() {
  els.chooseFiles.addEventListener("click", () => chooseLocal("files"));
  els.chooseFolders.addEventListener("click", () => chooseLocal("folders"));
  els.addTargets.addEventListener("click", addSelectedTargets);
  els.startUpload.addEventListener("click", showConfirmModal);
  els.cancelUpload.addEventListener("click", hideConfirmModal);
  els.confirmUpload.addEventListener("click", startUpload);
  els.exportReport.addEventListener("click", exportReport);
  els.refreshCloud.addEventListener("click", () => els.webview.reload());

  els.localList.addEventListener("click", (event) => {
    const id = event.target?.dataset?.removeLocal;
    if (!id) return;
    state.localItems = state.localItems.filter((item) => item.id !== id);
    render();
  });

  els.targetList.addEventListener("click", (event) => {
    const id = event.target?.dataset?.removeTarget;
    if (!id) return;
    state.targets = state.targets.filter((target) => target.id !== id);
    render();
  });

  els.webview.addEventListener("did-navigate", updateCloudStatus);
  els.webview.addEventListener("did-navigate-in-page", updateCloudStatus);
  els.webview.addEventListener("did-finish-load", updateCloudStatus);
  bindResultTooltip();
}

async function updateCloudStatus() {
  const url = els.webview.getURL();
  els.cloudUrl.textContent = url || "移动云盘";
  try {
    const info = await cloudEval(() => ({
      title: document.title,
      href: location.href,
      text: document.body ? document.body.innerText.slice(0, 1000) : ""
    }));
    if (/登录|验证码|短信/.test(info.text)) {
      els.cloudStatus.textContent = "请在右侧完成登录";
    } else if (info.text.includes("共享群")) {
      els.cloudStatus.textContent = "已检测到共享群页面";
    } else {
      els.cloudStatus.textContent = "请进入共享群后添加目标";
    }
  } catch (_error) {
    els.cloudStatus.textContent = "正在载入移动云盘";
  }
}

async function init() {
  bindEvents();
  const startUrl = await window.cloudTool.getStartUrl();
  els.webview.src = startUrl;
  render();
}

init();
