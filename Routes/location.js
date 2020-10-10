const express = require('express');
const Location = require('../Model/location');
const auth = require('../auth');

const router = express.Router();

router.route('/mylocation')
    .get(auth.verifyUser, (req, res, next) => {
        Location.find({
                users: req.user._id
            })
            .then((location) => {
                res.status(200);
                res.json(location);
            })
            .catch(next);
    })
    .post(auth.verifyUser, (req, res, next) => {
        let newLocation = new Location(req.body);
        newLocation.users = req.user._id
        newLocation.save()
            .then((location) => {
                res.statusCode = 201;
                res.json(location);
            })
            .catch(next);
    })
    .delete(auth.verifyUser, (req, res) => {
        res.statusCode = 405;
        res.json({
            message: "Method not allowed"
        });
    })
    .put(auth.verifyUser, (req, res) => {
        res.statusCode = 405;
        res.json({
            message: "Method not allowed"
        });
    })


router.route('/mylocation/:id')
    .get(auth.verifyUser, auth.verifyAdmin, (req, res, next) => {
        Location.findOne({
                _id: req.params.id
            })
            .then((location) => {
                res.status(200);
                res.json(location);
            })
            .catch(next);
    })

    .put(auth.verifyUser, (req, res, next) => {
        Location.findOneAndUpdate({
                _id: req.params.id,
                users: req.user._id
            }, {
                $set: req.body
            })
            .then((location) => {
                if (location == null) throw new Error("Entry not found!");
                Location.findOne({
                        _id: req.params.id
                    })
                    .then((newLocation) => {
                        res.status(200);
                        res.json(newLocation);
                    })
            }).catch(next)
    })

    .delete(auth.verifyUser, (req, res, next) => {
        Location.findOneAndDelete({
                _id: req.params.id,
                users: req.user._id
            })
            .then((location) => {
                if (location == null) throw new Error("Unable to delete!");
                res.status(200);
                res.json({
                    status: 'Location deleted successfully'
                });
            }).catch(next);
    })

    .post();


module.exports = router;


/**
 * @swagger
 * /mylocation:
 *  get:
 *   tags:
 *    - Location
 *   description: Retrieve particular user's all location
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
 *  post:
 *   tags:
 *    - Location
 *   description: Create new user location
 *   produces:
 *    - application/json
 *   consumes:
 *    - application/json
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - name: location
 *      in: body
 *      type: string
 *      description: location details
 *      schema:
 *        type: object
 *        required:
 *          - name
 *          - latitude
 *          - longitude
 *        properties:
 *          name:
 *            type: string
 *          latitude:
 *            type: string
 *          longitude:
 *            type: string
 *          additionalInfo:
 *            type: string
 *          users:
 *            type: string
 *   responses:
 *    201:
 *     description: location created successfully
 *    401:
 *     description: Bearer token error or unauthorized
 *    500:
 *     description: Internal server error
 *  delete:
 *   tags:
 *    - Location
 *   produces:
 *    - application/json
 *   security:
 *    - bearerAuth: []
 *   responses:
 *    405:
 *     description: Method not allowed
 *    500:
 *     description: Internal server error
 *  put:
 *   tags:
 *    - Location
 *   produces:
 *    - application/json
 *   security:
 *    - bearerAuth: []
 *   responses:
 *    405:
 *     description: Method not allowed
 *    500:
 *     description: Internal server error
 */


/**
 * @swagger
 * /mylocation/{id}:
 *  get:
 *   tags:
 *    - Location
 *   description: Retrieve particular user's single location
 *   produces:
 *    - application/json
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - name: id
 *      in: path
 *      required: true
 *      description: Location Id
 *   responses:
 *    200:
 *     description: Successful
 *    401:
 *     description: Bearer token error or unauthorized
 *    500:
 *     description: Internal server error/ token could not be verified
 *    403:
 *     description: Forbidden
 *  delete:
 *   tags:
 *    - Location
 *   description: Delete particular user's location
 *   produces:
 *    - application/json
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - name: id
 *      in: path
 *      required: true
 *      description: Location Id
 *   responses:
 *    200:
 *     description: Successfully deleted
 *    401:
 *     description: Bearer token error or unauthorized
 *    500:
 *     description: Internal server error
 *  put:
 *   tags:
 *    - Location
 *   description: Update particular user's location
 *   produces:
 *    - application/json
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - name: id
 *      in: path
 *      required: true
 *      description: Location Id
 *    - name: location
 *      in: body
 *      type: string
 *      description: location details
 *      schema:
 *        type: object
 *        required:
 *          - name
 *          - latitude
 *          - longitude
 *        properties:
 *          name:
 *            type: string
 *          latitude:
 *            type: string
 *          longitude:
 *            type: string
 *          additionalInfo:
 *            type: string
 *   responses:
 *    200:
 *     description: Successfully updated
 *    401:
 *     description: Bearer token error or unauthorized
 *    500:
 *     description: Internal server error
 */