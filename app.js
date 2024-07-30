const http = require("node:http");
const fs = require("node:fs");
const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT || 3003;
const HOST = process.env.HOST || "127.0.0.1";

let data = "";
let count = 0;

http
  .createServer((request, response) => {
    if (request.url === "/user") {
      console.log("METHOD:", request.method);
      request.on("data", (chunk) => {
        data += ++count + ". " + chunk + "\n";
        console.log("DATA:", data);
      });

      request.on("end", () => {
        response.write(data);
        response.end("\nMa'lumotlar yuklandi");
        console.log("End");
      });
    } else {
      console.log("index");
      fs.readFile("index.html", "utf8", (err, data) => {
        if (err) {
          console.log(err);
          response.end("Xatolik");
        } else {
          response.writeHead(200, { "Content-Type": "text/html" });
          response.end(data);
          console.log("Index yuklandi");
        }
      });
    }
  })
  .listen(PORT, HOST, (error) => {
    error
      ? console.log(error)
      : console.log(`Servert started at: http://${HOST}/${PORT}`);
  });
