const express = require("express");
const router = express.Router();
const uuid = require("uuid").v4;
const { SaveImage, GetImage } = require("../constants/routes");
const {
  saveImageOnBucket,
  getTempImageUrl,
} = require("../gateways/aws-s3-gateway");

/* Save Image */
router.post(SaveImage, async function (req, res, next) {
  const userId = uuid();
  const response = await saveImageOnBucket(userId, req.body.image);
  res.status(201).json(response);
});

router.get(GetImage, async function (req, res, next) {
  console.log(req.params.walletId);
  const response = await getTempImageUrl(req.params.walletId);
  res.status(200).json(response);
});

module.exports = router;
