const Buffer = require("buffer").Buffer;
const crypto = require("crypto");
let algorithm = "aes-256-cbc", ENC_KEY = "pyRYtDWQLu83RaPCNZudQdW4WbtDdF6q";

let decrypt = function (data) {
    var spliData = data.split(":")
        , IV = new Buffer.from(spliData[0], "hex")
        , encData = new Buffer.from(spliData[1], "hex")
        , decipher = crypto.createDecipheriv(algorithm, new Buffer.from(ENC_KEY), IV)
        , decryptedData = decipher.update(encData);
    decryptedData = Buffer.concat([decryptedData, decipher.final()]);
    return decryptedData.toString();
}
let encrypt = function (data) {
    var IV = crypto.randomBytes(16)
        , cipher = crypto.createCipheriv(algorithm, new Buffer.from(ENC_KEY), IV)
        , encryptedData = cipher.update(JSON.stringify(data));
    encryptedData = Buffer.concat([encryptedData, cipher.final()]);
    return IV.toString("hex") + ":" + encryptedData.toString("hex");
}

module.exports = { decrypt, encrypt }