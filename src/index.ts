import { WebSocket } from "ws";

import { IDGen } from "./services/id_generator";
import { Event } from "./models/event_model";
import { Post } from "./models/post_model";
import { IClient } from "./models/client_model";

const wss = new WebSocket.Server({
  port: Number.parseInt(process.env.PORT ?? "80"),
  path: "/",
  maxPayload: 10000 * 1024, // 10 MB
});

const posts: Post[] = [];
let clients: IClient[] = [];

wss.on("connection", (ws) => {
  const newClient = { id: IDGen.newId(), socket: ws };
  clients.push(newClient);

  ws.on("message", (messageAsString) => {
    handleEvent(messageAsString, newClient);
  });

  ws.on("close", () => {
    console.log("Closed connection");
    clients = clients.filter((client) => {
      client.id != newClient.id;
    });
  });

  ws.on("error", function (err) {
    console.log(err.message);
    ws.send(
      JSON.stringify(
        new Response("error", {}, [err.message ?? "Unknown error"])
      )
    );
  });
});

const handleEvent = (messageAsString: any, client: IClient) => {
  let messageJson: Event;

  try {
    messageJson = JSON.parse(messageAsString.toString());

    if (!messageJson.type) throw Error("No event type specified.");

    if (messageJson.type == "create_post") {
      let title = messageJson?.data?.title;
      let description = messageJson?.data?.description;
      let image = messageJson?.data?.image;

      if (!title || !description || !image)
        throw Error("Some fields are missing.");

      let post: Post = new Post({
        title: title,
        description: description,
        image: image,
      });

      posts.push(post);

      clients.forEach((client) => {
        if (client.subscribedNewPosts)
          client.socket.send(
            JSON.stringify(new Response("new_post", { post }, []))
          );
      });
    } else if (messageJson.type == "get_posts") {
      client.subscribedNewPosts = true;

      client.socket.send(
        JSON.stringify(new Response("all_posts", { posts }, []))
      );
    }
  } catch (error: any) {
    return client.socket.send(
      JSON.stringify(
        new Response("error", {}, [error.message ?? "Unknown error"])
      )
    );
  }
};

class Response {
  type: string;
  data: any;
  errors: Array<any>;

  constructor(type: string, data: any, errors: Array<any>) {
    this.type = type;
    this.data = data;
    this.errors = errors;
  }
}
