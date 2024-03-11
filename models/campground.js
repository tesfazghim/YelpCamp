const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

const Review = require('./review')

const ImageSchema = new Schema({
    url:String,
    filename:String
})

// add method that shrinks the width of the image 
// check usage in edit campground page
ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title:String,
    images:[ImageSchema],
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price:Number, 
    description: String,
    location:String,
    author: {
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function(){
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0,20)}...</p>`
})

// when you delete a camp, the review  stays up in the review table 
// we need to delete it, using .post middleware
// for more info look into mongo middleware
// start by finding out the middle ware triggered when the campground db is edited(deletion)
// the details are on the description of every mongo method (check models in docs)
// when findbyidanddelete is called, a middleware is triggered "findoneanddelete"
// when you delete it is available as an argument that we are using below as "doc"
CampgroundSchema.post('findOneAndDelete', async function(doc){
    if(doc){
        await Review.deleteMany({
            _id:{
                $in:doc.reviews
            }
        })
    }
})

module.exports =  mongoose.model('Campground', CampgroundSchema);