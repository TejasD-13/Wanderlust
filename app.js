const express = require("express");
const app = express();
const Listing = require("./models/listing.js");
const mongoose = require('mongoose');
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js")
 const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/reviews.js");


// Database connection
mongoose.connect('mongodb://127.0.0.1:27017/wanderlust')
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "public")));

// Root route
app.get("/", (req, res) => {
    res.send("Hi, I am root");
});

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};


const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};

// Index route
app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
});

// New route
app.get("/listings/new", (req, res) => {
    res.render("listings/new");
});

// Create route
app.post("/listings", async (req, res) => {
    try {
        const { listing } = req.body;
        
        // Create new image object
        const newListing = new Listing({
            ...listing,
            image: {
                url: listing.image,
                filename: 'listingimage'
            }
        });

        await newListing.save();
        res.redirect(`/listings/${newListing._id}`);
    } catch (err) {
        console.error(err);
        res.send("Error creating listing. Please ensure all required fields are filled.");
    }
});

// Show route
app.get("/listings/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id).populate("reviews"); // Populate reviews
        res.render("listings/show", { listing });
    } catch (err) {
        console.error(err);
        res.send("Listing not found.");
    }
});

// Edit route
app.get("/listings/:id/edit", async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        res.render("listings/edit", { listing });
    } catch (err) {
        console.error(err);
        res.send("Listing not found.");
    }
});

// Update route
app.put("/listings/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { listing } = req.body;

        // Update image structure
        const updatedListing = {
            ...listing,
            image: {
                url: listing.image,
                filename: 'listingimage'
            }
        };

        await Listing.findByIdAndUpdate(id, updatedListing);
        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.error(err);
        res.send("Error updating the listing. Please try again.");
    }
});

// Delete route 
app.delete("/listings/:id", async (req, res) => {
    let { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    res.redirect("/listings");
});

// Reviews
// Post Route 
app.post("/listings/:id/reviews",  async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview); 
    await newReview.save(); 
    await listing.save(); 

    res.redirect(`/listings/${listing._id}`);
});

// delete review route
app.delete("/listings/:id/reviews/:reviewId", async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
});

// Listener
app.listen(8080, () => {
    console.log("Server is listening on port 8080");
});
