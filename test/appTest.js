'use strict';
process.env.NODE_ENV = 'test';

const path = require("path");
const app = require('../index.js')
const request = require('supertest');
const expect = require('chai').expect;
const conn = require('../config/dbConnect');


//new admin and ordinary user

let adminUser = {
    email: 'admin',
    name: 'admin',
    phoneNumber: '123456789',
    password: 'admin',
    image: 'admin',
    admin: true
}
let adminJwtToken = '';

let normalUser = {
    email: 'user',
    name: 'user',
    phoneNumber: '987654321',
    password: 'password',
    image: 'user',
};
let userJwtToken = '';

before(function (done) {
    this.timeout(15000)
    conn.connect()
        .then(() => done())
        .catch((err) => done(err));
});
after((done) => {
    conn.close()
        .then(() => done())
        .catch((err) => done(err));
});

//user unit testing

describe('POST /signup admin', () => {
    it('OK, should get valid admin JWT token', (done) => {
        request(app).post('/signup').send(adminUser)
            .then((res) => {
                expect(res.statusCode).to.equal(201)
                expect(res.body).to.contain.property('token');
                adminJwtToken = `Bearer ${res.body.token}`;
                console.log(adminJwtToken);
                done();
            })
            .catch((err) => done(err));
    })
});


describe('POST /signup user', () => {
    it('OK, should get valid user JWT token', (done) => {
        request(app).post('/signup').send(normalUser)
            .then((res) => {
                expect(res.statusCode).to.equal(201)
                expect(res.body).to.contain.property('token');
                userJwtToken = `Bearer ${res.body.token}`;
                console.log(userJwtToken);
                done();
            })
            .catch((err) => done(err));
    })
});

describe('POST /signup', () => {
    it('Fail, should get error empty email and phonenumber', (done) => {
        request(app).post('/signup').send({
                email: '',
                name: 'aabb',
                phoneNumber: '',
                password: 'password'
            })
            .then((res) => {
                expect(res.statusCode).to.equal(500)
                expect(res.body).to.be.empty;
                done();
            })
            .catch((err) => done(err));
    })
});

describe('POST /login admin', () => {
    it('OK, should get valid admin JWT token', (done) => {
        request(app).post('/login')
            .send({
                email: adminUser.email,
                password: adminUser.password
            })
            .then((res) => {
                expect(res.statusCode).to.equal(200)
                expect(res.body).to.contain.property('token');
                done();
            })
            .catch((err) => done(err));
    })
});

describe('POST /login normal user', () => {
    it('OK, should get valid user JWT token', (done) => {
        request(app).post('/login')
            .send({
                email: normalUser.email,
                password: normalUser.password
            })
            .then((res) => {
                expect(res.statusCode).to.equal(200)
                expect(res.body).to.contain.property('token');
                done();
            })
            .catch((err) => done(err));
    })
});

describe('POST /login', () => {
    it('Fail, should error logging incorrect email or password', (done) => {
        request(app).post('/login')
            .send({
                email: 'wrongemail',
                password: 'wrongpassword'
            })
            .then((res) => {
                expect(res.statusCode).to.equal(401);
                expect(res.body).to.be.empty;
                done();
            })
            .catch((err) => done(err));
    })
});

describe('GET /me', () => {
    it('OK, should provide user details', (done) => {
        request(app).get('/me')
            .set('Authorization', userJwtToken)
            .then((res) => {
                const body = res.body;
                expect(body).to.contain.property('_id');
                expect(body).to.contain.property('email', 'user');
                expect(body).to.contain.property('image', 'user');
                expect(body).to.contain.property('name', 'user');
                expect(body).to.contain.property('phoneNumber', '987654321');
                done();
            })
            .catch((err) => done(err));
    })
});

describe('GET /me', () => {
    it('Fail, wrong bearer token', (done) => {
        request(app).get('/me')
            .set('Authorization', 'wrong bearer token')
            .then((res) => {
                expect(res.statusCode).to.equal(500);
                expect(res.body).to.be.empty;
                done();
            })
            .catch((err) => done(err));
    })
});

