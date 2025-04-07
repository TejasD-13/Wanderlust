const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    listing: {
        type: Schema.Types.ObjectId,
        ref: 'Listing'
    },
    days: Number,
    facilities: [String], // ["ac", "wifi"]
    totalPrice: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', bookingSchema);
