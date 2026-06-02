import { existsSync } from "node:fs";
import { join } from "node:path";

export function publicOutputDir(distDir) {
  const clientDir = join(distDir, "client");
  return existsSync(clientDir) ? clientDir : distDir;
}

export function publicOutputFile(distDir, fileName) {
  return join(publicOutputDir(distDir), fileName);
}
