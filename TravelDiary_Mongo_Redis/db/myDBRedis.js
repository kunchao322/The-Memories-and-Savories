const redis = require("redis");
const { promisify } = require("util");

const client = redis.createClient();
client.on("error", console.error);

const { MongoClient } = require("mongodb");
const url = process.env.MONGO_URL || "mongodb://localhost:27017";

client.p_hset = promisify(client.hset).bind(client);
client.p_hgetall = promisify(client.hgetall).bind(client);
client.p_zincrby = promisify(client.zincrby).bind(client);
client.p_zadd = promisify(client.zadd).bind(client);
client.p_zrem = promisify(client.zrem).bind(client);
client.p_zrevrange = promisify(client.zrevrange).bind(client);

async function addHotDestination(destination) {
    console.log('Add hot destination.', destination);
    return await client.p_zincrby(
        'hot',
        1,
        'View: ' + destination.view + '  State: ' + destination.State
    );
}

async function getHotDestinations() {
    console.log('Get hot destination....');
    const destinations = await client.p_zrevrange('hot', 0, -1);
    return destinations;
}


async function addToWishlist(destination) {
    console.log('Add to wishlist.', destination);
    return await client.p_zincrby(
        'wishlist',
        1,
        'View: ' + destination.view + ';  State: ' + destination.State
    );
}

async function removeFromWishlist(wishToRemove) {
    console.log('remove from wishlist.', wishToRemove);
    return await client.p_zrem(
        'wishlist',
        wishToRemove
    );
}

async function getWishlist() {
    console.log('Get wishes....');
    const wishes = await client.p_zrevrange('wishlist', 0, -1);
    return wishes;
}

async function importReviews(restaurant_id) {
    const client = redis.createClient();
    let clientMongo = new MongoClient(url);

    try {
        await clientMongo.connect();
        client.p_incr = promisify(client.incr).bind(client);
        client.p_incrby = promisify(client.incrby).bind(client);
        //cursor used to iterator instead of use toArray
        const cursor = clientMongo.db("DestinationManager").collection("Destinations").find({});

        for await (let des of cursor) {
            //  const destID = des._id.toString();
            const restaurants = des.Restaurants;
            if (restaurants) {
                for (let r of restaurants) {
                    if (r.id.toString() == restaurant_id) {
                        const reviews = r.reviews;
                        for (let review of reviews) {
                            console.log("review.cost", review.cost);
                            await client.p_incrby("totalCost", review.cost);
                            await client.p_incrby("totalRating", review.rating);
                            await client.p_incr("reviewsCount");
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.log("err Mongo", err);
    } finally {
        clientMongo.close();
    }
}

async function getAvgCost(restaurant_id) {
    const client = redis.createClient();
    client.p_get = promisify(client.get).bind(client);
    client.on("error", (err) => console.log(err));
    try {
        await flushAll();
        await importReviews(restaurant_id);
        const count = await client.p_get("reviewsCount");
        const totalCost = await client.p_get("totalCost");
        const avg = (+totalCost) / (+count);
        const avgNum = avg.toFixed(2);
        console.log("avg cost is ", avgNum);
        return avgNum;
    } catch (err) {
        console.log("err", err);
    } finally {
        client.quit();

    }
}

async function getAvgRating(restaurant_id, destination_id) {
    const client = redis.createClient();
    client.p_get = promisify(client.get).bind(client);
    client.on("error", (err) => console.log(err));

    try {
        await flushAll();
        await importReviews(restaurant_id, destination_id);
        const count = await client.p_get("reviewsCount");
        const totalRating = await client.p_get("totalRating");
        const avg = (+totalRating) / (+count);
        const avgRate = avg.toFixed(2);
        console.log("avg rating is ", avgRate);
        return avgRate;
    } catch (err) {
        console.log("err", err);
    } finally {
        client.quit();
    }
}


async function flushAll() {
    const clientRedis = redis.createClient();
    clientRedis.p_flushall = promisify(clientRedis.flushall).bind(clientRedis);
    clientRedis.on('error', (err) => console.log(err));

    try {
        await clientRedis.p_flushall();
    } catch (err) {
        console.log('err', err);
    } finally {
        clientRedis.quit();
    }
}


module.exports.importReviews = importReviews;
module.exports.getAvgCost = getAvgCost;
module.exports.getAvgRating = getAvgRating;
module.exports.addToWishlist = addToWishlist;
module.exports.addHotDestination = addHotDestination;
module.exports.getHotDestinations = getHotDestinations;
module.exports.getWishlist = getWishlist;
module.exports.removeFromWishlist = removeFromWishlist;