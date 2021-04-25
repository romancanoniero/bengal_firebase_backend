const constants = require("./constants.js");

//import './flaresAPI';
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const GeoFire = require('geofire');
// Default geohash length
const GEOHASH_PRECISION = 10;
// Characters used in location geohashes
const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';



class FlareGeoLocation {
  user_key = "";
  day_of_launch = "";
  day_of_birth = "";
  user_name = "";
  user_image_url = "";
  searching_sexual_orientation = [];
  searching_relation_types = [];
  time_of_launch = 0;
}


const TABLE_USERS_FLARES = "users_flares";
const TABLE_USERS = "users";
const TABLE_FLARES_LOCATIONS = "flares_locations";
const TABLE_USER_FLARES = "users_flares";


admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.randomNumber = functions.https.onRequest((request, response) => {
  const number = Math.round(Math.random() * 100);
  response.send(number.toString());

});



exports.sendNotification = functions.https.onCall(async (data, context) => {
  console.log("111");


  /*
  if (!context.auth)
  {
     throw new functions.https.HttpsError("unauthenticated", "only authenticated users can send notifications"); 
  }
  */

  sendNotification(data);

  return 'sorete';
})



function sendNewBengalNotification(response, usersKeysArray) {

  const tableUsersRef = admin.database().ref('/users');
  var notificationData = {};


  notificationData["notification_type"] = 1; // new bengal on sky
  notificationData["sender_name"] = "Roman"; // sender

  usersKeysArray.forEach(userKey => {
    tableUsersRef.child(userKey)
      .child("notification_token")
      .once("value")
      .then(function (snap) {
        if (snap.exists) {
          notificationData["notification_token"] = snap.val(); // sender



          sendNotification(response, notificationData);
        }
      });
  });

  //response.status(200).send({ msg: "Ok" });

}



function sendNotification(response, data) {



  if (data != undefined) {
    var notificationToken = data.notification_token;
  }


  var topic = "android";
  var message = {
    notification: {
      title: '$GOOG up 1.43% on the day',
      body: '$GOOG gained 11.80 points to close at 835.67, up 1.43% on the day.'
    },
    token: notificationToken
  };
  //  token: "cF5MlwdkThioJ0ipGuJTpD:APA91bE3lpSTZxLOHWxM5SPc2YYO3Q6SNGXgsdFnPY8efJyJ3_jFIJF5TSv7cn-8vmowwRn6b2WduqytHN7fjGiFBhvJCtUZICg2Z6y0uGIVXbxrY9LnO9lbGfMnw5UfLBZxS9JMe6ph"
  try {
    const response = admin.messaging().send(message);
    console.log("Successfully sent message", response);
    return response;
  } catch (error) {
    console.log("Error sending message", error);
    return "error: " + error;
  }

}

exports.setLocation = functions.https.onRequest((request, response) => {
  const lat = parseFloat(request.query.lat);
  const lon = parseFloat(request.query.lon);
  const key = request.query.key;


  const geoFire = new GeoFire(admin.database().ref("/culenge"));
  location = [lat, lon];
  geoFire.set(key, location).then(function () {
    response.send(200, "its great");
  })


})


