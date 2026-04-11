// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("fs");

fs.writeFileSync("dist/cjs/package.json", JSON.stringify({ type: "commonjs" }));
fs.writeFileSync("dist/esm/package.json", JSON.stringify({ type: "module" }));
