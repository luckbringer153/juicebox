const express = require("express");
const usersRouter = express.Router();
const {
  getAllUsers,
  getUserByUsername,
  createUser,
  getUserById,
  updateUser,
} = require("../db");
const jwt = require("jsonwebtoken");
const { requireUser } = require("./utils");

usersRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  // res.send({ message: "hello from /users!" });

  next();
});

usersRouter.get("/", async (req, res, next) => {
  try {
    const allUsers = await getAllUsers();

    const users = allUsers.filter((user) => {
      return user.active || (req.user && user.author.id === req.user.id);
    });

    res.send({ users });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  // request must have both
  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password",
    });
  }

  try {
    const user = await getUserByUsername(username);

    if (user && user.password === password) {
      // console.log("you got me!");

      // create token & return to user
      const token = jwt.sign({ id: user.id, username }, process.env.JWT_SECRET);

      res.send({ message: "you're logged in!", token: `${token}` });
    } else {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.post("/register", async (req, res, next) => {
  const { username, password, name, location } = req.body;

  try {
    const _user = await getUserByUsername(username);

    if (_user) {
      next({
        name: "UserExistsError",
        message: "A user by that username already exists",
      });
    }

    const user = await createUser({
      username,
      password,
      name,
      location,
    });

    const token = jwt.sign(
      {
        id: user.id,
        username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1w",
      }
    );

    res.send({
      message: "thank you for signing up",
      token,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

usersRouter.delete("/:userId", requireUser, async (req, res, next) => {
  try {
    const user = await getUserById(req.params.userId);

    console.log(user);
    console.log("req.user.id:", req.user.id);

    if (user && user.id === req.user.id) {
      console.log("user", user);
      const updatedUser = await updateUser(user.id, { active: false });

      res.send({ post: updatedUser });
    } else {
      next(
        post
          ? {
              name: "UnauthorizedUserError",
              message: "You cannot delete a user which is not yours",
            }
          : {
              name: "UserNotFoundError",
              message: "That user does not exist",
            }
      );
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = usersRouter;
