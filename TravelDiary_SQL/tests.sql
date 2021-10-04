-- Test1. How many states  each user has been to
SELECT Users.username as "Users", State
FROM Users
JOIN User_Destinations ON Users.userID = User_Destinations.userID
JOIN Destinations ON User_Destinations.DestID = Destinations.DestID
JOIN States ON States.StateID = Destinations.StateID
ORDER BY "Users" ASC, "State" ASC

--Restaurants with >10 reviews from different users
SELECT Restaurants.RestName, COUNT(Users.userID) AS UserCounts
FROM Users 
JOIN Reviews ON Reviews.UserID = Users.userID
JOIN Restaurants on Restaurants.RestID = Reviews.RestID
GROUP BY Restaurants.RestName
HAVING UserCounts > 10


--Subquery used to find restaurts and destinations with Restaurants cost > 100 in reviews
SELECT Restaurants.RestName AS "Restaurants", Destinations.Destination AS "Destinaion"
FROM Restaurants 
INNER JOIN Destinations ON Destinations.DestID = Restaurants.DestID
WHERE Restaurants.RestName IN(
	SELECT Restaurants.RestName
	FROM Restaurants
	JOIN Reviews  ON Reviews.RestID = Restaurants.RestID
	WHERE Reviews.cost > 100
	)


--Lists states starts with letter "C" or "N", destinations with restaurants which have more than 3 reviewers, list the avg rating of rach
SELECT States.State, Destinations.Destination,  Restaurants.RestName, COUNT(Users.userID) AS "Reviewers", 
				ROUND(AVG(Reviews.rating),2) AS"AvgRating"
FROM States
JOIN Destinations ON Destinations.StateID = States.StateID
JOIN Restaurants ON Restaurants.RestID = Destinations.DestID
JOIN Reviews ON Reviews.RestID = Restaurants.RestID 
JOIN Users ON Users.userID = Reviews.UserID
WHERE States.State LIKE  "C%" OR States.State LIKE "N%"
GROUP BY Restaurants.RestName
HAVING Reviewers > 3

--Test with PARTITION BY 
SELECT States.State, Restaurants.RestName, ROUND(AVG(Reviews.cost) OVER (
	PARTITION BY Restaurants.RestName), 2) AS "AvgCost"
	FROM States
	JOIN Destinations ON Destinations.StateID = States.StateID
	JOIN Restaurants ON Restaurants.DestID = Destinations.DestID
	JOIN Reviews ON Reviews.RestID = Restaurants.RestID
	JOIN Users ON  Users.userID = Reviews.UserID
ORDER BY States.State ASC