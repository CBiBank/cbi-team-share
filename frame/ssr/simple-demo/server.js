const express = require("express");
const app = express();

app.get("*", (request, response) => {
  response.end("hello, ssr");
});

const port = 3000;

app.listen(port, () => {
  console.log("http://localhost:" + port);
});