describe('GET /me', () => {
    it('OK, should update user details', (done) => {
        request(app).put('/me')
            .set('Authorization', userJwtToken)
            .send({
                email: 'editeduser',
                name: 'editeduser',
                phoneNumber: 'editeduser',
                image: 'editeduser'
            })
            .then((res) => {
                const body = res.body;
                expect(res.statusCode).to.equal(200);
                expect(body).to.contain.property('_id');
                expect(body).to.contain.property('email', 'editeduser');
                expect(body).to.contain.property('image', 'editeduser');
                expect(body).to.contain.property('name', 'editeduser');
                expect(body).to.contain.property('phoneNumber', 'editeduser');
                done();
            })
            .catch((err) => done(err));
    })
});

describe('GET /me', () => {
    it('Fail, wrong bearer token', (done) => {
        request(app).put('/me')
            .set('Authorization', 'wrong token')
            .send({
                email: 'editeduser2',
                name: 'editeduser2',
                phoneNumber: 'editeduser2',
                image: 'editeduser2'
            })
            .then((res) => {
                expect(res.statusCode).to.equal(500);
                expect(res.body).to.be.empty;
                done();
            })
            .catch((err) => done(err));
    })
});

describe('POST and PUT /user/change ', () => {
    it('OK, should validate user details and change password', (done) => {
        request(app).post('/user/change')
            .set('Authorization', userJwtToken)
            .send({
                password: normalUser.password
            })
            .then((res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.contain.property('status', 'Correct password!');
                request(app).put('/user/change')
                    .set('Authorization', userJwtToken)
                    .send({
                        password: 'newpassword'
                    })
                    .then((resp) => {
                        const body = resp.body;
                        expect(resp.statusCode).to.equal(200);
                        expect(body).to.contain.property('status', 'password changed');
                        done();
                    })
                    .catch((err) => done(err));
            })
            .catch((err) => done(err));
    })
});


describe('POST /user/change ', () => {
    it('Fail, Wrong old password changing password', (done) => {
        request(app).post('/user/change')
            .set('Authorization', userJwtToken)
            .send({
                password: 'wrong password'
            })
            .then((res) => {
                expect(res.statusCode).to.equal(401);
                expect(res.body).to.be.empty;
                done();
            })
            .catch((err) => done(err));
    })
});

describe('PUT /user/change ', () => {
    it('Fail, Wrong bearer token changing password', (done) => {
        request(app).put('/user/change')
            .set('Authorization', 'wrong bearer token')
            .send({
                password: 'newpassword'
            })
            .then((res) => {
                expect(res.statusCode).to.equal(500);
                expect(res.body).to.be.empty;
                done();
            })
            .catch((err) => done(err))
    })
});

// feedback unit testing

describe('POST /feedback', () => {
    it('OK, send feedback to the server', (done) => {
        request(app).post('/feedback')
            .send({
                email: "email.com",
                feedbackmsg: "feedback message"
            })
            .then((res) => {
                expect(res.statusCode).to.equal(201);
                expect(res.body).to.contain.property('status', 'Feedback sent successfully');
                done();
            })
            .catch((err) => done(err));
    })
});

describe('POST /feedback', () => {
    it('Fail, empty email', (done) => {
        request(app).post('/feedback')
            .send({
                email: "",
                feedbackmsg: "feedback message"
            })
            .then((res) => {
                const body = res.body;
                expect(res.statusCode).to.equal(500);
                expect(body).to.be.empty;
                done();
            })
            .catch((err) => done(err));
    })
});

describe('GET /feedback', () => {
    it('OK, should provide all feedbacks', (done) => {
        request(app).get('/feedback')
            .set('Authorization', adminJwtToken)
            .then((res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.not.be.empty;
                done();
            })
            .catch((err) => done(err))
    })
});

describe('GET /feedback', () => {
    it('Fail, not admin bearer token', (done) => {
        request(app).get('/feedback')
            .set('Authorization', userJwtToken)
            .then((res) => {
                expect(res.statusCode).to.equal(403);
                expect(res.body).to.be.empty;
                done();
            })
            .catch((err) => done(err))
    })
});

//image upload unit testing

describe('POST /upload', () => {
    it('OK, send imagefile to upload', (done) => {
        request(app).post('/upload')
            .set('Content-Type', 'multipart/form-data')
            .attach('imageFile', path.resolve(__dirname, "resources/thomas.jpeg"))
            .then((res) => {
                const body = res.body;
                expect(res.statusCode).to.equal(200);
                expect(body).to.contain.property('fieldname');
                expect(body).to.contain.property('originalname');
                expect(body).to.contain.property('encoding');
                expect(body).to.contain.property('destination');
                expect(body).to.contain.property('filename');
                expect(body).to.contain.property('path');
                expect(body).to.contain.property('size');
                done();
            })
            .catch((err) => done(err));
    })
});

