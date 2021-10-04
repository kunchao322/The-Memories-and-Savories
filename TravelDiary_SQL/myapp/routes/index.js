/* eslint-disable indent */
const express = require("express");
const router = express.Router();

const myDb = require("../db/mySqliteDB.js");

/* GET home page. */
router.get("/", async function(req, res) {
    res.redirect("/destinations");
});

// http://localhost:3000/references?pageSize=24&page=3&q=John
router.get("/destinations", async(req, res, next) => {
    const query = req.query.q || "";
    const page = +req.query.page || 1;
    const pageSize = +req.query.pageSize || 24;
    const msg = req.query.msg || null;

    try {
        let total = await myDb.getDestinationsCount(query);
        let destinations = await myDb.getDestinations(query, page, pageSize);
        console.log("total", total);
        res.render("./pages/index", {
            destinations,
            query,
            msg,
            currentPage: page,
            lastPage: Math.ceil(total / pageSize),
        });
    } catch (err) {
        next(err);
    }
});

router.get("/destinations/:destination_id/edit", async(req, res, next) => {
    console.log("Line 37 edit1", req.body);

    const destination_id = req.params.destination_id;

    const msg = req.query.msg || null;
    try {

        let des = await myDb.getDestinationByID(destination_id);
        let restaurants = await myDb.getRestaurantsByDestinationID(destination_id);

        console.log("Line 47 edit destination", {
            des,
            restaurants,
            msg,
        });


        res.render("./pages/editDestination", {
            des,
            restaurants,
            msg,
        });
    } catch (err) {
        next(err);
    }
});

router.post("/destinations/:destination_id/edit", async(req, res, next) => {
    const destination_id = req.params.destination_id;

    console.log("LINE 67 : edit", destination_id);
    const des = req.body;
    try {

        let updateResult = await myDb.updateDestinationByID(destination_id, des);
        console.log("update", updateResult);

        if (updateResult && updateResult.changes === 1) {
            res.redirect("/destinations/?msg=Updated");
        } else {
            res.redirect("/destinations/?msg=Error Updating");
        }

    } catch (err) {
        next(err);
    }
});



router.get("/destinations/:destination_id/delete", async(req, res, next) => {
    const destination_id = req.params.destination_id;
    console.log("id", destination_id);
    try {

        let deleteResult = await myDb.deleteDestinationByID(destination_id);
        console.log("delete", deleteResult);

        if (deleteResult && deleteResult.changes === 1) {
            res.redirect("/destinations/?msg=Deleted");
        } else {
            res.redirect("/destinations/?msg=Error Deleting");
        }

    } catch (err) {
        next(err);
    }
});


router.post("/createDestination", async(req, res, next) => {
    const des = req.body;
    console.log(des);

    try {
        const insertDes = await myDb.insertDestination(des);

        console.log("Inserted", insertDes);
        res.redirect("/destinations/?msg=Inserted");
    } catch (err) {
        console.log("Error inserting", err);
        next(err);
    }
});


router.get("/destinations/:destination_id/removeRestaurant/:restaurant_id", async(req, res, next) => {
    const destination_id = req.params.destination_id;
    console.log("RestID", destination_id);

    const restaurant_id = req.params.restaurant_id;

    try {

        let deleteResult = await myDb.deleteRestaurantByID(restaurant_id);
        console.log("delete", deleteResult);

        if (deleteResult && deleteResult.changes === 1) {
            res.redirect(`/destinations/${destination_id}/edit?msg=Restaurant Deleted`);
        } else {
            res.redirect("/destinations/?msg=Error Deleting");
        }

    } catch (err) {
        next(err);
    }
});

//get restaurntslists
router.get("/destinations/restaurants", async(req, res, next) => {
    // res.json([1, 2, 3]);
    const query = req.query.q || "";
    const page = +req.query.page || 1;
    const pageSize = +req.query.pageSize || 24;
    const msg = req.query.msg || null;
    try {
        let total = await myDb.getRestaurantsCount(query);
        let restaurants = await myDb.getRestaurants(query, page, pageSize);
        //let total = await myDb.getDestinationsCount(query);
        /// let des = await myDb.getDestinationByRestaurantID(query, page, pageSize);

        res.render("./pages/allRestaurants", {
            restaurants,
            //    des,
            query,
            msg,
            currentPage: page,
            lastPage: Math.ceil(total / pageSize),
        });
    } catch (err) {
        next(err);
    }
});


router.post("/destinations/:destination_id/addRestaurant", async(req, res, next) => {
    console.log("Addddddd Restaurant", req.body);
    const destination_id = req.params.destination_id;
    const restaurant_name = req.body.restaurant_name;

    try {

        let updateResult = await myDb.addRestaurantToDestination(destination_id, restaurant_name);
        console.log("getRestaurantsByDestinationID", updateResult);

        if (updateResult && updateResult.changes === 1) {
            res.redirect(`/destinations/${destination_id}/edit?msg=Restaurant added`);
        } else {
            res.redirect(`/destinations/${destination_id}/edit?msg=Error adding Restaurant`);
        }

    } catch (err) {
        next(err);
    }
});


//delete rest in big list then direct to the destination where the restaurnt located
router.get("/destinations/removeRestaurant/:restaurant_id", async(req, res, next) => {
    const restaurant_id = req.params.restaurant_id;

    try {

        let deleteRestaurant = await myDb.deleteRestaurantByID(restaurant_id);

        if (deleteRestaurant && deleteRestaurant.changes === 1) {
            res.redirect("/destinations/restaurants?msg = Restaurants deleted");
        } else {
            res.redirect("/destinations/?msg=Error Deleting");
        }

    } catch (err) {
        next(err);
    }
});

//'/destinations/' + des.DestID + '/restaurant/' + r.RestID

router.get("/destinations/:destination_id/restaurant/:restaurant_id", async(req, res, next) => {
    const restaurant_id = req.params.restaurant_id;

    try {

        let restaurant = await myDb.getReviewsByRestID(restaurant_id);
        let comments = await myDb.getCommentsByRestID(restaurant_id);

        console.log("Restaurants", restaurant);
        console.log("Comments", comments);

        res.render("./pages/restaurantsDetails", {
            restaurant,
            comments
        });
    } catch (err) {
        next(err);
    }
});


module.exports = router;