exports.fireBengal = functions.https.onRequest( async (data, response) => {

  
// return response.status(200).send({ msg: typeof(data) });



  var usersAround = [];
  const lat = parseFloat(data.query.lat);
  const lon = parseFloat(data.query.lon);
  const userKey = data.query.key;
  const notificationToken = data.query.notification_token;

//  




  const tableUsersRef = admin.database().ref('/users/');
  const tableFlaresLocationsRef = admin.database().ref('/' + TABLE_FLARES_LOCATIONS + "/");
  const tableFlaresStocksRef = admin.database().ref('/' + TABLE_USER_FLARES + "/");
  const geoFire = new GeoFire(admin.database().ref("/users_locations"));


  location = [lat, lon];
  var geoQuery = geoFire.query({
    center: location,
    radius: 300
  });
  var onKeyEnteredRegistration = geoQuery.on('key_entered', (key, location, distance) => {
    usersAround.push(key);
  });


  db = admin.database();


 promiseFlaresStocks = await tableFlaresStocksRef.child(userKey).once("value").then(bengalsStocksSnapshot => {

//  return Promise.all(promiseFlaresStocks);
 response.status(200).send({ msg: "typeof(data.notification_token) "})  ;


 
/*
    if (bengalsStocksSnapshot.exists && bengalsStocksSnapshot.numChildren() > 0) {
      var freeBengalFound = false;
      bengalsStocksSnapshot.forEach(function (snap) {
        if (!freeBengalFound) {
          var transactionRecord = snap.val();
          var transactionKey = transactionRecord.lot_key;
          if (transactionRecord.quantity > 0) {
            freeBengalFound = true;
            // Obtengo los datos del Usuario asi creo la Bengala  
            tableUsersRef.child(userKey).once('value', function (querySnapshot) {
              if (querySnapshot.exists) {
                var user = querySnapshot.val();
                if (notificationToken.localeCompare(user.notification_token)) {
                  var newFlare = createFlareObject(user, location);
                  // Grabo la Bengala
                  var newFlareKey = tableFlaresLocationsRef.push().key;
                  tableFlaresLocationsRef.child(newFlareKey).set(newFlare)
                    .then(function (snap) {
                      tableUsersRef.child(userKey)
                        .child('flares')
                        .child(newFlareKey)
                        .set(newFlare)
                        .then(function (result) {
                          if (transactionRecord.quantity - 1 > 0) {
                            tableFlaresStocksRef.child(userKey)
                              .child(transactionKey)
                              .child("quantity")
                              .set(transactionRecord.quantity - 1);

                          }
                          else {
                            tableFlaresStocksRef.child(userKey)
                              .child(transactionKey)
                              .remove();
                          }
                          sendNewBengalNotification(response, usersAround);
                         
     // x promise                    response.status(200).send(resultObject("OK", "Launch Successfull"));
//                          return resultObject("OK", "Launch Successfull");
                         // return { response: "Ok" };
                        })
                    });
                }
                else {
                  return resultObject("ERROR", "token not found");
 //                 return { response: "token not found" };
                  //                  response.status(400).send({ msg: "token not found" });
                }
              }
              else {
                //                response.status(200).send({ msg: "user not found" });
//                return { response: "user not found" };
return resultObject("ERROR", "User Not Found");

              }
            }, function (errorObject) {
              //        console.log("The read failed: " + errorObject.code);
             // return { response: "The read failed: " + errorObject.code };
             return resultObject("ERROR", "The read failed: " + errorObject.code);
            
            });
          }
          //-----
        }
      });


  
  
  
   
   
   
   
   
    }
    else {
      //      response.status(200).send("El Usuario no tiene suficientes Bengalas");
      return resultObject("ERROR", "El Usuario no tiene suficientes Bengalas");

//      return { response: "El Usuario no tiene suficientes Bengalas" };

    }

     */
  });
/*
  promiseFlaresStocks.catch(error =>
  {

  });

  
  Promise.all([promiseFlaresStocks])
  .then(_ => response.status(200).send("I waited for all the Queries AND the update operations inside the then blocks of queries to finish!"));
*/

//return response.status(500).send(error);
return Promise.all(promiseFlaresStocks);


});



function resultObject(status, message) 
{
  var resultObject = {};

  var messageObject = {};
  messageObject["status"] = status;
  messageObject["message"] = message;
resultObject["data"] = messageObject;
return  JSON.stringify(resultObject);


}




/*
exports.retreivefromdatabase = functions.https.onRequest((req,res) => {
  var db = admin.database();
  var ref = db.ref();
  var username = req.params.username;

  ref.orderByChild("Username").equalTo(username).once("child_added", function(snapshot){
    res.send(snapshot.val());
  });
});
*/


