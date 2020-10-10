const express = require('express');
const Order = require('../Model/order');
const auth = require('../auth');

const router = express.Router();

router.get("/order", auth.verifyUser, auth.verifyAdmin, (req, res, next) => {
    Order.find({})
        .then((order) => {
            res.json(order);
        })
        .catch(next);
});
router.route("/order/:id")
    .post(auth.verifyUser, async (req, res) => {
        const {
            foodId,
            quantity,
            price
        } = req.body;

        const locationId = req.params.id;
        const userId = req.user._id;
        try {
            let order = await Order.findOne({
                users: userId,
                active: true
            });
            if (order) {
                let itemIndex = order.foods.findIndex(p => p.foodId == foodId);
                if (itemIndex > -1) {
                    let orerItem = order.foods[itemIndex];
                    orerItem.quantity = quantity;
                    order.foods[itemIndex] = orerItem;
                } else {
                    order.foods.push({
                        foodId,
                        quantity,
                        price
                    });
                }
                order = await order.save();
                return res.status(201).send({
                    status: 'Created successfully',
                    _id:order._id
                });
            } else {
                order = await Order.create({
                    users: userId,
                    foods: [{
                        foodId,
                        quantity,
                        price
                    }],
                    locations: locationId
                });
                return res.status(201).send({
                    status: 'Created successfully',
                    _id:order._id
                });
            }
        } catch (err) {
            console.log(err);
            res.status(500).send({
                status: "Something went wrong"
            });
        }
    })
    .put(auth.verifyUser, auth.verifyAdmin, (req, res, next) => {
        Order.findOne({
                _id: req.params.id
            })
            .then((order) => {
                res.status(200);
                if (order.active == true) {
                    Order.findByIdAndUpdate({
                            _id: req.params.id
                        }, {
                            active: req.body.active
                        })
                        .then(() => {
                            res.status(200);
                            res.json({
                                status: 'Delivered successfully'
                            })
                        }).catch(next);
                } else {
                    res.status(409);
                    res.json({
                        status: 'Delivery is closed'
                    })
                }
            }).catch(next);
    })
router.get("/order/user", auth.verifyUser, (req, res, next) => {
    Order.findOne({
            users: req.user._id
        })
        .then((order) => {
            if (order.active === false) {
                res.json({
                    status: "Delivered"
                });
            } else {
                res.json({
                    status: "Active"
                });
            }
        })
        .catch(next);
})



module.exports = router;

/**
 * @swagger
 * /order:
 *  get:
 *   tags:
 *    - Food order
 *   description: Retrieve all order of users by admin
 *   produces:
 *    - application/json
 *   security:
 *    - bearerAuth: []
 *   responses:
 *    200:
 *     description: Retrieved successfully
 *    401:
 *     description: Bearer token error or unauthorized
 *    500:
 *     description: Internal server error/ token could not be verified
 *    403:
 *     description: Forbidden
 */

/**
 * @swagger
 * /order/{id}:
 *  post:
 *   tags:
 *    - Food order
 *   description: Order food and add food to basket
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
 *      description: Location Id
 *    - name: foods
 *      in: body
 *      type: string
 *      description: food order details
 *      schema:
 *        type: object
 *        required:
 *          - foodId
 *        properties:
 *          foodId:
 *            type: string
 *          quantity:
 *            type: number
 *          price:
 *            type: number
 *   responses:
 *    201:
 *     description: Created successfully
 *    500:
 *     description: Something went wrong
 *    401:
 *     description: Bearer token error or unauthorized
 *  put:
 *   tags:
 *    - Food order
 *   description: Change status of the user order by admin
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
 *      description: Order Id
 *    - name: status
 *      in: body
 *      type: string
 *      description: order status
 *      schema:
 *        type: object
 *        required:
 *          - active
 *        properties:
 *          active:
 *            type: boolean
 *   responses:
 *    200:
 *     description: Delivery completed
 *    409:
 *     description: Delivery is closed
 *    401:
 *     description: Bearer token error or unauthorized
 *    500:
 *     description: Internal server error/ token could not be verified
 *    403:
 *     description: Forbidden
 * /order/user:
 *  get:
 *   tags:
 *    - Food order
 *   description: Retrieve basket of particular
 *   produces:
 *    - application/json
 *   security:
 *    - bearerAuth: []
 *   responses:
 *    200:
 *     description: Retrieved successfully
 *    401:
 *     description: Bearer token error or unauthorized
 *    500:
 *     description: Internal server error/ token could not be verified
 */