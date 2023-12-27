const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Message = require("../models/mesage");
const createToken = (id) => {
  return jwt.sign({ id }, "sumitghimire", {
    expiresIn: 3 * 24 * 60 * 60,
  });
};
const register = async (req, res) => {
  console.log("The req file", req.file.filename);
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, msg: "User already exists" });
    }
    const newUser = await new User({
      ...req.body,
      image: "uploads" + req.file.filename,
    });
    console.log("new user", newUser);
    const token = createToken(newUser._id);
    await newUser.save();
    res.status(200).json({
      success: true,
      data: newUser,
      token: token,
      msg: "User registered",
    });
  } catch (err) {
    console.log("Error while registering user", err);
    res
      .status(400)
      .json({ success: false, msg: "Error while user registration" });
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, msg: "Please provide email and password" });
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid credentials" });
    }
    const auth = await bcrypt.compare(password, user.password);
    console.log("the auth is", auth);
    if (!auth) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid credentials" });
    }
    const token = createToken(user._id);
    res.status(200).json({
      success: true,
      token: token,
      data: user,
      msg: "User successfully logged in",
    });
  } catch (err) {
    console.log("Error while logging in", err);
    res.status(400).json({ success: false, msg: "Error while logging in" });
  }
};
const getNotLoggedUser = async (req, res) => {
  try {
    const loggedInUserId = req.params.userId;
    const users = await User.find({
      _id: {
        $ne: loggedInUserId,
      },
    });
    if (!users) {
      return res.status(400).json({ success: false, msg: "No users found" });
    }
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    console.log("Error while getting not logged users", err);
    res
      .status(400)
      .json({ success: false, msg: "Error while getting not logged users" });
  }
};
const sentRequest = async (req, res) => {
  try {
    const { currentUserId, selectedUserId } = req.body;
    await User.findByIdAndUpdate(selectedUserId, {
      $push: {
        friendRequests: currentUserId,
      },
    });
    await User.findByIdAndUpdate(currentId, {
      $push: {
        sentFriendRequests: selectedUserId,
      },
    });
    res.status(200).json({ success: true, msg: "Request sent" });
  } catch (err) {
    console.log("Error while sending request", err);
    res
      .status(400)
      .json({ success: false, msg: "Error while sending request" });
  }
};
const getRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .populate("friendRequests", "name email image")
      .lean();
    const friendRequests = user.friendRequests;
    res.status(200).json({ success: true, data: friendRequests });
  } catch (err) {
    console.log("Error while getting request", err);
    res
      .status(400)
      .json({ success: false, msg: "Error while getting request" });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const { senderId, recepientId } = req.body;
    const sender = await User.findById(senderId);
    const recepient = await User.findById(recepientId);
    if (!sender || !recepient) {
      return res
        .status(400)
        .json({ success: false, msg: "Sender or receipt not found" });
    }
    sender.friends.push(recepientId);
    recepient.friends.push(senderId);
    recepient.friendRequests = recepient.friendRequests.filter(
      (request) => request.toString !== senderId.toString()
    );
    sender.friendRequests = sender.sentFriendRequests.filter(
      (request) => request.toString !== recepientId.toString()
    );
    await sender.save();
    await recepient.save();
    res.status(200).json({ success: true, msg: "Request accepted" });
  } catch (err) {
    console.log("Error while accepting request", err);
    res
      .status(400)
      .json({ success: false, msg: "Error while accepting request" });
  }
};
const getAllFriends = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate(
      "friends",
      "name email image"
    );
    const acceptedFriends = user.friends;
    res.status(200).json({ success: true, data: acceptedFriends });
  } catch (err) {
    console.log("Error while getting all friends", err);
    res
      .status(400)
      .json({ success: false, msg: "Error while getting all friends" });
  }
};

const sendMessage = async (rq, res) => {
  try {
    const { senderId, recepientId, messageType, message } = req.body;
    const newMessage = new Message({
      senderId,
      recepientId,
      messageType,
      message,
      imageUrl: messageType === "image" ? req.file.filename : null,
    });
    await newMessage.save();
    res
      .status(200)
      .json({ success: true, data: newMessage, msg: "Message sent" });
  } catch (err) {
    console.log("Error while sending message", err);
    res
      .status(400)
      .json({ success: false, msg: "Error while sending message" });
  }
};

// endpoint to fetch the message between two users in the chatRoom
const fetchMessage = async (req, res) => {
  try {
    const { senderId, recepientId } = req.params;
    const message = await Message.find({
      $or: [
        {
          senderId: senderId,
          recepientId: recepientId,
        },
        {
          senderId: recepientId,
          recepientId: senderId,
        },
      ],
    }).populate("senderId", "_id name");
    res.status(200).json({ success: true, data: message });
  } catch (err) {
    console.log("Error while fetching the message", err);
    res
      .status(400)
      .json({ success: false, msg: "Error while fetching the message" });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!Array.isArray(message) || message.length === 0) {
      return res
        .status(400)
        .json({ success: false, msg: "Please provide valid req body" });
    }
    await Message.deleteMany({ _id: { $in: message } });
    res.status(200).json({ success: true, msg: "Message deleted" });
  } catch (err) {
    console.log("Error while deleting message", err);
    res
      .status(400)
      .json({ success: false, msg: "Error while deleting message" });
  }
};

module.exports = {
  sentRequest,
  acceptRequest,
  getRequest,
  register,
  login,
  getNotLoggedUser,
  getAllFriends,
  sendMessage,
  fetchMessage,
  deleteMessage,
};
