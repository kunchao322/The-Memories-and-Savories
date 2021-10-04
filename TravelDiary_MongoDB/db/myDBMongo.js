const { query } = require("express");
const { MongoClient, ObjectId } = require("mongodb");

const uri = process.env.MONGO_URL || "mongodb://localhost:27017";
const DB_NAME = "DestinationManager";
const COL_NAME = "Destinations";
const client = new MongoClient(uri);

async function getDestinations(query, page, pageSize) {
    console.log("getDestinations", query);

    const client = new MongoClient(uri);
    try {
        await client.connect();

        const queryObj = {
            view: { $regex: `^${query}`, $options: "i" }
        };
        return await client.db(DB_NAME).collection(COL_NAME).find(queryObj).sort({ _id: -1 }).limit(pageSize).skip((page - 1) * pageSize).toArray();
    } finally {
        client.close();
    }
}

async function getDestinationsCount(query) {
    console.log("DestinationCounts", query);
    const client = new MongoClient(uri);
    try {
        await client.connect();

        const queryObj = {
            view: { $regex: `^${query}`, $options: "i" }
        };
        return await client.db(DB_NAME).collection(COL_NAME).find(queryObj).count();
    } finally {
        client.close();
    }
}

async function getDestinationByID(destination_id) {
    console.log("getDestinationByID", destination_id);

    const client = new MongoClient(uri);
    try {
        await client.connect();

        const queryObj = {
            _id: new ObjectId(destination_id)
        };
        return await client.db(DB_NAME).collection(COL_NAME).findOne(queryObj);
    } finally {
        client.close();
    }
}

async function updateDestinationByID(destination_id, des) {
    console.log("updateDestinationByID", destination_id, des);

    try {
        await client.connect();

        const queryObj = {
            _id: new ObjectId(destination_id)
        };

        return await client
            .db(DB_NAME)
            .collection(COL_NAME)
            .updateOne(queryObj, { $set: des });
    } finally {
        client.close();
    }

}

async function deleteDestinationByID(destination_id) {
    console.log("deleteDestinationByID", destination_id);
    const client = new MongoClient(uri);
    try {
        await client.connect();

        const queryObj = {
            _id: new ObjectId(destination_id)
        };
        return await client.db(DB_NAME).collection(COL_NAME).deleteOne(queryObj);
    } finally {
        client.close();
    }

}


async function deleteRestaurantByID(restaurant_name, destination_id) {
    console.log("deleteDestination_id", destination_id);
    console.log("datatype res.id", typeof(restaurant_name));
    console.log("datatype res.id", typeof(+restaurant_name));

    const client = new MongoClient(uri);

    try {
        await client.connect();
        const filter = {
            '_id': new ObjectId(destination_id),
        };
        const options = {
            upsert: true
        }
        const updateDoc = {
            $pull: {
                Restaurants: {
                    name: restaurant_name,
                }
            }
        }

        return await client
            .db(DB_NAME)
            .collection(COL_NAME)
            .updateOne(filter, updateDoc, options);
    } finally {
        client.close();
    }
}


async function insertDestination(des) {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const queryObj = {
            view: des.Destination,
            State: des.State
        };

        const result = await client.db(DB_NAME).collection(COL_NAME).insertOne(queryObj);
        console.log(
            `${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`,
        );
        return result;
    } finally {
        client.close();
    }

}

async function getRestaurantsByDestinationID(destination_id) {
    console.log("getRestaurantsByDestinationID", destination_id);

    const client = new MongoClient(uri);
    try {
        await client.connect();

        const queryObj = {
            _id: new ObjectId(destination_id)
        };
        return await client.db(DB_NAME).collection(COL_NAME).findOne(queryObj);
    } finally {
        client.close();
    }
}


async function addRestaurantToDestination(destination_id, restaurant) {
    const client = new MongoClient(uri);

    try {
        await client.connect();

        const queryObj = {
            _id: new ObjectId(destination_id),
        };

        return await client
            .db(DB_NAME)
            .collection(COL_NAME)
            .updateOne(queryObj, { $push: { Restaurants: restaurant } });
    } finally {
        client.close();
    }

}


async function getReviewsByRestID(restaurant_id) {
    console.log("getReviewsByRestID:", restaurant_id);
    const client = new MongoClient(uri);

    try {
        await client.connect();

        const queryObj = {
            _id: new ObjectId(destination_id),
        };


        return await client
            .db(DB_NAME)
            .collection(COL_NAME)
            .updateOne(queryObj, { $push: { Restaurants: restaurant } });
    } finally {
        client.close();
    }
}



module.exports.getDestinations = getDestinations;
module.exports.getDestinationsCount = getDestinationsCount;
module.exports.insertDestination = insertDestination;
module.exports.getDestinationByID = getDestinationByID;
module.exports.updateDestinationByID = updateDestinationByID;
module.exports.deleteDestinationByID = deleteDestinationByID;
module.exports.deleteRestaurantByID = deleteRestaurantByID;
module.exports.getRestaurantsByDestinationID = getRestaurantsByDestinationID;
module.exports.addRestaurantToDestination = addRestaurantToDestination;
module.exports.getReviewsByRestID = getReviewsByRestID;