/* eslint-disable indent */
const express = require("express");
const router = express.Router();

const myDb = require("../db/myDBMongo.js");

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

        if (updateResult.matchedCount === 1 && updateResult.modifiedCount === 1) {
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

        if (deleteResult.deletedCount === 1) {
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


router.get("/destinations/:_id/removeRestaurant/:restaurant_id", async(req, res, next) => {
    const destination_id = req.params._id;
    console.log("destID", destination_id);

    const restaurant_id = req.params.restaurant_id;
    console.log("restID", restaurant_id);

    try {

        let deleteRes = await myDb.deleteRestaurantByID(restaurant_id, destination_id);
        console.log("delete", deleteRes);

        if (deleteRes.modifiedCount === 1) {
            res.redirect(`/destinations/${destination_id}/edit?msg=RestaurantDeleted`);
        } else {
            res.redirect("/destinations/?msg=ErrorDeleting");
        }

    } catch (err) {
        next(err);
    }
});



router.post("/destinations/:_id/addRestaurant", async(req, res, next) => {
    console.log("Addddddd Restaurant", req.body);
    const destination_id = req.params._id;
    const restaurant = {
        id: req.body.id,
        name: req.body.name
    }

    try {

        let updateResult = await myDb.addRestaurantToDestination(destination_id, restaurant);
        console.log("getRestaurantsByDestinationID", updateResult);

        if (updateResult.modifiedCount === 1 && updateResult.matchedCount === 1) {
            res.redirect(`/destinations/${destination_id}/edit?msg=Restaurant added`);
        } else {
            res.redirect(`/destinations/${destination_id}/edit?msg=Error adding Restaurant`);
        }

    } catch (err) {
        next(err);
    }
});


//delete rest in big list then direct to the destination where the restaurnt located
router.get("/destinations/:id/removeRestaurant/:restaurant_name", async(req, res, next) => {
    const restaurant_name = req.params.restaurant_name;
    const destination_id = req.params._id;

    try {

        let deleteRestaurant = await myDb.deleteRestaurantByID(restaurant_name, destination_id);

        if (deleteRestaurant && deleteRestaurant.changes === 1) {
            res.redirect("/destinations/restaurants?msg = Restaurants deleted");
        } else {
            res.redirect("/destinations/?msg=Error Deleting");
        }

    } catch (err) {
        next(err);
    }
});


router.get("/destinations/:_id/restaurant/:restaurant_id", async(req, res, next) => {
    try {
        res.redirect("/destinations");
    } catch (err) {
        next(err);
    }
});


module.exports = router;