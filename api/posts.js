const express = require("express");
const postsRouter = express.Router();
const { requireUser } = require("./utils");
const { getAllPosts, createPost, updatePost, getPostById } = require("../db"); //removed {client}
// const usersRouter = require("./users");

postsRouter.use((req, res, next) => {
  console.log("A request is being made to /posts");

  //   res.send({ message: "hello from /posts!" });

  next();
});

postsRouter.get("/", async (req, res, next) => {
  try {
    const allPosts = await getAllPosts();

    const posts = allPosts.filter((post) => {
      // keep a post if it is either active, or if it belongs to the current user
      return post.active || (req.user && post.author.id === req.user.id);
    });

    res.send({ posts });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

//for testing purposes, save the token as a variable in your console by typing "export TOKEN=[token string without quotes]", then using it later as 'Authorization: Bearer '"$TOKEN"''
//to get to this point, a valid request from front end to POST /api/posts is sent with a title, content, and tags (as strings that need to be broken up with trim and split)

postsRouter.post("/", requireUser, async (req, res, next) => {
  const { title, content, tags = "" } = req.body;
  // console.log("title:", title); //currently undefined
  // console.log("content:", content); //currently undefined
  // console.log("tags:", tags); //currently blank/empty (not undefined specifically)

  //trim spaces in the before or after tag expression, then split turns the string into an array splitting wherever there's a space inside tag expression
  const tagArr = tags.trim().split(/\s+/);
  let postData = {};

  // console.log("tagArr:", tagArr, "and postData:", postData); //currently [''] and {} respectively

  // only send the tags if there are some to send
  if (tagArr.length) {
    postData.tags = tagArr;
    // console.log("new postData.tags:", postData.tags); //currently ['']
  }

  try {
    // add authorId, title, content to postData object
    postData = { ...postData, authorId: req.user.id, title, content }; //currently doesn't get farther than this because it says authorId isn't defined
    // console.log("postData in try block:", postData);

    const post = await createPost(postData); //this will create the post and the tags for us

    // if the post comes back, "res.send({ post })""; otherwise, next an appropriate error object
    if (post) {
      res.send({ post }); //body will always be an object
    } else {
      next({
        name: "Post Creation Error",
        message: "Post creation failed",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.patch("/:postId", requireUser, async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body;

  const updateFields = {};

  if (tags && tags.length > 0) {
    updateFields.tags = tags.trim().split(/\s+/);
  }

  if (title) {
    updateFields.title = title;
  }

  if (content) {
    updateFields.content = content;
  }

  try {
    const originalPost = await getPostById(postId);

    if (originalPost.author.id === req.user.id) {
      const updatedPost = await updatePost(postId, updateFields);
      res.send({ post: updatedPost });
    } else {
      next({
        name: "UnauthorizedUserError",
        message: "You cannot update a post that is not yours",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.delete("/:postId", requireUser, async (req, res, next) => {
  try {
    const post = await getPostById(req.params.postId);

    if (post && post.author.id === req.user.id) {
      const updatedPost = await updatePost(post.id, { active: false });

      res.send({ post: updatedPost });
    } else {
      // if there was a post, throw UnauthorizedUserError, otherwise throw PostNotFoundError
      next(
        post
          ? {
              name: "UnauthorizedUserError",
              message: "You cannot delete a post which is not yours",
            }
          : {
              name: "PostNotFoundError",
              message: "That post does not exist",
            }
      );
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = postsRouter;
