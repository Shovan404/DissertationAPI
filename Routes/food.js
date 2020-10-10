const express = require('express');
const Food = require('../Model/food');
const auth = require('../auth');
const cors = require('cors');

const router = express.Router();

router.get('/restaurant/food/:id', (req, res, next) => {
    Food.find({
            restaurants: req.params.id
        })
        .then((food) => {
            if (food == null) throw new Error("Food not found!");
            res.status(200);
            res.json(food);
        })
        .catch(next);
});

router.get('/searchfood/:search', cors(), (req, res, next) => {
    let searchText = req.params.search;
    Food.find({
            $text: {
                $search: searchText
            }
        })
        .then((food) => {
            res.status(200);
            res.json(food);
        })
        .catch(next);
});

router.route('/food')
    .get((req, res, next) => {
        Food.find({})
            .then((food) => {
                res.json(food);
            })
            .catch(next);
    })
    .post(auth.verifyUser, auth.verifyAdmin, (req, res, next) => {
        let newFood = new Food(req.body);
        newFood.save()
            .then((food) => {
                res.statusCode = 201;
                res.json(food);
            })
            .catch(next);
    })
    .put(auth.verifyUser,(req, res) => {
        res.statusCode = 405;
        res.json({
            message: "Method not allowed"
        });
    })
    .delete(auth.verifyUser,(req, res) => {
        res.statusCode = 405;
        res.json({
            message: "Method not allowed"
        });
    })

router.route('/food/:id')
    .put(auth.verifyUser, auth.verifyAdmin, (req, res, next) => {
        Food.findByIdAndUpdate(
                req.params.id, {
                    $set: req.body
                })
            .then((food) => {
                if (food == null) throw new Error("Food not found!");
                res.status(200);
                Food.findOne({
                        _id: req.params.id
                    })
                    .then((newFood) => {
                        res.json(newFood);
                    })
            }).catch(next);
    })
    .delete(auth.verifyUser, auth.verifyAdmin, (req, res, next) => {
        Food.findOneAndDelete({
                _id: req.params.id
            })
            .then((food) => {
                if (food == null) throw new Error("Food not found!");
                res.status(200);
                res.json({status:'Food deleted successfully'});
            }).catch(next);
    })
    .get((req, res, next) => {
        Food.findOne({
                _id: req.params.id
            })
            .then((food) => {
                if (food == null) throw new Error("Food not found!");
                res.status(200);
                res.json(food);
            })
            .catch(next)
    })
    .post();

module.exports = router;

/**
 * @swagger
 * /food:
 *  get:
 *   tags:
 *    - Food
 *   description: Retrieve all available food details
 *   produces:
 *    - application/json
 *   responses:
 *    200:
 *     description: Successful
 *    500:
 *     description: Internal server error
 *  post:
 *   tags:
 *    - Food
 *   description: Create new food entry by admin
 *   produces:
 *    - application/json
 *   consumes:
 *    - application/json
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - name: food
 *      in: body
 *      type: string
 *      description: food details
 *      schema:
 *        type: object
 *        required:
 *          - foodName
 *          - restaurants
 *          - foodPrice
 *        properties:
 *          foodName:
 *            type: string
 *          restaurants:
 *            type: string
 *          foodPrice:
 *            type: number
 *          description:
 *            type: string
 *          image:
 *            type: string
 *   responses:
 *    201:
 *     description: food created successfully
 *    401:
 *     description: Bearer token error or unauthorized
 *    500:
 *     description: Internal server error/ token could not be verified
 *    403:
 *     description: Forbidden
 *  delete:
 *   tags:
 *    - Food
 *   produces:
 *    - application/json
 *   responses:
 *    405:
 *     description: Method not allowed
 *  put:
 *   tags:
 *    - Food
 *   produces:
 *    - application/json
 *   responses:
 *    405:
 *     description: Method not allowed
 */

/**
 * @swagger
 * /food/{id}:
 *  put:
 *   tags:
 *    - Food
 *   description: update food details
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
 *      description: Food Id
 *    - name: food
 *      in: body
 *      type: string
 *      description: food details
 *      schema:
 *        type: object
 *        required:
 *          - foodName
 *          - foodPrice
 *        properties:
 *          foodName:
 *            type: string
 *          restaurants:
 *            type: string
 *          foodPrice:
 *            type: number
 *          description:
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
 *    - Food
 *   description: Delete particular food
 *   produces:
 *    - application/json
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - name: id
 *      in: path
 *      required: true
 *      description: Food Id
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
 *    - Food
 *   description: Retrieve particular food details
 *   produces:
 *    - application/json
 *   parameters:
 *    - name: id
 *      in: path
 *      required: true
 *      description: Food Id
 *   responses:
 *    200:
 *     description: Successful
 *    500:
 *     description: Internal server error
 */

/**
 * @swagger
 * /restaurant/food/{id}:
 *  get:
 *   tags:
 *    - Food
 *   description: Retrieve particular restaurant all food details
 *   produces:
 *    - application/json
 *   parameters:
 *    - name: id
 *      in: path
 *      required: true
 *      description: Food Id
 *   responses:
 *    200:
 *     description: Successful
 *    500:
 *     description: Internal server error
 */

/**
 * @swagger
 * /searchfood/{search}:
 *  get:
 *   tags:
 *    - Food
 *   description: Retrieve particular restaurant all food details
 *   produces:
 *    - application/json
 *   parameters:
 *    - name: search
 *      in: path
 *      required: true
 *      description: food name text
 *   responses:
 *    200:
 *     description: Successful
 *    500:
 *     description: Internal server error
 */