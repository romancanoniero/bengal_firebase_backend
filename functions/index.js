/*
module.exports =
{
  ...require("./controllers/user")
}
*/
//const constants = require("./constants.js");



//import './flaresAPI';
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const GeoFire = require('geofire');
const { HttpsError } = require("firebase-functions/lib/providers/https");
const { log } = require("firebase-functions/lib/logger");
//const express = require("express");
//const cors = require("cors");

admin.initializeApp();
/*
module.exports = {
  ...require("./controllers/bengals.js"),

};
*/


const db = admin.database();


//const app = express();
//
//app.use(cors({origin : true}));

// Default geohash length
const GEOHASH_PRECISION = 10;
// Characters used in location geohashes
const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';


const FLARE_STATUS_TAKEN = 1;
const FLARE_STATUS_DELETED = 2;


const TABLE_USERS_FLARES = "users_flares";
const TABLE_USERS = "users";
const TABLE_FLARES_LOCATIONS = "flares_locations";
const TABLE_USER_FLARES = "users_flares";
const TABLE_USERS_WHO_TAKES_FLARES = "users_who_liked_me";
const TABLE_USERS_FLARES_RECEIVED = "users_flares_received";
const TABLE_USERS_LOCATIONS = "users_locations";

 

const tableUsersRef = admin.database().ref('/users/');
const likesRef = admin.database().ref('/' + TABLE_USERS_WHO_TAKES_FLARES + "/");
const flaresReceivedRef = admin.database().ref('/' + TABLE_USERS_FLARES_RECEIVED + "/");
const tableUsersLocationsRef = admin.database().ref('/' + TABLE_USERS_LOCATIONS + "/");

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
  sendNotification(data);
  return 'sorete';
})



function sendNewBengalNotification(response, userData, usersKeysArray) {
  const tableUsersRef = admin.database().ref('/users');
  var notificationData = {};
  notificationData["notification_type"] = "1"; // new bengal on sky
  notificationData["sender_key"] = userData.key; // sender
  notificationData["sender_name"] = userData.user_name; // sender
  //  log("profile image :"+userData.user_image_url);
  notificationData["profile_image_url"] = userData.user_image_url; // sender

  const promises = [];
  usersKeysArray.forEach(userKey => {
    if (userKey.localeCompare(userData.key) != 0) {
      tableUsersRef.child(userKey)
        .child("notification_token")
        .once("value")
        .then(function (snap) {
          if (snap.exists) {
            notificationData["notification_token"] = snap.val(); // sender
            promises.push(sendNotification(response, notificationData));
          }
        });
    }
  });

  Promise.all(promises)
    .then(() => {
      return response.status(200).json(new resultObject(0, "OK"));
    })
    .catch(errPromises => {
      console.log("an error occured during the processing of main promises");
      console.log(errPromises, errPromises.code);
      return "error";
    })




}



