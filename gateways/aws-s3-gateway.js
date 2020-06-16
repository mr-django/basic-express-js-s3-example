const aws = require("aws-sdk");
const fs = require("fs");
const { GetObject } = require("../constants/s3Operations");

const s3AccessKeyId = ""; // TODO: Please insert
const s3SecretAccessKey = ""; // TODO: Please insert
const s3BucketName = ""; // TODO: Please insert
const s3Region = "eu-west-2"; // TODO: Please insert
const s3Expires = 1800; // seconds
const s3 = new aws.S3({
  accessKeyId: s3AccessKeyId,
  secretAccessKey: s3SecretAccessKey,
  region: s3Region,
});

/**
 * @param {string} walletId
 * @param {string} base64Image
 * @returns fileName
 */
async function saveImageOnBucket(walletId, base64Image) {
  const fileName = `${walletId}.png`;
  // TODO: Update to a more appropriate location
  const tmpFile = `/tmp/${fileName}`;

  // write file to temp directory for streaming
  fs.writeFile(tmpFile, base64Image, { encoding: "base64" }, (err) => {
    if (err) throw new Error("Unable to write file");
  });

  // create file stream
  const fileStream = fs.createReadStream(tmpFile);

  const params = {
    Bucket: s3BucketName,
    Key: fileName,
    Body: fileStream,
    ContentType: "application/octet-stream",
  };

  try {
    await s3.upload(params).promise();
    fs.unlink(tmpFile, (unlinkError) => {
      if (unlinkError) {
        // log something so we can make sure the temp dir doesn't fill up
        throw new Error(`${tmpFile} not deleted`);
      }
    });
    return { fileName };
  } catch (error) {
    throw new Error(error);
  }
}

/**
 * @param {string} fileName
 */
async function getTempImageUrl(fileName) {
  const params = {
    Bucket: s3BucketName,
    Key: `${fileName}.png`,
    Expires: 60 * s3Expires,
  };

  try {
    const url = await s3.getSignedUrlPromise(GetObject, params);
    if (!url) {
      throw new Error("Object not found");
    }
    return { url };
  } catch (error) {}
}

module.exports = {
  getTempImageUrl,
  saveImageOnBucket,
};