describe('POST /upload', () => {
    it('Fail, send invalid non image file', (done) => {
        request(app).post('/upload')
            .set('Content-Type', 'multipart/form-data')
            .attach('imageFile', path.resolve(__dirname, "resources/thomas.pdf"))
            .then((res) => {
                expect(res.statusCode).to.equal(500);
                expect(res.body).to.be.empty;
                done();
            })
            .catch((err) => done(err));
    })
});

// location testing

let locationId = '';

describe('POST /mylocation', () => {
    it('OK, create new user location', (done) => {
        request(app).post('/mylocation')
            .set('Authorization', userJwtToken)
            .send({
                name: "location name",
                latitude: "latitude",
                longitude: "longitude",
                additionalInfo: "additional information"
            })
            .then((res) => {
                expect(res.statusCode).to.equal(201);
                expect(res.body).to.not.be.empty;
                locationId = res.body._id
                done();
            })
            .catch((err) => done(err));
    })
});

describe('POST /mylocation', () => {
    it('Fail, empty fields of location', (done) => {
        request(app).post('/mylocation')
            .set('Authorization', userJwtToken)
            .send({
                longitude: "longitude",
                additionalInfo: "additional information"
            })
            .then((res) => {
                const body = res.body;
                expect(res.statusCode).to.equal(500);
                expect(body).to.be.empty;
                done();
            })
            .catch((err) => done(err));
    })
});

describe('GET /mylocation', () => {
    it('OK, should provide particular user locations', (done) => {
        request(app).get('/mylocation')
            .set('Authorization', userJwtToken)
            .then((res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.not.be.empty;
                done();
            })
            .catch((err) => done(err))
    })
});

describe('GET /mylocation', () => {
    it('Fail, incorrect bearer token', (done) => {
        request(app).get('/mylocation')
            .set('Authorization', 'wrong bearer token')
            .then((res) => {
                expect(res.statusCode).to.equal(500);
                expect(res.body).to.be.empty;
                done();
            })
            .catch((err) => done(err))
    })
});

describe('DELETE /mylocation', () => {
    it('OK, Forbidden', (done) => {
        request(app).delete('/mylocation')
            .set('Authorization', userJwtToken)
            .then((res) => {
                expect(res.statusCode).to.equal(405);
                expect(res.body).to.contain.property('message', 'Method not allowed');
                done();
            })
            .catch((err) => done(err))
    })
});

describe('PUT /mylocation', () => {
    it('OK, Forbidden', (done) => {
        request(app).put('/mylocation')
            .set('Authorization', userJwtToken)
            .then((res) => {
                expect(res.statusCode).to.equal(405);
                expect(res.body).to.contain.property('message', 'Method not allowed');
                done();
            })
            .catch((err) => done(err))
    })
});

describe('GET /mylocation/:id', () => {
    it('OK, should provide particular location for admin token', (done) => {
        request(app).get('/mylocation/' + locationId)
            .set('Authorization', adminJwtToken)
            .then((res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.not.be.empty;
                done();
            })
            .catch((err) => done(err))
    })
});

describe('GET /mylocation/:id', () => {
    it('Fail, should not provide particular location for user token', (done) => {
        request(app).get('/mylocation/' + locationId)
            .set('Authorization', userJwtToken)
            .then((res) => {
                expect(res.statusCode).to.equal(403);
                expect(res.body).to.be.empty;
                done();
            })
            .catch((err) => done(err))
    })
});

describe('PUT /mylocation/:id', () => {
    it('OK, update user location', (done) => {
        request(app).put('/mylocation/' + locationId)
            .set('Authorization', userJwtToken)
            .send({
                name: "new location name",
                latitude: "new latitude",
                longitude: "new longitude",
                additionalInfo: "new additional information"
            })
            .then((res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.not.be.empty;
                done();
            })
            .catch((err) => done(err));
    })
});

