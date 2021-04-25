const functions = require("firebase-functions");


    exports.fireBengal = functions.https.onRequest((request, response) =>
{
  var usersAround = [];
    const lat =parseFloat(request.query.lat) ;
    const lon = parseFloat(request.query.lon);
    const key = request.query.key;
    const notificationToken = request.query.notification_token;

    const tableUsersRef = admin.database().ref('/users');
    const geoFire = new GeoFire(admin.database().ref("/users_locations"));
    location = [lat,lon];
    var geoQuery =  geoFire.query({
      center : location,
      radius :300
    });
    var onKeyEnteredRegistration =geoQuery.on('key_entered', (key, location, distance) =>
    {
      usersAround.push(key);
    });
     db = admin.database();
    var ref = db.ref('/soretuli/');
    tableUsersRef.child(key).once('value', function(querySnapshot)
    {
         if (querySnapshot.exists)
        {
          var  user = querySnapshot.val();
          if (notificationToken.localeCompare(user.notification_token))
          {
            var newFlare = createFlareObject(user,location);
            ref.push(newFlare).then(function()
            {
                response.status(200).send({msg : JSON.stringify(newFlare)});
            });
          }
          else
          {
            response.status(400).send({msg : "token not found"});
          }
        }
        else
        {
          response.status(200).send({msg : "user not found"});
        }
    }, function (errorObject) 
    {
      console.log("The read failed: " + errorObject.code);
    });
  
  
  });

