"use strict";

const fs = require("node:fs");
const path = require("node:path");

const isOneDrivePath = (filePath) => {
  try {
    return /\\onedrive\\/i.test(path.resolve(String(filePath)));
  } catch {
    return false;
  }
};

const patchStats = (stats, filePath) => {
  if (
    process.platform !== "win32" ||
    !stats ||
    typeof stats.isSymbolicLink !== "function" ||
    !isOneDrivePath(filePath)
  ) {
    return stats;
  }

  // OneDrive cloud files are reparse points and can be mis-reported as symlinks.
  // Force a non-symlink answer so callers don't issue readlink() and crash with EINVAL.
  const originalIsSymbolicLink = stats.isSymbolicLink.bind(stats);
  stats.isSymbolicLink = () => {
    try {
      originalIsSymbolicLink();
      return false;
    } catch {
      return false;
    }
  };

  return stats;
};

const originalLstat = fs.lstat.bind(fs);
fs.lstat = (filePath, options, callback) => {
  if (typeof options === "function") {
    callback = options;
    options = undefined;
  }

  return originalLstat(filePath, options, (error, stats) => {
    if (error) {
      callback(error);
      return;
    }
    callback(null, patchStats(stats, filePath));
  });
};

const originalLstatSync = fs.lstatSync.bind(fs);
fs.lstatSync = (filePath, options) => {
  return patchStats(originalLstatSync(filePath, options), filePath);
};

const originalPromisesLstat = fs.promises.lstat.bind(fs.promises);
fs.promises.lstat = async (filePath, options) => {
  return patchStats(await originalPromisesLstat(filePath, options), filePath);
};
