const rollup = require("rollup");

const inputOptions = {
  input: "./src/index.js",
  external: [],
  plugins: []
};

const outputOptionsList = [
  {
    dir: "dist/es",
    format: "esm",
  },
  {
    dir: "dist/cjs",
    format: "cjs",
  },
];

build();

async function build() {
  let bundle;
  let buildFailed = false;
  try {
    // 调用 rollup.rollup 生成 bundle 对象
    const bundle = await rollup.rollup(inputOptions);

    await generateOutputs(bundle);
  } catch (error) {
    buildFailed = true;
    console.error(error);
  }
  // 调用 bundle.close 方法结束打包
  if (bundle) {
    await bundle.close();
  }
  process.exit(buildFailed ? 1 : 0);
}

async function generateOutputs(bundle) {
  for (const outputOptions of outputOptionsList) {
    // 拿到 bundle 对象，根据每一份输出配置，调用 generate 和 write 方法分别生成和写入产物
    const { output } = await bundle.generate(outputOptions);

    for (const chunkOrAsset of output) {
      if (chunkOrAsset.type === "asset") {
        console.log("Asset", chunkOrAsset);
      } else {
        console.log("Chunk", chunkOrAsset.modules);
      }
    }
    await bundle.write(outputOptions);
  }
}