describe('PUT /mylocation/:id', () => {
    it('Fail, Invalid user bearer token', (done) => {
        request(app).put('/mylocation/' + locationId)
            .set('Authorization', 'wrong bearer token')
            .send({
                name: "new location name",
                latitude: "new latitude",
                longitude: "new longitude",
                additionalInfo: "new additional information"
            })
            .then((res) => {
                expect(res.statusCode).to.equal(500);
                expect(res.body).to.be.empty;
                done();
            })
            .catch((err) => done(err));
    })
});

describe('POST DELETE /mylocation/:id', () => {
    it('OK, create new user location and delete through same user', (done) => {
        request(app).post('/mylocation')
            .set('Authorization', userJwtToken)
            .send({
                name: "to be deleted location",
                latitude: "to be deleted latitude",
                longitude: "to be deleted longitude",
                additionalInfo: "to be deleted additional information"
            })
            .then((res) => {
                let id = res.body._id
                request(app).delete('/mylocation/' + id)
                    .set('Authorization', userJwtToken)
                    .then((res) => {
                        expect(res.statusCode).to.equal(200);
                        expect(res.body).to.contain.property('status', 'Location deleted successfully');
                        done();
                    })
                    .catch((err) => done(err));
            })
            .catch((err) => done(err));
    })
});

describe('POST DELETE /mylocation/:id', () => {
    it('Fail, create new user location but invalid user token', (done) => {
        request(app).post('/mylocation')
            .set('Authorization', userJwtToken)
            .send({
                name: "to be deleted",
                latitude: "to be deleted",
                longitude: "to be deleted",
                additionalInfo: "to be deleted"
            })
            .then((res) => {
                let id = res.body._id
                request(app).delete('/mylocation/' + id)
                    .set('Authorization', 'invalid bearer token')
                    .then((res) => {
                        expect(res.statusCode).to.equal(500);
                        expect(res.body).to.be.empty;
                        done();
                    })
                    .catch((err) => done(err));
            })
            .catch((err) => done(err));
    })
});

//restaurant testing

let restaurantId = '';

describe('POST /restaurant', () => {
    it('OK, create new restaurant', (done) => {
        request(app).post('/restaurant')
            .set('Authorization', adminJwtToken)
            .send({
                name: "restaurant name",
                about: "about restaurant",
                location: "restaurant location",
                image: "restaurant image"
            })
            .then((res) => {
                expect(res.statusCode).to.equal(201);
                expect(res.body).to.not.be.empty;
                restaurantId = res.body._id
                done();
            })
            .catch((err) => done(err));
    })
});

describe('POST /restaurant', () => {
    it('Fail, empty name of restaurant', (done) => {
        request(app).post('/restaurant')
            .set('Authorization', adminJwtToken)
            .send({
                about: "about restaurant",
                location: "restaurant location",
                image: "restaurant image"
            })
            .then((res) => {
                const body = res.body;
                expect(res.statusCode).to.equal(500);
                expect(body).to.be.empty;
                done();
            })
            .catch((err) => done(err));
    })
});

describe('GET /restaurant', () => {
    it('OK, should provide all restaurants', (done) => {
        request(app).get('/restaurant')
            .then((res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.not.be.empty;
                done();
            })
            .catch((err) => done(err));
    })
});


describe('DELETE /restaurant', () => {
    it('OK, Forbidden', (done) => {
        request(app).delete('/restaurant')
            .set('Authorization', userJwtToken)
            .then((res) => {
                expect(res.statusCode).to.equal(405);
                expect(res.body).to.contain.property('message', 'Method not allowed');
                done();
            })
            .catch((err) => done(err));
    })
});

describe('PUT /restaurant', () => {
    it('OK, Forbidden', (done) => {
        request(app).put('/restaurant')
            .set('Authorization', userJwtToken)
            .then((res) => {
                expect(res.statusCode).to.equal(405);
                expect(res.body).to.contain.property('message', 'Method not allowed');
                done();
            })
            .catch((err) => done(err));
    })
});

describe('PUT /restaurant/:id', () => {
    it('OK, update restaurant details', (done) => {
        request(app).put('/restaurant/' + restaurantId)
            .set('Authorization', adminJwtToken)
            .send({
                name: "updated restaurant name",
                about: "updated about restaurant",
                location: "updated restaurant location",
                image: "updated restaurant image"
            })
            .then((res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.not.be.empty;
                done();
            })
            .catch((err) => done(err));
    })
});

