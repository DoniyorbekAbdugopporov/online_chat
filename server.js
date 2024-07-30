const WebSocket = require("ws");
const http = require("node:http");

const webServer = http.createServer();

const server = new WebSocket.Server(
  {
    server: webServer,
  },
  () => {
    console.log("WebSocket server is running on port 3000");
  }
);

const users = new Map();

function generateUserId() {
  return Math.random().toString(36).substr(2, 9);
}

server.on("connection", (ws) => {
  console.log("New client connected");

  ws.send("Welcome to WebSocket Chat!");

  ws.on("message", (message) => {
    const messageData = JSON.parse(message);
    switch (messageData.type) {
      case "nick":
        if (users.has(messageData.value)) {
          ws.send(JSON.stringify({ type: "nick_busy" }));
        } else {
          ws.send(
            JSON.stringify({
              type: "welcome",
              value: "Welcome to WebSocket Chat!",
            })
          );
          const userId = generateUserId();
          ws.send(
            JSON.stringify({
              type: "user_id",
              userId,
            })
          );
          ws.nick = messageData.value; // Nickname ni ws obyektiga qo'shish
          users.set(messageData.value, userId);
          console.log(users);
          server.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: "user_connected",
                  nick: messageData.value,
                })
              );
            }
          });
        }
        break;
      case "message":
        server.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "message",
                message: messageData.value,
                nick: messageData.nick,
              })
            );
          }
        });
        break;
      default:
        break;
    }
  });

  ws.on("close", () => {
    if (ws.nick) {
      users.delete(ws.nick); // Nickname asosida foydalanuvchini o'chirish
      server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "user_disconnected",
              nick: ws.nick,
            })
          );
        }
      });
    }
  });
});

webServer.on("request", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/plain",
  });
  res.end("WebSocket server is running!");
});

webServer.listen(3000, () => {
  console.log("HTTP server is running on port 3000");
});
