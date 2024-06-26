const { spawn } = require("child_process");
require("./banner.cjs") 

const cmd =
  process.platform === "win32"
    ? spawn("cmd", ["/c", "pnpm dev-nuxt"])
    : spawn("sh", ["-c", "pnpm dev-nuxt"]);

cmd.stdout.on("data", (data) => {
  console.log(`${data}`);
});

cmd.stderr.on("data", (data) => {
  console.error(`${data}`);
});

cmd.on("close", (code) => {
  console.log(`${code}`);
});
