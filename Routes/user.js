const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../Model/user');
const auth = require('../auth');

const router = express.Router();

router.post('/signup', (req, res, next) => {
    let password = req.body.password;
    bcrypt.hash(password, 10, function (err, hash) {
        if (err) {
            let err = new Error('Could not hash!');
            err.status = 500;
            return next(err);
        }
        let newUser = new User(req.body);
        newUser.password = hash;
        newUser.save()
            .then((user) => {
                let token = jwt.sign({
                    _id: user._id
                }, process.env.SECRET);
                res.status(201);
                res.json({
                    status: "Signup success!",
                    token: token
                });
            }).catch(next);
    });
});

router.post('/login', (req, res, next) => {
    User.findOne({
            email: req.body.email
        })
        .then((user) => {
            if (user == null) {
                let err = new Error("Incorrect username or password");
                err.status = 401;
                return next(err);
            } else {
                bcrypt.compare(req.body.password, user.password)
                    .then((isMatch) => {
                        if (!isMatch) {
                            let err = new Error('Incorrect username or password');
                            err.status = 401;
                            return next(err);
                        }
                        let token = jwt.sign({
                            _id: user._id
                        }, process.env.SECRET);
                        res.status(200);
                        res.json({
                            status: 'Login success!',
                            token: token
                        });
                    }).catch(next);
            }

        }).catch(next);
})

router.route('/me')
    .get(auth.verifyUser, (req, res) => {
        res.status(200);
        res.json({
            _id: req.user._id,
            email: req.user.email,
            image: req.user.image,
            name: req.user.name,
            phoneNumber: req.user.phoneNumber,
            password: req.user.password
        })
    })
    .put(auth.verifyUser, (req, res, next) => {
        User.findByIdAndUpdate({
                _id: req.user._id
            }, {
                $set: req.body
            }, {
                new: true
            })
            .then(() => {
                User.findOne({
                        _id: req.user._id
                    })
                    .then((user) => {
                        res.json({
                            _id: user._id,
                            email: user.email,
                            image: user.image,
                            name: user.name,
                            phoneNumber: user.phoneNumber
                        })
                    })
            })
            .catch(next)
    })
    .post()
    .delete();


router.route('/user/change')
    .post(auth.verifyUser, (req, res, next) => {
        User.findOne({
                _id: req.user._id
            })
            .then((user) => {
                if (user == null) {
                    let err = new Error("Invalid user");
                    err.status = 401;
                    return next(err);
                } else {
                    bcrypt.compare(req.body.password, user.password)
                        .then((isMatch) => {
                            if (!isMatch) {
                                let err = new Error('Incorrect password');
                                err.status = 401;
                                return next(err);
                            }
                            res.json({
                                status: 'Correct password!',
                            });
                        }).catch(next);
                }
            })
            .catch(next)
    })

    .put(auth.verifyUser, (req, res, next) => {
        let password = req.body.password;
        bcrypt.hash(password, 10, function (err, hash) {
            if (err) {
                let err = new Error('Could not hash!');
                err.status = 500;
                return next(err);
            }
            User.findByIdAndUpdate({
                    _id: req.user._id
                }, {
                    password: hash
                })
                .then(() => {
                    User.findOne({
                            _id: req.user._id
                        })
                        .then(() => {
                            res.json({
                                status: 'password changed'
                            })
                        })
                })
                .catch(next)

        });
    })
    .get()
    .delete();

module.exports = router;

/**
 * @swagger
 * /signup:
 *  post:
 *   tags:
 *    - Users
 *   description: User registration
 *   produces:
 *    - application/json
 *   consumes:
 *    - application/json
 *   parameters:
 *    - name: user
 *      in: body
 *      type: string
 *      description: The user to create
 *      schema:
 *        type: object
 *        required:
 *          - email
 *          - name
 *          - phoneNumber
 *          - password
 *        uniqueItems:
 *          - email
 *          - phoneNumber
 *        properties:
 *          email:
 *            type: string
 *          name:
 *            type: string
 *          phoneNumber:
 *            type: string
 *          password:
 *            type: string
 *          image:
 *            type: string
 *   responses:
 *    201:
 *     description: Signup success
 *    500:
 *     description: could not hash
 */

/**
 * @swagger
 * /login:
 *  post:
 *   tags:
 *    - Users
 *   description: User login
 *   produces:
 *    - application/json
 *   consumes:
 *    - application/json
 *   parameters:
 *    - name: user
 *      in: body
 *      type: string
 *      description: The user to create
 *      schema:
 *        type: object
 *        required:
 *          - email
 *          - password
 *        uniqueItems:
 *          - email
 *        properties:
 *          email:
 *            type: string
 *          password:
 *            type: string
 *   responses:
 *    200:
 *     description: Login success!
 *    401:
 *     description: Incorrect username or password
 */

/**
 * @swagger
 * /me:
 *  get:
 *   tags:
 *    - Users
 *   description: Retrieve particular user details
 *   produces:
 *    - application/json
 *   security:
 *    - bearerAuth: []
 *   responses:
 *    200:
 *     description: successful
 *    401:
 *     description: Bearer token error
 *    500:
 *     description: Token could not be verified
 *  put:
 *   tags:
 *    - Users
 *   description: Change user details
 *   produces:
 *    - application/json
 *   consumes:
 *    - application/json
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - name: user
 *      in: body
 *      type: string
 *      description: User details to be updated
 *      schema:
 *        type: object
 *        required:
 *          - email
 *          - name
 *          - phoneNumber
 *          - password
 *        uniqueItems:
 *          - email
 *          - phoneNumber
 *        properties:
 *          email:
 *            type: string
 *          name:
 *            type: string
 *          phoneNumber:
 *            type: string
 *          image:
 *            type: string
 *   responses:
 *    200:
 *     description: updated user
 *    401:
 *     description: Bearer token error
 *    500:
 *     description: Internal server error
 */

/**
 * @swagger
 * /user/change:
 *  post:
 *   tags:
 *    - Users
 *   description: check user current password
 *   produces:
 *    - application/json
 *   consumes:
 *    - application/json
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - name: user
 *      in: body
 *      type: string
 *      description: user current password
 *      schema:
 *        type: object
 *        required:
 *          - email
 *          - password
 *        uniqueItems:
 *          - email
 *        properties:
 *          password:
 *            type: string
 *   responses:
 *    200:
 *     description: Correct password
 *    401:
 *     description: invalid user or incorrect password or token error
 *    500:
 *     description: Token could not be verified
 *  put:
 *   tags:
 *    - Users
 *   description: Change user password
 *   produces:
 *    - application/json
 *   consumes:
 *    - application/json
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - name: password
 *      in: body
 *      type: string
 *      description: User new password
 *      schema:
 *        type: object
 *        required:
 *          - password
 *        properties:
 *          password:
 *            type: string
 *   responses:
 *    200:
 *     description: Password change successful
 *    401:
 *     description: Bearer token error
 *    500:
 *     description: Could not hash
 */