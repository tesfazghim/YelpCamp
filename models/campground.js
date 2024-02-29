const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

const Review = require('./review')

const CampgroundSchema = new Schema({
    title:String,
    image:String,
    price:Number, 
    description: String,
    location:String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
});

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