require("dotenv").config();
const moment = require("moment")
const { decrypt, encrypt } = require("./crypto");
const mongoose = require("mongoose");
const express = require("express");
const cron = require("node-cron");
const axios = require('axios');
const log4js = require('log4js');
const path = require('path');
log4js.configure({
    appenders: {
        log: {
            type: 'dateFile',
            // filename: 'servicelog.log',
            filename: path.join(__dirname, '../logs/service.log')
        }
    },
    categories: {
        default: { appenders: ['log'], level: 'info' }
    }
});
const logger = log4js.getLogger('log');
const { Facilities, Features } = require("../models/models");

async function fetchData() {
    try {
        console.log("\nStarted fetchData() operation:");
        logger.info("\nStarted fetchData() operation:");
        //Fetching Features and descryoting data to save in mongo DB Features collection
        try {
            let { data } = await axios({
                url: process.env.FEATURES_LIST_URL,
                method: 'post',
                //params: {}
            });
            console.log("FEATURES_LIST:", (data.data && data.data.geojsonPoint) && data.data.geojsonPoint.length);
            logger.info("Trying to parse features list dataLength:", (data.data && data.data.geojsonPoint) && data.data.geojsonPoint.length);
            if (!data || !data.data || !data.data.geojsonPoint) {
                console.log("Could not get features list data URL:", process.env.FEATURES_LIST_URL);
                logger.error("Could not get features list data URL:", process.env.FEATURES_LIST_URL);
            }
            const featuresData = JSON.parse(decrypt(data.data.geojsonPoint));
            logger.info("Trying to parse features list data");
            // await Features.deleteMany({}).then(()=>logger.info("Deleted features list data")).catch((err) => {
            //     console.log("catch (error) Could not delete features list data \nerror:", err);
            //     logger.error("catch (error) Could not delete features list data \nerror:", JSON.stringify(err));
            // });
            let deleteIds = featuresData.jsonstring.features.map((item, index) => item.properties.ID);
            //console.log("deleteIds:", deleteIds);
            await Features.deleteMany({ ID: { $in: deleteIds } }).catch((err) => {
                console.log("catch (error) Could not delete features list data\nerror:", err);
                logger.error("catch (error) Could not delete features list data\nerror:", JSON.stringify(err));
            });
            featuresArray = featuresData.jsonstring.features.map((item, index) => new Features({
                ...item,
                ...item.properties
            }));
            console.log("featuresArray:", featuresArray && featuresArray.length);
            Features.insertMany(featuresArray).then(() => logger.info("Features list saved successfully")).catch(err => {
                console.log("Features.insertMany: Could not save features list data URL:", process.env.FEATURES_LIST_URL, "\nerror:", err);
                logger.error("Features.insertMany: Could not save features list data URL:", process.env.FEATURES_LIST_URL, "\nerror:", JSON.stringify(err));
            });

        } catch (error) {
            console.log("catch (error) Could not get features list data URL:", process.env.FEATURES_LIST_URL, "\nerror:", error);
        }
        //Fetching Facilities and descryoting data to save in mongo DB Features collection
        try {
            let { data } = await axios({
                url: process.env.CROWD_LEVELS_URL,
                method: 'post',
                //params: {}
            });
            console.log("CROWD_LEVELS:", (data.data && data.data.facilities) && data.data.facilities.length);
            logger.info("Trying to parse facilities list dataLength:", (data.data && data.data.facilities) && data.data.facilities.length);
            if (!data || !data.data || !data.data.facilities) {
                console.log("Could not get crowd levels data URL:", process.env.CROWD_LEVELS_URL);
                logger.error("Could not get crowd levels data URL:", process.env.CROWD_LEVELS_URL);
            }
            const facilitiesData = data.data.facilities;
            logger.info("Trying to parse facilities list data");
            // await Facilities.deleteMany({}).then(()=>logger.info("Deleted facilities list data")).catch((err) => {
            //     console.log("catch (error) Could not delete facilities list data \nerror:", err);
            //     logger.error("catch (error) Could not delete facilities list data \nerror:", JSON.stringify(err));
            // });
            let facilitiesArray = facilitiesData.map((item, index) => new Facilities({
                ...item, //createdAt: moment(item.createdAt).toDate()
            }));
            console.log("facilitiesArray:", facilitiesArray && facilitiesArray.length);
            Facilities.insertMany(facilitiesArray).then(() => logger.info("facilities list saved successfully")).catch(err => {
                console.log("facilities.insertMany: Could not save facilities list data URL:", process.env.facilities_LIST_URL, "\nerror:", err);
                logger.error("facilities.insertMany: Could not save facilities list data URL:", process.env.facilities_LIST_URL, "\nerror:", JSON.stringify(err));
            });
        } catch (error) {
            console.log("Could not get crowd levels data URL:", process.env.CROWD_LEVELS_URL, "\nerror:", error);
            logger.error("Could not get crowd levels data URL:", process.env.CROWD_LEVELS_URL, "\nerror:", JSON.stringify(error));
        }
        logger.info("Ended fetchData() operation:");
    } catch (error) {
        logger.error("Error occured in fetchData() operation \nError:", JSON.stringify(error));
    }
}

var connectionString = ''
if (process.env.MONGODB_USER) {
    connectionString = `mongodb://${process.env.MONGODB_USER}:${encodeURIComponent(process.env.MONGODB_PWD)}@${process.env.MONGODB_SERVER}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DBNAME}?authSource=admin`
} else {
    connectionString = `mongodb://${process.env.MONGODB_SERVER}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DBNAME}`
}

const db = mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
// Setup Mongoose
const mongoDb = mongoose.connection
// mongodb://utadmin:zkHS%26%40Bdxc%5E%5E%40%23PXC%26asdSh%23%40hj%23783hnCxss@94.237.76.68:58273/urbantummydev?authSource=admin
mongoDb.on('error', () => {
    console.log('error', `Unable to connect to database: ${connectionString}`)
});

mongoDb.once('open', () => {
    console.log('info', `Connected to database: ${process.env.MONGODB_SERVER}`)
});

//Intializing express server object
const app = express();
console.log(`process.env.JOB_INTERVAL_IN_MINS:${process.env.JOB_INTERVAL_IN_MINS}`);
//Scheduling cron job via express server process
cron.schedule(`* ${process.env.JOB_INTERVAL_IN_MINS} * * * *`, () => { fetchData(); });
//Starting express server service
app.listen(parseInt(process.env.SERVER_PORT), () => console.log(`Server started at ${process.env.SERVER_PORT}`));
fetchData();