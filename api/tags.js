const express = require("express");
const tagsRouter = express.Router();
const { getAllTags, getPostsByTagName } = require("../db");

tagsRouter.use((req, res, next) => {
  console.log("A request is being made to /tags");

  //   res.send({ message: "hello from /tags!" });

  next();
});

tagsRouter.get("/", async (req, res) => {
  const tags = await getAllTags();

  res.send({ tags });
});

tagsRouter.get("/:tagName/posts", async (req, res, next) => {
  //read tag name from params
  const { tagName } = req.params;

  try {
    //use GET to get posts by tag name from db
    const posts = await getPostsByTagName(tagName);
    res.send({ posts });

    //send out object to the client as {posts:____}
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = tagsRouter;
