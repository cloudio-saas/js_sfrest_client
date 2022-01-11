describe = async(objectName) => {
    let actTitle = document.querySelector('#actionTitle');
    actTitle.innerHTML = "Describe(Account)";
    let container = document.querySelector('#actionData');
    container.innerHTML = "";
    let resp = await fetch("/describe", {
        method: "POST",
        body: { "objectName": objectName }
    }).then(response => response.json()).catch(error => {
        console.log("Error - ", error);
        return error;
    });
    console.log(resp);
    let htmlSegment = `<div class="user">
  <div class="">${JSON.stringify(resp,undefined,2)}</div>
  </div>`;

    //let container = document.querySelector('#actionData');
    container.innerHTML = htmlSegment;

}

var descBtn = document.querySelector('#descBtn');

descBtn.addEventListener('click', async(event) => {
    console.log("In Describe");
    event.preventDefault();
    await describe("Account");
});

query = async(objectName) => {
    let actTitle = document.querySelector('#actionTitle');
    actTitle.innerHTML = "Query(Account)";
    let container = document.querySelector('#actionData');
    container.innerHTML = "";
    let resp = await fetch("/query", {
        method: "POST",
        body: { "objectName": objectName }
    }).then(response => response.json()).catch(error => {
        console.log("Error - ", error);
        return error;
    });
    console.log(resp);
    let htmlSegment = `<div class="user">
    <div class="">${JSON.stringify(resp,undefined,2)}</div>
    </div>`;
    container.innerHTML = htmlSegment;
}

var queryBtn = document.querySelector('#queryBtn');

queryBtn.addEventListener('click', async(event) => {
    console.log("In Query");
    event.preventDefault();
    await query("Account");
});



oauth = async() => {
    let resp = await fetch("/oauth");
    let oauth_json = await resp.json();
    console.log(oauth_json);
    window.location.href = oauth_json.url;
}
var oauthBtn = document.querySelector('#oauthBtn');

oauthBtn.addEventListener('click', async(event) => {
    console.log("In Oauth");
    event.preventDefault();
    await oauth();
});

fetch_oauth_details = async(objectName) => {
    let actTitle = document.querySelector('#actionTitle');
    actTitle.innerHTML = "OAuth";
    let container = document.querySelector('#actionData');
    container.innerHTML = "";
    let resp = await fetch("/oauth_info", {
        method: "GET",
    }).then(response => response.json()).catch(error => {
        console.log("Error - ", error);
        return error;
    });
    console.log(resp);
    let htmlSegment = `<div class="user">
  <div class="">${JSON.stringify(resp,undefined,2)}</div>
  </div>`;
    container.innerHTML = htmlSegment;
}
fetch_oauth_details();