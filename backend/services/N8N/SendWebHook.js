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

    fetch("http://192.168.100.100:5678/webhook/4a969261-b7d9-42a8-9f5c-47ab967a666c", requestOptions)
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