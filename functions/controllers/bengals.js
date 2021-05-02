const functions = require("firebase-functions");
const admin = require("firebase-admin");
const GeoFire = require('geofire');




exports.fireBengal = functions.https.onRequest((request, response) => {

    try {
      var usersAround = [];
      const lat = parseFloat(request.body.data.lat);
      const lon = parseFloat(request.body.data.lon);
      const userKey = request.body.data.key;
      const notificationToken = request.body.data.notification_token;
      const authToken = request.body.data.auth_token;
  
  
    admin.auth().verifyIdToken(authToken)
      .then(()=>
      {
  
        const tableUsersRef = admin.database().ref('/users/');
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
                      return response.status(200).json( new resultObject(1001, "NO_BENGAL_ENOUGH") );
                  });
    
                }
              }
            });
          }
          else {
            return response.status(200).json( new resultObject(1001, "NO_BENGAL_ENOUGH") );
          }
    
    
        });
    
  
      })
      .catch((error) =>{
        return response.status(200).json( new resultObject(1101, "UNAUTHORIZED_USER") );
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
  
  