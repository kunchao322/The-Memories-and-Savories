/* eslint-disable indent */
const express = require("express");
const router = express.Router();

const myDb = require("../db/myDBMongo.js");
const myDBRedis = require("../db/myDBRedis.js");

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

        await myDBRedis.addHotDestination(des);

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
    const des = req.body;

    try {
        let updateResult = await myDb.updateDestinationByID(destination_id, des);

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
    //    console.log("Addddddd Restaurant", req.body);
    const destination_id = req.params._id;
    const restaurant = {
        id: req.body.id,
        name: req.body.name
    }

    try {

        let updateResult = await myDb.addRestaurantToDestination(destination_id, restaurant);
        // console.log("getRestaurantsByDestinationID", updateResult);

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

//top ones
router.get('/hotDestinations', async(req, res, next) => {
    try {
        let hotDestinations = await myDBRedis.getHotDestinations();
        res.render('./pages/hotDestinations', {
            hotDestinations,
        });
    } catch (err) {
        next(err);
    }
});

router.get('/destinations/wishlist', async(req, res, next) => {
    try {
        let wishlist = await myDBRedis.getWishlist();
        res.render('./pages/wishlist', {
            wishlist,
        });
    } catch (err) {
        next(err);
    }
});


router.get("/destinations/:destination_id/addToWishlist", async(req, res, next) => {

    const destination_id = req.params.destination_id;

    const msg = req.query.msg || null;
    try {

        let des = await myDb.getDestinationByID(destination_id);
        //   let restaurants = await myDb.getRestaurantsByDestinationID(destination_id);

        // await myDBRedis.addHotDestination(des);
        await myDBRedis.addToWishlist(des);
        res.redirect(`/destinations/${destination_id}/edit?msg=Added to wishlist!`);

    } catch (err) {
        next(err);
    }
});


// router.get("/destinations/wishlist/removeFromWishlist", async(req, res, next) => {
//     //const destination_id = req.params.destination_id;
//     const msg = req.query.msg || null;
//     console.log(req.body);
//     try {
//         // let des = await myDb.getDestinationByID(destination_id);
//         //  console.log(des, destination_id);
//         // let restaurants = await myDb.getRestaurantsByDestinationID(destination_id);
//         // await myDBRedis.addHotDestination(des);
//         await myDBRedis.removeFromWishlist(req.body.wishToRemove);
//         console.log(req.body.wishToRemove)
//             // res.render('./pages/hotDestinations? msg = Removed From wishlist!', {
//             //     wishlist
//             // });
//         res.redirect("/destinations/wishlist");
//     } catch (err) {
//         next(err);
//     }
// });


// router.post("/destinations/wishlist/removeFromWishlist", async(req, res, next) => {
//     //const destination_id = req.params.destination_id;
//     const msg = req.query.msg || null;
//     console.log(req.body);
//     try {
//         await myDBRedis.removeFromWishlist(req.body.wishToRemove);
//         console.log(req.body.wishToRemove)
//         res.redirect("/destinations/wishlist");
//     } catch (err) {
//         next(err);
//     }
// });


// router.get("/destinations/:_id/restaurant/:restaurant_id", async(req, res, next) => {
//     const restaurant_id = req.params.restaurant_id;
//     const destination_id = req.params._id;
//     console.log("index page", destination_id)
//     try {

//         const cost = await myDBRedis.getAvgCost(restaurant_id, destination_id);

//         //  let comments = await myDb.getCommentsByRestID(restaurant_id);

//         // console.log("Restaurants Rating", rating);
//         //console.log("Comments", comments);
//         res.render('./pages/restaurantsDetails',
//             cost
//         );
//     } catch (err) {
//         next(err);
//     }
// });


router.get("/destinations/:destination_id/restaurant/:restaurant_id", async(req, res, next) => {
    const restaurant_id = req.params.restaurant_id;
    // const destination_id = req.params.destination_id;
    try {
        const cost = await myDBRedis.getAvgCost(restaurant_id);
        const rating = await myDBRedis.getAvgRating(restaurant_id);
        console.log("aAAAvg cost is ", cost);

        res.render("./pages/restaurantsDetails", {
            cost,
            rating
        });
    } catch (err) {
        next(err);
    }
});



module.exports = router;