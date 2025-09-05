import dotenv from 'dotenv'
dotenv.config();

export function sendWebhookNotification(data) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = data;

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch(`${process.env.URL_N8N_WEBHOOK}`, requestOptions)
        .catch(error => console.log('error', error));
}

export function InsertBigQuery(data){

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: data,
                    redirect: 'follow'
                };
    
    fetch("https://updatenotion-31715056154.me-west1.run.app", requestOptions)
                    .catch(error => console.log('error', error));
}