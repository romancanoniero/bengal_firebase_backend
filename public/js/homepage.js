//const { sendNotification } = require("../../functions"); 

const actionSendNotification = document.querySelector('.sendNotification');



actionSendNotification.addEventListener('click', (e)=>{
    

    const firebaseSendNotification = firebase.functions().httpsCallable('sendNotification');

    firebaseSendNotification().then(result => {
        console.log("xxxx");
        console.log(result.data);
    });

    console.log("sending notification",firebaseSendNotification);

})