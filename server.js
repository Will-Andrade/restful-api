const url = require("node:url");
const http = require("node:http");
const users = require("./data.json");

const server = http.createServer();

const [PORT, HOST] = [8000, "127.0.0.1"];

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});

server.on("request", (req, res) => {
  const parsedURL = url.parse(req.url, true);
  const pathName = parsedURL.pathname;

  //? READ all clients
  if (pathName === "/clients" && req.method === "GET") {
    res.setHeader("Content-type", "application.json");
    res.statusCode = 200;
    res.end(JSON.stringify(users));
  }

  //? READ a single client
  if (pathName.startsWith("/clients/") && req.method === "GET") {
    const id = pathName.split("/")[2];
    const client = users.find(({ id: userId }) => userId === parseInt(id));

    if (client) {
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify(client));
    } else {
      res.statusCode = 404;
      res.setHeader("Content-type", "application/json");
      res.end(JSON.stringify({ message: "Client not found!" }));
    }
  }

  //? CREATE a new client
  if (pathName === "/clients" && req.method === "POST") {
    let requestBody = "";

    req.on("data", (chunk) => {
      requestBody += chunk.toString("utf-8");
    });

    req.on("end", () => {
      const newClient = JSON.parse(requestBody);
      newClient.id = users.length + 1;

      users.push(newClient);

      res.setHeader("Content-type", "application/json");
      res.statusCode = 201;
      res.end(JSON.stringify(newClient));
    });
  }

  //? UPDATE a client
  if (pathName.startsWith("/clients/") && req.method === "PUT") {
    const id = pathName.split("/")[2];
    const client = users.find(({ id: userId }) => userId === parseInt(id));

    if (!client) {
      res.statusCode = 404;
      res.setHeader("Content-type", "application/json");
      res.end(JSON.stringify({ message: "Client not found!" }));
      return;
    }

    let requestBody = "";

    req.on("data", (chunk) => {
      requestBody += chunk.toString("utf-8");
    });

    req.on("end", () => {
      const clientUpdate = JSON.parse(requestBody);

      if (clientUpdate.hasOwnProperty("name")) {
        client.name = clientUpdate.name;
      }

      if (clientUpdate.hasOwnProperty("username")) {
        client.username = clientUpdate.username;
      }

      if (clientUpdate.hasOwnProperty("email")) {
        client.email = clientUpdate.email;
      }

      res.setHeader("Content-type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify(client));
    });
  }

  //? DELETE a client
  if (pathName.startsWith("/clients/") && req.method === "DELETE") {
    const id = pathName.split("/")[2];
    const filteredUsers = users.filter(
      ({ id: userId }) => userId !== parseInt(id)
    );

    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    res.end(JSON.stringify(filteredUsers));
  }
});
