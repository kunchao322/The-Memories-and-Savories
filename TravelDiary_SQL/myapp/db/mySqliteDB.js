/* eslint-disable indent */
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

async function getDestinations(query, page, pageSize) {
    console.log("getDestinations", query);

    const db = await open({
        filename: "./db/TravelDiary.db",
        driver: sqlite3.Database,
    });

    const stmt = await db.prepare(`
    SELECT * FROM Destinations
    JOIN States ON States.StateID = Destinations.StateID
    WHERE Destination LIKE @query
    ORDER BY Destination DESC
    LIMIT @pageSize
    OFFSET @offset;
    `);

    const params = {
        "@query": query + "%",
        "@pageSize": pageSize,
        "@offset": (page - 1) * pageSize,
    };

    try {
        return await stmt.all(params);
    } finally {
        await stmt.finalize();
        db.close();
    }
}

async function getDestinationsCount(query) {
    console.log("DestinationCounts", query);

    const db = await open({
        filename: "./db/TravelDiary.db",
        driver: sqlite3.Database,
    });

    const stmt = await db.prepare(`
    SELECT COUNT(*) AS count
    FROM Destinations
    WHERE destination LIKE @query;
    `);

    const params = {
        "@query": query + "%",
    };

    try {
        return (await stmt.get(params)).count;
    } finally {
        await stmt.finalize();
        db.close();
    }
}



async function getDestinationByID(destination_id) {
    console.log("getDestinationByID", destination_id);

    const db = await open({
        filename: "./db/TravelDiary.db",
        driver: sqlite3.Database,
    });

    const stmt = await db.prepare(`
    SELECT * FROM Destinations
    JOIN States ON States.StateID = Destinations.StateID
    WHERE DestID = @destination_id;
    `);

    const params = {
        "@destination_id": destination_id,
    };

    try {
        return await stmt.get(params);
    } finally {
        await stmt.finalize();
        db.close();
    }
}

async function updateDestinationByID(destination_id, des) {
    console.log("updateDestinationByID", destination_id, des);

    const db = await open({
        filename: "./db/TravelDiary.db",
        driver: sqlite3.Database,
    });

    const stmt = await db.prepare(`
    UPDATE Destinations
    SET
        Destination = @destination,
        StateID = @stateID
    WHERE
       DestID= @destination_id;
    `);

    const params = {
        "@destination_id": destination_id,
        "@destination": des.Destination,
        "@stateID": des.StateID,
    };

    try {
        return await stmt.run(params);
    } finally {
        await stmt.finalize();
        db.close();
    }
}


async function deleteDestinationByID(destination_id) {
    console.log("deleteDestinationByID", destination_id);

    const db = await open({
        filename: "./db/TravelDiary.db",
        driver: sqlite3.Database,
    });

    const stmt = await db.prepare(`
    DELETE FROM Destinations
    WHERE
       DestID = @destination_id;
    `);

    const params = {
        "@destination_id": destination_id,
    };

    try {
        return await stmt.run(params);
    } finally {
        await stmt.finalize();
        db.close();
    }
}


async function deleteRestaurantByID(restaurant_id) {
    console.log("deleteRestaurantByID", restaurant_id);

    const db = await open({
        filename: "./db/TravelDiary.db",
        driver: sqlite3.Database,
    });

    const stmt = await db.prepare(`
    DELETE FROM Restaurants
    WHERE
       RestID = @restaurant_id;
    `);

    const params = {
        "@restaurant_id": restaurant_id,
    };

    try {
        return await stmt.run(params);
    } finally {
        await stmt.finalize();
        db.close();
    }
}


async function insertDestination(des) {
    const db = await open({
        filename: "./db/TravelDiary.db",
        driver: sqlite3.Database,
    });

    const stmt = await db.prepare(`INSERT INTO
    Destinations(destination, StateID)
    VALUES (@Destination, @StateID);`);

    try {
        return await stmt.run({
            "@Destination": des.Destination,
            "@StateID": des.StateID,
        });
    } finally {
        await stmt.finalize();
        db.close();
    }
}


async function getRestaurantsByDestinationID(destination_id) {
    console.log("getRestaurantsByDestinationID", destination_id);

    const db = await open({
        filename: "./db/TravelDiary.db",
        driver: sqlite3.Database,
    });

    const stmt = await db.prepare(`
    SELECT * FROM Restaurants
    NATURAL JOIN Destinations
    WHERE DestID = @destination_id;
    `);

    const params = {
        "@destination_id": destination_id,
    };

    try {
        return await stmt.all(params);
    } finally {
        await stmt.finalize();
        db.close();
    }
}

