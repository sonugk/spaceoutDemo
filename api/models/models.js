const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const MongoDBCollections = {
    Features: "Features",
    Facilities: "Facilities",
    Users: "Users",
};

const pointSchema = new Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
    },
    coordinates: {
        type: [Number],
        required: true
    }
});
const propertiesFields = {
    ID: { type: String, index: true, trim: true },
    SAT: String,
    SUN: String,
    NAME: String,
    TYPE: String,
    EXTRA: String,
    ADDRESS: String,
    WEEKDAY: String,
    CBCLOSED: String,
    GGW_FLAG: String,
    BLK_HOUSE: String,
    ROAD_NAME: String,
    OTHER_NAME: String,
    POSTALCODE: String,
    OPR_HRS_FRIDAY: String,
    OPR_HRS_MONDAY: String,
    OPR_HRS_TUESDAY: String,
    OPR_HRS_SATURDAY: String,
    OPR_HRS_THURSDAY: String,
    OPR_HRS_SUNDAY_PH: String,
    OPR_HRS_WEDNESDAY: String
}
const featuresSchema = new Schema({
    geometry: { type: pointSchema, index: { type: '2dsphere' } },
    ...propertiesFields,
}, {
    timestamps: true
});
// {
//     "id": "51992e409488006e9e04adbaf700ff1e",
//     "band": 1,
//     "createdAt": "19 September 2020, 02:30 PM",
//     "trend": false
// }
const facilitiesSchema = new Schema({
    id: { type: String, index: true, trim: true },
    band: Number,
    trend: Boolean
}, {
    timestamps: true
});
facilitiesSchema.index({ "createdAt": 1 });

const usersSchema = new Schema({
    name: String,
    email:String,
    pwd: String,
    isactive: { type: Boolean, default: true, required: true },
}, {
    timestamps: true
});
const Features = mongoose.model(MongoDBCollections.Features, featuresSchema);
const Facilities = mongoose.model(MongoDBCollections.Facilities, facilitiesSchema);
const Users = mongoose.model(MongoDBCollections.Users, usersSchema);

module.exports = {
    MongoDBCollections,
    Features,
    featuresSchema,
    Facilities,
    facilitiesSchema,
    Users,
    usersSchema,
}