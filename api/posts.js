const express = require("express");
const postsRouter = express.Router();
const { requireUser } = require("./utils");
const { createPost, client } = require("../db");

postsRouter.use((req, res, next) => {
  console.log("A request is being made to /posts");

  //   res.send({ message: "hello from /posts!" });

  next();
});

const { getAllPosts } = require("../db");

postsRouter.get("/", async (req, res) => {
  const posts = await getAllPosts();

  res.send({ posts });
});

//for testing purposes, save the token as a variable in your console by typing "export TOKEN=[token string without quotes]", then using it later as 'Authorization: Bearer '"$TOKEN"''
//to get to this point, a valid request from front end to POST /api/posts is sent with a title, content, and tags (as strings that need to be broken up with trim and split)

postsRouter.post("/", requireUser, async (req, res, next) => {
  const { title, content, tags = "" } = req.body;
  console.log(title); //currently undefined

  //trim removes spaces in the front or back, then split turns the string into an array splitting wherever there's a space
  const tagArr = tags.trim().split(/\s+/);
  const postData = {};

  // only send the tags if there are some to send
  if (tagArr.length) {
    postData.tags = tagArr;
  }

  try {
    // add authorId, title, content to postData object
    postData = { authorId, title, content };
    console.log(postData);

    // const post = await createPost(postData); this will create the post and the tags for us
    // if the post comes back, res.send({ post });
    // otherwise, next an appropriate error object
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = postsRouter;

// curl http://localhost:3000/api/posts -X POST -H 'Authorization: Bearer '"$TOKEN"'' -d '{"title": "test post", "content": "how is this?", "tags": " #once #twice    #happy"}'