async function getDestinationByRestaurantID(restaurant_id) {
    console.log("getRestaurantsByDestinationID", restaurant_id);

    const db = await open({
        filename: "./db/TravelDiary.db",
        driver: sqlite3.Database,
    });

    const stmt = await db.prepare(`
    SELECT Restaurants.DestID FROM Restaurants
    WHERE Restaurants.RestID = @restaurant_id;
    `);

    const params = {
        "@restaurant_id": restaurant_id,
    };

    try {
        return await stmt.all(params);
    } finally {
        await stmt.finalize();
        db.close();
    }
}

async function addRestaurantToDestination(destination_id, restaurant_name) {

    const db = await open({
        filename: "./db/TravelDiary.db",
        driver: sqlite3.Database,
    });

    const stmt = await db.prepare(`
    INSERT INTO
    Restaurants(RestName, DestID)
    VALUES (@restaurant_name, @destination_id);
    `);

    const params = {
        "@destination_id": destination_id,
        "@restaurant_name": restaurant_name,
    };

    try {
        return await stmt.run(params);
    } finally {
        await stmt.finalize();
        db.close();
    }
}


async function getRestaurants(query, page, pageSize) {
    console.log("getRestaurants", query);

    const db = await open({
        filename: "./db/TravelDiary.db",
        driver: sqlite3.Database,
    });

    const stmt = await db.prepare(`
    SELECT * FROM Restaurants
    WHERE RestName LIKE @query
    ORDER BY RestName DESC
    LIMIT @pageSize
    OFFSET @offset;
    `);

    const params = {
        "@query": query + "%",
        "@pageSize": pageSize,
        "@offset": (page - 1) * pageSize,
    };

    try {
        return await stmt.all(params);
    } finally {
        await stmt.finalize();
        db.close();
    }
}

async function getRestaurantsCount(query) {
    console.log("getRestaurantsCount", query);

    const db = await open({
        filename: "./db/TravelDiary.db",
        driver: sqlite3.Database,
    });

    const stmt = await db.prepare(`
    SELECT COUNT(*) AS count
    FROM Restaurants
    WHERE RestName LIKE @query;
    `);

    const params = {
        "@query": query + "%",
    };

    try {
        return (await stmt.get(params)).count;
    } finally {
        await stmt.finalize();
        db.close();
    }
}


async function getReviewsByRestID(restaurant_id) {
    console.log("getReviewsByRestID:", restaurant_id);

    const db = await open({
        filename: "./db/TravelDiary.db",
        driver: sqlite3.Database,
    });

    const stmt = await db.prepare(`
    SELECT Restaurants.RestID, Restaurants.RestName, Reviews.Comments AS Comments, ROUND(avg(Reviews.cost), 2) AS costAvg, ROUND(AVG(Reviews.rating),2) as ratingAvg
    FROM Reviews
    JOIN Restaurants ON Reviews.RestID = Restaurants.RestID
    WHERE Restaurants.RestID = @restaurant_id;

    `);

    const params = {
        "@restaurant_id": restaurant_id,
    };

    try {
        return (await stmt.get(params));
    } finally {
        await stmt.finalize();
        db.close();
    }
}

async function getCommentsByRestID(restaurant_id) {
    console.log("getCommentsByRestID:", restaurant_id);

    const db = await open({
        filename: "./db/TravelDiary.db",
        driver: sqlite3.Database,
    });

    const stmt = await db.prepare(`
    SELECT  Users.username, Reviews.ReviewID, Reviews.comments
    FROM Reviews
    JOIN Users ON Reviews.UserID = Users.userID
    JOIN Restaurants ON Reviews.RestID = Restaurants.RestID
    WHERE Restaurants.RestID = @restaurant_id;
    `);

    const params = {
        "@restaurant_id": restaurant_id,
    };

    try {
        return (await stmt.all(params));
    } finally {
        await stmt.finalize();
        db.close();
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
//module.exports.addRestaurantIDToDestinationID = addRestaurantIDToDestinationID;
module.exports.addRestaurantToDestination = addRestaurantToDestination;
module.exports.getRestaurants = getRestaurants;
module.exports.getRestaurantsCount = getRestaurantsCount;
module.exports.getDestinationByRestaurantID = getDestinationByRestaurantID;
module.exports.getReviewsByRestID = getReviewsByRestID;
module.exports.getCommentsByRestID = getCommentsByRestID;