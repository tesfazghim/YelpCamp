const mongoose =  require('mongoose');

const cities = require('./cities');
const {descriptors, places} = require('./seedHelpers');
const Campground = require('../models/campground');

//create or connect to db yelpcamp
mongoose.connect('mongodb://localhost:27017/yelp-camp');

//check connection status
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array =>array[Math.floor(Math.random()*array.length)];

const seedDB = async() => {
    await Campground.deleteMany({});
    for (let i=0; i<50; i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            author: '65e211751cd0350822eeba0c',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Repellat ullam labore commodi eaque aliquid, aliquam dolorum repellendus amet nihil maiores qui officiis? Nostrum culpa ex omnis id corporis dicta cum?',
            price,
            geometry:{
                type:'Point',
                coordinates:[-113.1331, 47.0202]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dfjiffoxv/image/upload/v1709753330/YelpCamp/hlr0gjldaacy9ogomlzu.jpg',
                    filename: 'YelpCamp/hlr0gjldaacy9ogomlzu',
                },
                {
                    url: 'https://res.cloudinary.com/dfjiffoxv/image/upload/v1709753331/YelpCamp/gupkfaypy0odexcawaxh.jpg',
                    filename: 'YelpCamp/gupkfaypy0odexcawaxh'
                }
            ]

        })
        await camp.save();
    }
}
seedDB().then(()=>{
    mongoose.connection.close();
});