const { transform } = require("esbuild");

async function runTransform() {
  // 第一个参数是代码字符串，第二个参数为编译配置
  const content = await transform(
    "const isNull = (str: string): boolean => str.length > 0;",
    {
      sourcemap: true,
      loader: "",
    }
  );
  console.log(content);
}
// 同步
function runTransformSync() {
  const content = await transformSync(/* 参数和 transform 相同 */)
  console.log(content);
}

runTransform();