describe('PUT /restaurant/:id', () => {
    it('Fail, not admin bearer token', (done) => {
        request(app).put('/restaurant/' + restaurantId)
            .set('Authorization', userJwtToken)
            .send({
                name: "updated restaurant name",
                about: "updated about restaurant",
                location: "updated restaurant location",
                image: "updated restaurant image"
            })
            .then((res) => {
                expect(res.statusCode).to.equal(403);
                expect(res.body).to.be.empty;
                done();
            })
            .catch((err) => done(err));
    })
});

describe('POST DELETE /restaurant/:id', () => {
    it('OK, create new restaurant and delete', (done) => {
        request(app).post('/restaurant')
            .set('Authorization', adminJwtToken)
            .send({
                name: "new restaurant name",
                about: "new about restaurant",
                location: "new restaurant location",
                image: "new restaurant image"
            })
            .then((res) => {
                let id = res.body._id
                request(app).delete('/restaurant/' + id)
                    .set('Authorization', adminJwtToken)
                    .then((res) => {
                        expect(res.statusCode).to.equal(200);
                        expect(res.body).to.contain.property('status', 'Restaurant deleted successfully');
                        done();
                    })
                    .catch((err) => done(err))
            })
            .catch((err) => done(err));
    })
});

describe('POST DELETE /restaurant/:id', () => {
    it('Fail, create new user location but not admin token', (done) => {
        request(app).post('/restaurant')
            .set('Authorization', adminJwtToken)
            .send({
                name: "new restaurant name",
                about: "new about restaurant",
                location: "new restaurant location",
                image: "new restaurant image"
            })
            .then((res) => {
                let id = res.body._id
                request(app).delete('/restaurant/' + id)
                    .set('Authorization', userJwtToken)
                    .then((res) => {
                        expect(res.statusCode).to.equal(403);
                        expect(res.body).to.be.empty;
                        done();
                    })
                    .catch((err) => done(err));
            })
            .catch((err) => done(err));
    })
});

describe('GET /restaurant/:id', () => {
    it('OK, should provide particular restaurant details', (done) => {
        request(app).get('/restaurant/' + restaurantId)
            .then((res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.not.be.empty;
                done();
            })
            .catch((err) => done(err))
    })
});

describe('GET /restaurant/:id', () => {
    it('Fail, incorrect restaurant Id', (done) => {
        let id = 'invalidid'
        request(app).get('/restaurant/' + id)
            .then((res) => {
                expect(res.statusCode).to.equal(500);
                expect(res.body).to.be.empty;
                done();
            })
            .catch((err) => done(err))
    })
});

//food unit testing 

let foodId = '';

describe('POST /food', () => {
    it('OK, create new food', (done) => {
        request(app).post('/food')
            .set('Authorization', adminJwtToken)
            .send({
                foodName: "food name",
                restaurants: restaurantId,
                foodPrice: 1000,
                description: "food description",
                image: "restaurant image"
            })
            .then((res) => {
                expect(res.statusCode).to.equal(201);
                expect(res.body).to.not.be.empty;
                foodId = res.body._id
                done();
            })
            .catch((err) => done(err));
    })
});

describe('POST /food', () => {
    it('Fail, empty restaurant and price', (done) => {
        request(app).post('/food')
            .set('Authorization', adminJwtToken)
            .send({
                foodName: "food name 2",
                description: "food description",
                image: "restaurant image"
            })
            .then((res) => {
                expect(res.statusCode).to.equal(500);
                expect(res.body).to.be.empty;
                done();
            })
            .catch((err) => done(err));
    })
});

describe('GET /food', () => {
    it('OK, should provide all foods', (done) => {
        request(app).get('/food')
            .then((res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.not.be.empty;
                done();
            })
            .catch((err) => done(err));
    })
});


describe('DELETE /food', () => {
    it('OK, Forbidden', (done) => {
        request(app).delete('/food')
            .set('Authorization', userJwtToken)
            .then((res) => {
                expect(res.statusCode).to.equal(405);
                expect(res.body).to.contain.property('message', 'Method not allowed');
                done();
            })
            .catch((err) => done(err));
    })
});

