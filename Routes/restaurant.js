const express = require('express');
const Restarant = require('../Model/restaurant');
const auth = require('../auth');

const router = express.Router();

router.route('/restaurant')
    .post(auth.verifyUser, auth.verifyAdmin, (req, res, next) => {
        Restarant.create(req.body)
            .then((restaurant) => {
                res.statusCode = 201;
                res.json(restaurant);
            })
            .catch(next);
    })
    .get((req, res, next) => {
        Restarant.find({})
            .then((restaurant) => {
                res.status(200);
                res.json(restaurant);
            })
            .catch(next);
    })
    .put(auth.verifyUser, (req, res) => {
        res.statusCode = 405;
        res.json({
            message: "Method not allowed"
        });
    })
    .delete(auth.verifyUser, (req, res) => {
        res.statusCode = 405;
        res.json({
            message: "Method not allowed"
        });
    })

router.route('/restaurant/:id')
    .put(auth.verifyUser, auth.verifyAdmin, (req, res, next) => {
        Restarant.findByIdAndUpdate(
                req.params.id, {
                    $set: req.body
                })
            .then((restaurant) => {
                if (restaurant == null) throw new Error("Restaurant not found!");
                Restarant.find({
                        _id: req.params.id
                    })
                    .then((newRestaurant) => {
                        res.status(200);
                        res.json(newRestaurant);
                    })
            }).catch(next);
    })

    .delete(auth.verifyUser, auth.verifyAdmin, (req, res, next) => {
        Restarant.findOneAndDelete({
                _id: req.params.id
            })
            .then((restaurant) => {
                if (restaurant == null) throw new Error("Restaurant not found!");
                res.json({
                    status: 'Restaurant deleted successfully'
                });
            }).catch(next);
    })
    .get((req, res, next) => {
        Restarant.findOne({
                _id: req.params.id
            })
            .then((restarant) => {
                if (restarant == null) throw new Error("Restaurant not found!");
                res.status(200);
                res.json(restarant);
            })
            .catch(next)
    })
    .post();

module.exports = router;

/**
 * @swagger
 * /restaurant:
 *  get:
 *   tags:
 *    - Restaurant
 *   description: Retrieve all available restaurant details
 *   produces:
 *    - application/json
 *   responses:
 *    200:
 *     description: Successful
 *    500:
 *     description: Internal server error
 *  post:
 *   tags:
 *    - Restaurant
 *   description: Create new restaurant entry by admin
 *   produces:
 *    - application/json
 *   consumes:
 *    - application/json
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - name: restaurant
 *      in: body
 *      type: string
 *      description: restaurant details
 *      schema:
 *        type: object
 *        required:
 *          - name
 *        properties:
 *          name:
 *            type: string
 *          about:
 *            type: string
 *          location:
 *            type: string
 *          image:
 *            type: string
 *   responses:
 *    201:
 *     description: restaurant created successfully
 *    401:
 *     description: Bearer token error or unauthorized
 *    500:
 *     description: Internal server error/ token could not be verified
 *    403:
 *     description: Forbidden
 *  delete:
 *   tags:
 *    - Restaurant
 *   produces:
 *    - application/json
 *   responses:
 *    405:
 *     description: Method not allowed
 *  put:
 *   tags:
 *    - Restaurant
 *   produces:
 *    - application/json
 *   responses:
 *    405:
 *     description: Method not allowed
 */

/**
 * @swagger
 * /restaurant/{id}:
 *  put:
 *   tags:
 *    - Restaurant
 *   description: update restaurant details
 *   produces:
 *    - application/json
 *   consumes:
 *    - application/json
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - name: id
 *      in: path
 *      required: true
 *      description: Restaurant Id
 *    - name: restaurant
 *      in: body
 *      type: string
 *      description: restaurant details
 *      schema:
 *        type: object
 *        required:
 *          - name
 *        properties:
 *          name:
 *            type: string
 *          about:
 *            type: string
 *          location:
 *            type: string
 *   responses:
 *    200:
 *     description: Updated successfully
 *    401:
 *     description: Bearer token error or unauthorized
 *    500:
 *     description: Internal server error/ token could not be verified
 *    403:
 *     description: Forbidden
 *  delete:
 *   tags:
 *    - Restaurant
 *   description: Delete particular restaurant
 *   produces:
 *    - application/json
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - name: id
 *      in: path
 *      required: true
 *      description: Restaurant Id
 *   responses:
 *    200:
 *     description: Successfully deleted
 *    401:
 *     description: Bearer token error or unauthorized
 *    500:
 *     description: Internal server error/ token could not be verified
 *    403:
 *     description: Forbidden
 *  get:
 *   tags:
 *    - Restaurant
 *   description: Retrieve particular restaurant details
 *   produces:
 *    - application/json
 *   parameters:
 *    - name: id
 *      in: path
 *      required: true
 *      description: Restaurant Id
 *   responses:
 *    200:
 *     description: Successful
 *    500:
 *     description: Internal server error
 */