function createFlareObject(user, location) {
  var newFlare = new FlareGeoLocation();

  newFlare.user_key = user.user_key;
  newFlare.user_name = user.display_name;
  newFlare.user_image_url = getSortedData(user.images, 'isFavorite', true)[0].url;
  newFlare.gender_key = user.gender_key;
  newFlare.day_of_birth = user.day_of_birth;
  newFlare.sexual_preference_key = user.sexual_preference_key;
  newFlare.searching_age_ranges = user.searching_age_ranges;
  newFlare.searching_genders = user.searching_genders;
  newFlare.searching_sexual_orientation = user.searching_sexual_orientation
  newFlare.searching_relation_types = user.searching_relation_types
  newFlare.searching_age_ranges = user.searching_age_ranges

  newFlare.g = geohashForLocation(location);
  newFlare.l = location;

  newFlare.time_of_launch = +new Date();


  /* todo
   newFlare.day_of_launch = dateString
 */

  return newFlare;
}

/**
 * Generates a geohash of the specified precision/string length from the  [latitude, longitude]
 * pair, specified as an array.
 *
 * @param location The [latitude, longitude] pair to encode into a geohash.
 * @param precision The length of the geohash to create. If no precision is specified, the
 * global default is used.
 * @returns The geohash of the inputted location.
 */
function geohashForLocation(location, precision = GEOHASH_PRECISION) {
  validateLocation(location);
  if (typeof precision !== 'undefined') {
    if (typeof precision !== 'number' || isNaN(precision)) {
      throw new Error('precision must be a number');
    } else if (precision <= 0) {
      throw new Error('precision must be greater than 0');
    } else if (precision > 22) {
      throw new Error('precision cannot be greater than 22');
    } else if (Math.round(precision) !== precision) {
      throw new Error('precision must be an integer');
    }
  }

  const latitudeRange = {
    min: -90,
    max: 90
  };
  const longitudeRange = {
    min: -180,
    max: 180
  };
  let hash = '';
  let hashVal = 0;
  let bits = 0;
  //  let even: "number" | "boolean" = 1; 
  let even = 1;



  while (hash.length < precision) {
    const val = even ? location[1] : location[0];
    const range = even ? longitudeRange : latitudeRange;
    const mid = (range.min + range.max) / 2;

    if (val > mid) {
      hashVal = (hashVal << 1) + 1;
      range.min = mid;
    } else {
      hashVal = (hashVal << 1) + 0;
      range.max = mid;
    }

    even = !even;
    if (bits < 4) {
      bits++;
    } else {
      bits = 0;
      hash += BASE32[hashVal];
      hashVal = 0;
    }
  }

  return hash;
}


/**
 * Validates the inputted location and throws an error if it is invalid.
 *
 * @param location The [latitude, longitude] pair to be verified.
 */
function validateLocation(location) {


  if (!Array.isArray(location)) {
    error = 'location must be an array';
  } else if (location.length !== 2) {
    error = 'expected array of length 2, got length ' + location.length;
  } else {
    const latitude = location[0];
    const longitude = location[1];

    if (typeof latitude !== 'number' || isNaN(latitude)) {
      error = 'latitude must be a number';
    } else if (latitude < -90 || latitude > 90) {
      error = 'latitude must be within the range [-90, 90]';
    } else if (typeof longitude !== 'number' || isNaN(longitude)) {
      error = 'longitude must be a number';
    } else if (longitude < -180 || longitude > 180) {
      error = 'longitude must be within the range [-180, 180]';
    }
  }

  if (typeof error !== 'undefined') {
    throw new Error('Invalid GeoFire location \'' + location + '\': ' + error);
  }
}




const sort_by = (field, reverse, primer) => {

  const key = primer ?
    function (x) {
      return primer(x[field])
    } :
    function (x) {
      return x[field]
    };

  reverse = !reverse ? 1 : -1;

  return function (a, b) {
    return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
  }
}


function getSortedData(data, prop, isAsc) {
  return data.sort((a, b) => {
    return (a[prop] < b[prop] ? -1 : 1) * (isAsc ? 1 : -1)
  });
}