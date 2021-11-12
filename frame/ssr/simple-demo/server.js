const express = require("express");
const app = express();
const vueApp = require('./src/app.js');

let path = require("path");
const vueServerRender = require("vue-server-renderer").createRenderer({
  template: require("fs").readFileSync(path.join(__dirname, "./index.html"), "utf-8")
});

app.get('*', (request, response) => {
  let vm = vueApp({});
  
  response.status(200);
  response.setHeader("Content-type", "text/html;charset-utf-8");

  vueServerRender.renderToString(vm).then((html) => {
    response.end(html);
  }).catch(err => console.log(err))
})


const port = 3000;

app.listen(port, () => {
  console.log("http://localhost:" + port);
});
