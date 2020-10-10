const express = require('express');
const Feedback = require('../Model/feedback');
const auth = require('../auth');

const router = express.Router();

router.route('/feedback')
    .post((req, res, next) => {
        Feedback.create(req.body)
            .then(() => {
                res.statusCode = 201;
                res.json({status:'Feedback sent successfully'});
            })
            .catch(next);
    })
    .get(auth.verifyUser, auth.verifyAdmin, (req, res, next) => {
        Feedback.find({})
            .then((feedback) => {
                res.json(feedback);
            })
            .catch(next);
    })
    .put()
    .delete();


module.exports = router;

/**
 * @swagger
 * /feedback:
 *  post:
 *   tags:
 *    - Customer feedback
 *   description: Send customer feedback
 *   produces:
 *    - application/json
 *   consumes:
 *    - application/json
 *   parameters:
 *    - name: feedback
 *      in: body
 *      type: string
 *      description: feedback details
 *      schema:
 *        type: object
 *        required:
 *          - email
 *        properties:
 *          email:
 *            type: string
 *          feedbackmsg:
 *            type: string
 *   responses:
 *    201:
 *     description: Feedback sent successfully
 *    500:
 *     description: Internal server error
 *  get:
 *   tags:
 *    - Customer feedback
 *   description: Retrieve all feedbacks
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