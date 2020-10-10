const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const express = require('express');
const connection = require('./config/dbConnect');
const swaggerOptions = require('./config/swaggerDef');
const bodyParser = require('body-parser');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const userRouter = require('./Routes/user');
const foodRouter = require('./Routes/food');
const orderRouter = require('./Routes/order');
const uploadRouter = require('./Routes/upload');
const locationRouter = require('./Routes/location');
const feedbackRouter = require('./Routes/feedback');
const restaurantRouter = require('./Routes/restaurant');
const auth = require('./auth');

dotenv.config();
const app = express();
app.use(express.json());
app.use(morgan("tiny"));
app.options('*', cors());
let allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Headers', "*");
    next();
  }
  app.use(allowCrossDomain);
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(__dirname + "/public"));
let swaggerSpecs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpecs));

app.use('/', userRouter);
app.use('/', uploadRouter);
app.use('/', foodRouter);
app.use('/', restaurantRouter);
app.use('/', feedbackRouter);
app.use(auth.verifyUser);
app.use('/', orderRouter);
app.use('/', locationRouter);


app.use((err, req, res) => {
    console.error(err.stack);
    res.status(500);
    res.json({
        status: err.message
    });
});
connection.connect()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`App is running at localhost:${process.env.PORT}`);
        });
    })

module.exports = app;