describe('PUT /food', () => {
    it('OK, Forbidden', (done) => {
        request(app).put('/food')
            .set('Authorization', userJwtToken)
            .then((res) => {
                expect(res.statusCode).to.equal(405);
                expect(res.body).to.contain.property('message', 'Method not allowed');
                done();
            })
            .catch((err) => done(err));
    })
});

describe('GET /food/:id', () => {
    it('OK, should provide particular food details', (done) => {
        request(app).get('/food/' + foodId)
            .then((res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.not.be.empty;
                done();
            })
            .catch((err) => done(err))
    })
});

describe('GET /food/:id', () => {
    it('Fail, incorrect food Id', (done) => {
        let id = 'invalidid'
        request(app).get('/food/' + id)
            .then((res) => {
                expect(res.statusCode).to.equal(500);
                expect(res.body).to.be.empty;
                done();
            })
            .catch((err) => done(err))
    })
});

describe('PUT /food/:id', () => {
    it('OK, update food by admin', (done) => {
        request(app).put('/food/' + foodId)
            .set('Authorization', adminJwtToken)
            .send({
                foodName: "updated food name",
                foodPrice: 5000,
                description: "updated food description",
                image: "updated restaurant image"
            })
            .then((res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.not.be.empty;
                done();
            })
            .catch((err) => done(err));
    })
});

describe('PUT /food/:id', () => {
    it('Fail, user bearer token instead of admin', (done) => {
        request(app).put('/food/' + foodId)
            .set('Authorization', userJwtToken)
            .send({
                foodName: "updated food name 2",
                foodPrice: 5300,
                description: "updated food description 2",
                image: "updated restaurant image 2"
            })
            .then((res) => {
                expect(res.statusCode).to.equal(403);
                expect(res.body).to.be.empty;
                done();
            })
            .catch((err) => done(err));
    })
});

describe('POST DELETE /food/:id', () => {
    it('OK, create new food and delete by admin', (done) => {
        request(app).post('/food')
            .set('Authorization', adminJwtToken)
            .send({
                foodName: "food name tbd",
                restaurants: restaurantId,
                foodPrice: 1030,
                description: "food description tbd",
                image: "restaurant image tbd"
            })
            .then((res) => {
                let id = res.body._id
                request(app).delete('/food/' + id)
                    .set('Authorization', adminJwtToken)
                    .then((res) => {
                        expect(res.statusCode).to.equal(200);
                        expect(res.body).to.contain.property('status', 'Food deleted successfully');
                        done();
                    })
                    .catch((err) => done(err));
            })
            .catch((err) => done(err));
    })
});

describe('POST DELETE /food/:id', () => {
    it('Fail, create new food but user token instead of admin', (done) => {
        request(app).post('/food')
            .set('Authorization', adminJwtToken)
            .send({
                foodName: "food name tbd 2",
                restaurants: restaurantId,
                foodPrice: 1030,
                description: "food description tbd 2",
                image: "restaurant image tbd 2"
            })
            .then((res) => {
                let id = res.body._id
                request(app).delete('/food/' + id)
                    .set('Authorization', userJwtToken)
                    .then((res) => {
                        expect(res.statusCode).to.equal(403);
                        expect(res.body).to.be.empty;
                        done();
                    })
                    .catch((err) => done(err));
            })
            .catch((err) => done(err));
    })
});

describe('GET /restaurant/food/:id', () => {
    it('OK, should provide all food details of particular restaurant', (done) => {
        request(app).get('/restaurant/food/' + restaurantId)
            .then((res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.not.be.empty;
                done();
            })
            .catch((err) => done(err))
    })
});

describe('GET /restaurant/food/:id', () => {
    it('Fail, incorrect restaurant Id', (done) => {
        let id = 'invalidid'
        request(app).get('/restaurant/food/' + id)
            .then((res) => {
                expect(res.statusCode).to.equal(500);
                expect(res.body).to.be.empty;
                done();
            })
            .catch((err) => done(err))
    })
});

let searchText = 'food';

describe('GET /searchfood/:search', () => {
    it('OK, retrieve food detail of search text', (done) => {
        request(app).get('/searchfood/' + searchText)
            .then((res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.not.be.empty;
                done();
            })
            .catch((err) => done(err))
    })
});

describe('GET /searchfood/:search', () => {
    it('Fail, not available search text', (done) => {
        let search = 'asd';
        request(app).get('/searchfood/' + search)
            .then((res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.be.empty;
                done();
            })
            .catch((err) => done(err))
    })
});

