const log4js = require('log4js');
const path = require('path');
const crypto = require("crypto");
const moment = require("moment");
require("dotenv").config();
const mongoose = require("mongoose");
const { Facilities, Features, Users } = require("../models/models");
const express = require("express");
const bodyParser = require('body-parser');
const authutils = require("../auth/authutils");
const jwttoken = require("../auth/token");
//Intializing express server object
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

log4js.configure({
    appenders: {
        log: {
            type: 'dateFile',
            // filename: 'servicelog.log',
            filename: path.join(__dirname, '../log/api.log')
        }
    },
    categories: {
        default: { appenders: ['log'], level: 'info' }
    }
});
const logger = log4js.getLogger('log');
const NOT_AUTHENTICATED_ERROR = "Invalid credentials provided";

// const hash = crypto.createHash('sha512');
// const data = hash.update("123456", 'utf-8');
// const encPassword = String(data.digest('hex'));
// console.log("encPassword:",encPassword);
// const user=new Users({
//     name:"Sanjay",
//     email:"sonugk@gmail.com",
//     pwd:"ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413",    
// });
// user.save();

//Login API method
app.post('/login', async (req, res) => {
    logger.info('Login', JSON.stringify({ ...req.body, password: '****' }));
    //console.log("req.body:",req.body);
    if (!req.body || !req.body.email) {
        res.json({ message: NOT_AUTHENTICATED_ERROR, success: false })
        return;
    }
    if (!req.body || !req.body.pwd) {
        res.json({ message: NOT_AUTHENTICATED_ERROR, success: false })
        return;
    }
    const user = await Users.findOne({ email: req.body.email.trim() });
    if (!user) {
        logger.error('Login Password Invalid', JSON.stringify(req.body));
        res.json({ message: NOT_AUTHENTICATED_ERROR, success: false })
        return;
    }
    const hash = crypto.createHash('sha512');
    const data = hash.update(req.body.pwd, 'utf-8');
    const encPassword = String(data.digest('hex'));
    logger.info('Login', JSON.stringify({ ...req.body, password: '****' }));
    if (encPassword !== user.pwd) {
        logger.error('Login Password Invalid', JSON.stringify(req.body));
        res.json({ message: NOT_AUTHENTICATED_ERROR, success: false });
        return;
    }
    const token = await jwttoken.create(user.id);
    res.json({ message: 'Login Successfull', success: true, data: token });
    return;
});

//Get facilities API method
app.get('/facilities', async (req, res) => {
    logger.info('/facilities:', JSON.stringify(req.query));
    const user = await authutils.getUser(req);
    console.log("user:", user);
    if (!user || !user.id) {
        res.json({ message: NOT_AUTHENTICATED_ERROR, success: false });
        return;
    }
    let filter = {};
    let sort = { createdAt: -1 };
    let pagesize = 20;
    const skip = req.query.shownitemcount && parseInt(req.query.shownitemcount) >= 0 ? parseInt(req.query.shownitemcount) : 0;
    if (req.query.pagesize && parseInt(req.query.pagesize) > 0 && parseInt(req.query.pagesize) > 100) {
        pagesize = parseInt(req.query.pagesize);
    }
    if (req.query.ID) {
        filter = Object.assign(filter, { ID: req.query.ID });
    }
    if (req.query.SAT) {
        filter = Object.assign(filter, { SAT: req.query.SAT });
    }
    if (req.query.SUN) {
        filter = Object.assign(filter, { SUN: req.query.SUN });
    }
    if (req.query.NAME) {
        const regex = { $regex: '.*' + req.query.NAME + '.*', $options: 'i' };
        filter = Object.assign(filter, { NAME: regex });
    }
    if (req.query.TYPE) {
        filter = Object.assign(filter, { TYPE: req.query.TYPE });
    }
    if (req.query.ADDRESS) {
        const regex = { $regex: '.*' + req.query.ADDRESS + '.*', $options: 'i' };
        filter = Object.assign(filter, { ADDRESS: regex });
    }
    if (req.query.BLK_HOUSE) {
        filter = Object.assign(filter, { BLK_HOUSE: req.query.BLK_HOUSE });
    }
    if (req.query.ROAD_NAME) {
        const regex = { $regex: '.*' + req.query.ROAD_NAME + '.*', $options: 'i' };
        filter = Object.assign(filter, { ROAD_NAME: regex });
    }
    if (req.query.POSTALCODE) {
        filter = Object.assign(filter, { POSTALCODE: req.query.POSTALCODE });
    }
    console.log("filter,sort,skip,pagesize:", filter, sort, skip, pagesize);
    let records = await Features.find(filter).sort(sort).skip(skip).limit(pagesize);
    res.json({ message: 'Record(s) found', success: true, data: records });
    return;
});