function sendNotification(response, notificationData) {

  if (notificationData != undefined) {
    var notificationToken = notificationData.notification_token;
  }


  var topic = "android";
  /*
  var message = {
    notification: {
      title: '$GOOG up 1.43% on the day',
      body: '$GOOG gained 11.80 points to close at 835.67, up 1.43% on the day.'
    },
    token: notificationToken
  };
*/
  var token = notificationData.notification_token;
  delete notificationData.notification_token;
  var params = JSON.stringify(notificationData)
  message = {};
  android = {};

  notification = {};
  // notification["title"] = "Titulo";
  // notification["body"] = "Texto";
  notification["title_loc_key"] = "notifications_title_new_flare_on_sky_title";
  notification["body_loc_key"] = "notifications_title_new_flare_on_sky_message";
  notification["body_loc_args"] = [notificationData.sender_name];
  notification["image"] = notificationData.profile_image_url;
  notification["click_action"] = 'VIEW_PROFILE_ACTION';
  android["notification"] = notification;

  message["android"] = android;
  message["token"] = token;

  message["data"] = {
    "link_key": notificationData.sender_key,
    "action": notification["click_action"]
  };


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


exports.fireBengal2 = functions.https.onRequest(async (data, response) => {
  var usersAround = [];
  const lat = parseFloat(data.query.lat);
  const lon = parseFloat(data.query.lon);
  const userKey = data.query.key;
  const notificationToken = data.query.notification_token;
  response.json({ result: `Message with ID:  added.` });
});


exports.fireBengal3 = functions.https.onRequest(async (data, response) => {
  var usersAround = [];
  const lat = parseFloat(data.query.lat);
  const lon = parseFloat(data.query.lon);
  const userKey = "5VX30RR1ajYDFmZ91BLIJTiZdjA3";
  const notificationToken = data.query.notification_token;

  try {
    //userKey = "5VX30RR1ajYDFmZ91BLIJTiZdjA3";


    await admin.database().ref('/' + TABLE_USER_FLARES + "/").child(userKey).get().then(bengalsStocksSnapshot => {

      var user = bengalsStocksSnapshot.val();

      response.json({ result: `Message with ID:  added. xxxxxxxxxxxx` + bengalsStocksSnapshot.toJSON() });
    });


  } catch (error) {
    response.json({ result: error });
  }


});




exports.fireBengal = functions.https.onRequest((request, response) => {

  try {
    var usersAround = [];
    const lat = parseFloat(request.body.data.lat);
    const lon = parseFloat(request.body.data.lon);
    const userKey = request.body.data.key;
    const notificationToken = request.body.data.notification_token;
    const authToken = request.body.data.auth_token;


    admin.auth().verifyIdToken(authToken)
      .then(() => {

    
        const tableFlaresLocationsRef = admin.database().ref('/' + TABLE_FLARES_LOCATIONS + "/");
        const tableFlaresStocksRef = admin.database().ref('/' + TABLE_USER_FLARES + "/");
        const geoFire = new GeoFire(admin.database().ref("/users_locations"));
        const location = [lat, lon];
        tableFlaresStocksRef.child(userKey).once("value").then(bengalsStocksSnapshot => {
          if (bengalsStocksSnapshot.exists && bengalsStocksSnapshot.numChildren() > 0) {
            var freeBengalFound = false;
            bengalsStocksSnapshot.forEach(function (snap) {
              if (!freeBengalFound) {
                const transactionRecord = snap.val();
                const transactionKey = transactionRecord.lot_key;
                if (transactionRecord.quantity > 0) {
                  freeBengalFound = true;
                  // Obtengo los datos del Usuario asi creo la Bengala  
                  tableUsersRef.child(userKey).once('value', function (querySnapshot) {
                    if (querySnapshot.exists) {
                      var user = querySnapshot.val();
                      if (notificationToken.localeCompare(user.notification_token) == 0) {
                        var newFlare = createFlareObject(user, location);
                        // Grabo la Bengala
                        var newFlareKey = tableFlaresLocationsRef.push().key.toString();
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
                                var geoQuery = geoFire.query({
                                  center: location,
                                  radius: 300
                                });
                                var onKeyEnteredRegistration = geoQuery.on('key_entered', (key, location, distance) => {
                                  
                       //           return   response.status(200).json({ data:  new resultObject(0, JSON.stringify(user.blocked)) });
                                  
                                  usersAround.push(key);
                                });
                                var onKeyEnteredRegistration = geoQuery.on('ready', () => {

                                  var userData = {};
                                  userData["key"] = user.user_key;
                                  userData["user_name"] = user.display_name;
                                  userData["user_image_url"] = getSortedData(user.images, 'isFavorite', true)[0].url;
                                  sendNewBengalNotification(response, userData, usersAround);
                                  //    return   response.status(200).json({ data:  new resultObject(0, "OK") });
                                });
                              })

                          });
                      }
                      else {
                        return response.status(200).json(resultObject(1002, "INVALID_TOKEN"));
                      }
                    }
                    else {
                      return response.status(200).json({ data: "UNKNOWN_USER", message: "The read failed: " });
                    }
                  }, function (error) {
                    //                return response.status(200).json({code: 1001,  data: "NO_BENGAL_ENOUGH", message: "The read failed: " + error.code });
                    return response.status(200).json(new resultObject(1001, "NO_BENGAL_ENOUGH"));
                  });

                }
              }
            });
          }
          else {
            return response.status(200).json(new resultObject(1001, "NO_BENGAL_ENOUGH"));
          }


        });


      })
      .catch((error) => {
        return response.status(200).json(new resultObject(1101, "UNAUTHORIZED_USER"));
      })





  } catch (error) {
    return response.status(200).json({ data: error.code });
  }


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



  /*
    promiseFlaresStocks.catch(error =>
    {

    });

    
    Promise.all([promiseFlaresStocks])
    .then(_ => response.status(200).send("I waited for all the Queries AND the update operations inside the then blocks of queries to finish!"));
  */

  //return response.status(500).send(error);
  //return Promise.all(promiseFlaresStocks);


});

