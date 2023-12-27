const express = require("express");
const router = express.Router();

const multer = require("multer");
const {
  register,
  login,
  getNotLoggedUser,
  sentRequest,
  getRequest,
  acceptRequest,
  getAllFriends,
  sendMessage,
  fetchMessage,
  deleteMessage,
} = require("../controller/user");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});
const upload = multer({ storage: storage });
router.route("/signup").post(upload.single("image"), register);
router.route("/login").post(login);
router.route("/:userId").get(getNotLoggedUser);
router.route("/friend-request").post(sentRequest);
router.route("/friend-request/:userId").get(getRequest);
router.route("/friend-request/accept").post(acceptRequest);
router.route("/friend-request/:userId").post(getAllFriends);
router.route("/sendMessage").post(upload.single("image"), sendMessage);
router.route("/messages/:senderId/:recepientId").get(fetchMessage);
router.route("/deleteMessage").delete(deleteMessage);
module.exports = router;