//Get crowdlevels API method
app.get('/crowdlevels', async (req, res) => {
    logger.info('/crowdlevels:', JSON.stringify(req.query));
    const user = await authutils.getUser(req);
    console.log("user:", user);
    if (!user || !user.id) {
        res.json({ message: NOT_AUTHENTICATED_ERROR, success: false });
        return;
    }
    let filter = {};
    let sort = { createdAt: -1 };
    let pagesize = 20;
    let isdatefiltered = false;
    const skip = req.query.shownitemcount && parseInt(req.query.shownitemcount) >= 0 ? parseInt(req.query.shownitemcount) : 0;
    if (req.query.pagesize && parseInt(req.query.pagesize) > 0 && parseInt(req.query.pagesize) > 100) {
        pagesize = parseInt(req.query.pagesize);
    }
    if (req.query.id) {
        filter = Object.assign(filter, { id: req.query.id });
    }
    if (req.query.band && parseInt(req.query.band)) {
        filter = Object.assign(filter, { band: parseInt(req.query.band) });
    }
    if (req.query.trend) {
        filter = Object.assign(filter, { trend: req.query.trend });
    }
    if (req.query.fromdate && moment(req.query.fromdate) && moment().diff(moment(req.query.fromdate)) > 0) {
        filter = Object.assign(filter, { createdAt: { $gte: moment(req.query.fromdate).toISOString() } });
        isdatefiltered = true;
    }
    if (req.query.todate && moment(req.query.todate) && moment().diff(moment(req.query.todate)) > 0) {
        filter = Object.assign(filter, { createdAt: { $lte: moment(req.query.todate).toISOString() } });
        isdatefiltered = true;
    };
    console.log("filter,sort,skip,pagesize,isdatefiltered:", filter, sort, skip, pagesize, isdatefiltered);
    let records = [];
    if (isdatefiltered === true) {
        records = await Facilities.aggregate([
            {
                $group: {
                    _id: "$id",
                    band: { $avg: "$band" },
                    trend: { $first: "$trend" },
                }
            },
            {
                $match: filter
            },
            { $sort: sort },
            { $skip: skip },
            { $limit: pagesize },
        ]);
    } else {
        records = await Facilities.aggregate([
            {
                $group: {
                    _id: "$id",
                    band: { $first: "$band" },
                    trend: { $first: "$trend" },
                    createdAt: { $first: "$createdAt" },
                }
            },
            {
                $match: filter
            },
            { $sort: sort },
            { $skip: skip },
            { $limit: pagesize },
        ]);
    }
    res.json({ message: 'Record(s) found', success: true, data: records });
    return;
});

var connectionString = ''
if (process.env.MONGODB_USER) {
    connectionString = `mongodb://${process.env.MONGODB_USER}:${encodeURIComponent(process.env.MONGODB_PWD)}@${process.env.MONGODB_SERVER}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DBNAME}?authSource=admin`
} else {
    connectionString = `mongodb://${process.env.MONGODB_SERVER}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DBNAME}`
}

mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
// Setup Mongoose
const mongoDb = mongoose.connection;
mongoDb.on('error', () => {
    console.log('error', `Unable to connect to database: ${connectionString}`)
});

mongoDb.once('open', () => {
    console.log('info', `Connected to database: ${process.env.MONGODB_SERVER}`)
});

app.listen(parseInt(process.env.SERVER_PORT), () => console.log(`API Server started at ${process.env.SERVER_PORT}`));