// order unit testing
let orderId = '';

describe('POST /order/:id', () => {
    it('OK, new basket food order', (done) => {
        request(app).post('/order/' + locationId)
            .set('Authorization', userJwtToken)
            .send({
                foodId: foodId,
                quantity: 3,
                price: 5000,
            })
            .then((res) => {
                expect(res.statusCode).to.equal(201);
                expect(res.body).to.not.be.empty;
                orderId = res.body._id;
                done();
            })
            .catch((err) => done(err));
    })
});

describe('POST /order/:id', () => {
    it('Fail, invalid user token', (done) => {
        request(app).post('/order/' + locationId)
            .set('Authorization', 'invalid bearer token')
            .send({
                foodId: foodId,
                quantity: 3,
                price: 5000,
            })
            .then((res) => {
                expect(res.statusCode).to.equal(500);
                expect(res.body).to.be.empty;
                done();
            })
            .catch((err) => done(err));
    })
});

describe('POST /order/:id', () => {
    it('Fail, invalid locationId and foodId', (done) => {
        request(app).post('/order/' + 'invalidlocation')
            .set('Authorization', userJwtToken)
            .send({
                foodId: 'invalidfood',
                quantity: 3,
                price: 5000,
            })
            .then((res) => {
                expect(res.statusCode).to.equal(500);
                expect(res.body).to.contain.property('status', 'Something went wrong');
                done();
            })
            .catch((err) => done(err));
    })
});

describe('PUT /order/:id', () => {
    it('Ok, updated basket after completing delivery', (done) => {
        request(app).put('/order/' + orderId)
            .set('Authorization', adminJwtToken)
            .send({
                active: false
            })
            .then((res) => {
                console.log(res.body);
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.contain.property('status', 'Delivered successfully');
                done();
            })
            .catch((err) => done(err));
    })
});

describe('PUT /order/:id', () => {
    it('Ok, updating completed delivery', (done) => {
        request(app).put('/order/' + orderId)
            .set('Authorization', adminJwtToken)
            .send({
                active: true
            })
            .then((res) => {
                console.log(res.body);
                expect(res.statusCode).to.equal(409);
                expect(res.body).to.contain.property('status', 'Delivery is closed');
                done();
            })
            .catch((err) => done(err));
    })
});

describe('PUT /order/:id', () => {
    it('Fail, invalid admin token', (done) => {
        request(app).put('/order/' + orderId)
            .set('Authorization', userJwtToken)
            .send({
                active: true
            })
            .then((res) => {
                expect(res.statusCode).to.equal(403);
                expect(res.body).to.be.empty;
                done();
            })
            .catch((err) => done(err));
    })
});

describe('GET /order', () => {
    it('OK, should provide all existing basket order', (done) => {
        request(app).get('/order')
            .set('Authorization', adminJwtToken)
            .then((res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.not.be.empty;
                done();
            })
            .catch((err) => done(err))
    })
});

describe('GET /order', () => {
    it('Fail, invalid admin token for order', (done) => {
        request(app).get('/order')
            .set('Authorization', userJwtToken)
            .then((res) => {
                expect(res.statusCode).to.equal(403);
                expect(res.body).to.be.empty;
                done();
            })
            .catch((err) => done(err))
    })
});

describe('GET /order', () => {
    it('Fail, invalid bearer token for order', (done) => {
        request(app).get('/order')
            .set('Authorization', 'bearer userJwtToken')
            .then((res) => {
                expect(res.statusCode).to.equal(500);
                expect(res.body).to.be.empty;
                done();
            })
            .catch((err) => done(err))
    })
});


describe('GET /order/user', () => {
    it('OK, should provide user existing basket order', (done) => {
        request(app).get('/order/user')
            .set('Authorization', userJwtToken)
            .then((res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.contain.property('status', 'Delivered');
                done();
            })
            .catch((err) => done(err))
    })
});

describe('GET /order/user', () => {
    it('Fail, invalid user token', (done) => {
        request(app).get('/order/user')
            .set('Authorization', 'invalid bearer adminJwtToken')
            .then((res) => {
                expect(res.statusCode).to.equal(500);
                expect(res.body).to.be.empty;
                done();
            })
            .catch((err) => done(err))
    })
});