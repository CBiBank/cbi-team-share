const express = require("express");
const app = express();
const Vue = require("vue");
const path = require("path");
const vueServerRender = require("vue-server-renderer").createRenderer({
  template: require("fs").readFileSync(path.join(__dirname, "./index.html"), "utf-8")
});
app.get('*', (request, response) => {
  const vueApp = new Vue({
    data: {
      message: "hello, ssr"
    },
    template: `<h1>{{message}}</h1>`
  });

  response.status(200);
  response.setHeader("Content-type", "text/html;charset-utf-8");
  vueServerRender.renderToString(vueApp).then((html) => {
    response.end(html);
  }).catch(err => console.log(err))
})
const port = 3000;

app.listen(port, () => {
  console.log("http://localhost:" + port);
});