exports.giveALike = functions.https.onRequest((request, response) => {

  try {
    var usersAround = [];
    const userWhoGaveLike = request.body.data.user_who_give_like_key;
    const userLiked = request.body.data.user_liked_key;
    const authToken = request.body.data.auth_token;

    like = UsersWhoLikesMe();
    like.user_who_give_like_key = userWhoGaveLike;
    like.user_liked_key = userLiked;

    admin.auth().verifyIdToken(authToken)
      .then(() => {

        likesRef.child(like.user_liked_key)
          .child(like.user_who_give_like_key)
          .set(like)
          .then(() => {

            flaresReceivedRef.child(user_who_give_like_key)
              .child(user_liked_key)
              .child("status")
              .set(FLARE_STATUS_TAKEN)
              .then(() => {
                return response.status(200).json(new resultObject(0, "OK"));
              })
              .catch(error => {
                return response.status(200).json(new resultObject(-1, error.message));
              });

          })

      })
      .catch((error) => {
        return response.status(200).json(new resultObject(1101, "UNAUTHORIZED_USER"));
      })

  } catch (error) {
    return response.status(200).json({ data: error.code });
  }
});

/*
* Hace invisible una bengala para que no se visible para ese usuario
*/
exports.removeFlareReceived = functions.https.onRequest((request, response) => {

  try {
    var usersAround = [];
    const userWhoFiredTheFlareKey = request.body.data.user_who_fired_the_flare_key;
    const userWhoReceiveKey = request.body.data.user_who_receive_key;
    const authToken = request.body.data.auth_token;

    admin.auth().verifyIdToken(authToken)
      .then(() => {
        flaresReceivedRef.child(userWhoReceiveKey)
          .child(userWhoFiredTheFlareKey)
          .child("status")
          .set(FLARE_STATUS_DELETED)
          .then(() => {
            return response.status(200).json(new resultObject(0, "OK"));
          })
          .catch(error => {
            return response.status(200).json(new resultObject(-1, error.message));
          });
      })
      .catch((error) => {
        return response.status(200).json(new resultObject(1101, "UNAUTHORIZED_USER"));
      })

  } catch (error) {
    return response.status(200).json({ data: error.code });
  }
});

//--------------------------------------- USERS ------------------------------//
exports.blockUser = functions.https.onRequest((request, response) => {

  try {
    var usersAround = [];
    const userWhoBlocksKey = request.body.data.user_who_blocks_key;
    const userWhoToBlockKey = request.body.data.user_to_block_key;
    const authToken = request.body.data.auth_token;

    admin.auth().verifyIdToken(authToken)
      .then(() => {

        tableUsersRef.child(userWhoBlocksKey)
          .child("blocked")
          .child(userWhoToBlockKey)
          .set(userWhoToBlockKey)
          .then(() => {

            tableUsersLocationsRef.child(userWhoBlocksKey)
                                  .child("blocked")
                                  .child(userWhoToBlockKey)  
                                  .set(userWhoToBlockKey)
                                  .then(()=>{
                                      return response.status(200).json(new resultObject(0, "OK"));
                                  })
                                  .catch(error => {
                                    return response.status(200).json(new resultObject(-1, error.message));
                                  });
                        
          })
          .catch(error => {
            return response.status(200).json(new resultObject(-1, error.message));
          });
      })
      .catch((error) => {
        return response.status(200).json(new resultObject(1101, "UNAUTHORIZED_USER"));
      })

      

  } catch (error) {
    return response.status(200).json({ data: error.code });
  }
});


function resultObject(status, message) {
  var resultObject = {};
  var messageObject = {};
  messageObject["status"] = status;
  messageObject["message"] = message;
  resultObject["data"] = messageObject;
  //  return JSON.stringify(resultObject);

  return resultObject;

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
  newFlare.blocked = []
  if (user.blocked!=null)
  {
    newFlare.blocked = user.blocked
  }
  
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


//------------------------- CLASSES -----------------------------------
class FlareGeoLocation {
  user_key = "";
  day_of_launch = "";
  day_of_birth = "";
  user_name = "";
  user_image_url = "";
  searching_sexual_orientation = [];
  searching_relation_types = [];
  time_of_launch = 0;
  blocked = [];
}


class UsersWhoLikesMe {
  user_liked_key = "";
  user_who_likes_key = "";
}


