const path = require("path");
const multer = require('multer');
const express = require('express');

const storage = multer.diskStorage({
    destination: "./public/uploads",
    filename: (req, file, callback) => {
        let ext = path.extname(file.originalname);
        callback(null, `${file.fieldname}-${Date.now()}${ext}`);
    }
});

const imageFileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error("You can upload only image files!"), false);
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: imageFileFilter
})

const uploadRouter = express.Router();

uploadRouter.route('/upload')
    .post(upload.single('imageFile'), (req, res) => {
        res.status(200);
        res.json(req.file);
    });

module.exports = uploadRouter;

/**
 * @swagger
 * /upload:
 *  post:
 *   tags:
 *    - Upload imagefile
 *   description: upload image for users, restaurant and food.
 *   consumes:
 *    - multipart/form-data
 *   produces:
 *    - application/json
 *   parameters:
 *    - name: imageFile
 *      in: formData
 *      type: file
 *      description: The image file to upload
 *   responses:
 *    200:
 *     description: Accepted
 *    500:
 *     description: You can upload only image files
 */