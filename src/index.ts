import { WebSocket } from "ws";

import { Message } from "./models/message_model";
import { Post } from "./models/post_model";
import { PostCreateData } from "./models/data_models";
import { IDGen } from "./services/id_generator";

const wss = new WebSocket.Server({
  port: 80,
  path: "/",
  maxPayload: 10000 * 1024, // 128 KB
});
const clients = new Map();
const posts: Post[] = [];

wss.on("connection", (ws) => {
  const id = IDGen.newId();
  const metadata = { id };

  clients.set(ws, metadata);

  ws.on("message", (messageAsString) => {
    let message: Message;
    try {
      message = JSON.parse(messageAsString.toString());
      if (!message.type) throw Error("fdks");
    } catch (error: any) {
      console.log("Not a message.");
      return ws.send(error.message ?? "Unknown error");
    }
    handleEvent(message, ws);
    ws.send("Got your message");
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log("Closed connection");
  });

  ws.on("error", function (err) {
    console.log(err.message);
    ws.send(err.message);
  });
});

const handleEvent = (message: Message, client: WebSocket) => {
  console.log(message.type);
  if (message.type == "create_post") {
    let post: PostCreateData;
    try {
      post = message.data;
    } catch (error) {
      return client.send("Broken request"); // sdkjfjdsfjdsfbds
    }
    posts.push(
      new Post({
        title: post.title,
        description: post.description,
        image: post.image,
      })
    );
    client.send("Added");
  } else if (message.type == "get_posts") {
    client.send(JSON.stringify(posts));
  }
};
