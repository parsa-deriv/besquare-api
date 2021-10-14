import { IDGen } from "../services/id_generator";

interface PostArguments {
  title: string;
  description: string;
  image: string;
}

export class Post {
  id: string;
  title: string;
  description: string;
  image: string;
  date: Date;

  constructor(args: PostArguments) {
    this.id = IDGen.newId();
    this.date = new Date(Date.now());
    this.title = args.title;
    this.description = args.description;
    this.image = args.image;

    Object.setPrototypeOf(this, Post.prototype);
  }
}
