var express = require('express');
var path = require('path');

var app = express();
var bodyParser = require("body-parser");
var fetch = require('node-fetch');
const CLIENT_ID = "<<CLIENT_ID>>";
const CLIENT_SECRET = "<<CLIENT_SECRENT>>";
const REDIRECT_URI = "http%3A%2F%2Flocalhost%3A3090%2Fconn%2Fcall_back";
const BASE_URL = "https://login.salesforce.com";


let OAUTH_TOKEN = "00Dj0000000HSgP!AREAQJNCcQ6ROWCPo1UdbwmDnhp9IM_avECbxkdUDTxpiqZ_wj9trkWUoPWwJxwAGlV8wKUbmpxP79VBnAH0Ql8mxxQbYRP6";
let OAUTH_CODE = "aPrxHLAg3XMmPXuc139IxRfKJoBuzCYFtNpCN3JS71xV_DF0DVU2Z3xfTsiJ5da29NQyQQRS2g==";
let REFRESH_TOKEN = "5Aep861E3ECfhV22nZ4AgN1ame9bCE6seHPYhYN2vsuq2NzYa.nR2kaQ8sn7KY22O1bX8zz3d0Cj19YRUFVRYqz";
let INSTANCE_URL = "https://dj0000000hsgpeaw-dev-ed.my.salesforce.com";

app.use(bodyParser.urlencoded({ extended: false }));
app.use('/js', express.static('js'));

app.get('/oauth', function(req, res) {
    var url = `${BASE_URL}/services/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&access_type=offline&prompt=consent`;
    res.json({ url });
});

refresh_oauth_token = async() => {
    console.log("In refresh_oauth_token");
    var url = `${BASE_URL}/services/oauth2/token?grant_type=refresh_token&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&refresh_token=${REFRESH_TOKEN}`;
    try {
        let response = await fetch(url, {
            method: "POST",
            headers: { "Content-type": "application/json; charset=UTF-8" }
        });
        const json = await response.json();
        console.log(json);
        OAUTH_TOKEN = json.access_token;
        INSTANCE_URL = json.instance_url;
    } catch (error) {
        console.log(error);
        res.send(error);
    }
}

fetch_oauth_token = async() => {
    console.log("In fetch_oauth_token");
    var url = `${BASE_URL}/services/oauth2/token?grant_type=authorization_code&redirect_uri=${REDIRECT_URI}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${OAUTH_CODE}`;
    try {
        let response = await fetch(url, {
            method: "GET",
            headers: { "Content-type": "application/json; charset=UTF-8" }
        });
        const json = await response.json();
        OAUTH_TOKEN = json.access_token;
        INSTANCE_URL = json.instance_url;
        REFRESH_TOKEN = json.refresh_token;
    } catch (error) {
        console.log(error);
        res.send(error);
    }
};

app.get('/conn/call_back', async(req, res) => {
    var oauth_params = req.query;
    console.log(oauth_params);
    OAUTH_CODE = oauth_params.code;
    console.log(OAUTH_CODE);
    let resp = await fetch_oauth_token();
    await resp;
    res.sendFile('index.html', { root: '.' });

});

app.get('/', function(req, res) {
    res.sendFile('index.html', { root: '.' });
});

app.get('/oauth_info', function(req, res) {
    if (OAUTH_CODE && OAUTH_CODE !== "" && REFRESH_TOKEN && REFRESH_TOKEN !== "") {
        var oauth_info = {
            "OAUTH_TOKEN": OAUTH_TOKEN,
            "OAUTH_CODE": OAUTH_CODE,
            "REFRESH_TOKEN": REFRESH_TOKEN,
            "INSTANCE_URL": INSTANCE_URL
        };
        console.log(oauth_info);
        res.json(oauth_info);
    } else {
        res.json({ "Error": "Please click on OAuth to login" });
    }
});

app.post('/describe', async(req, res) => {
    var input = req.body;
    console.log(input);
    let url = INSTANCE_URL + `/services/data/v53.0/sobjects/Account/describe`;
    console.log("URL - ", url);
    let bearer = `Bearer ` + OAUTH_TOKEN;
    console.log("Bearer - ", bearer);
    try {
        let response = await fetch(url, {
            method: "GET",
            headers: { "Content-type": "application/json; charset=UTF-8", "Authorization": bearer }
        });
        const json = await response.json();
        if (json.fields) {
            const fileds = json.fields;
            //fields to ds attributes
            res.json({ fileds });
        } else {
            let resp = await refresh_oauth_token();
            await resp;
            res.json({ "Error": "Token refreshed, Please click Describe btn again" });
        }
    } catch (error) {
        res.send(error);
    }
});

// post
// check _rs = U,D,I and perform 

app.post('/query', async(req, res) => {
    var input = req.body;
    console.log(input);
    // Sample Platform Query
    // Name='Jeff'
    // Platform Query to SF Query conversion
    // {filter: [{name: {is: "CloudIO"}], limit: 10, offset: 0}
    // SF Column name  = attribute code

    let url = INSTANCE_URL + `/services/data/v42.0/query/?q=SELECT+Id,Name+from+Account`;
    console.log("URL - ", url);
    let bearer = `Bearer ` + OAUTH_TOKEN;
    console.log("Bearer - ", bearer);

    try {
        let response = await fetch(url, {
            method: "GET",
            headers: { "Content-type": "application/json; charset=UTF-8", "Authorization": bearer }
        });
        const json = await response.json();
        if (json.records) {
            const records = json.records;
            res.json({ records });
        } else {
            let resp = await refresh_oauth_token();
            await resp;
            res.json({ "Error": "Token refreshed, Please click Query btn again" });
        }
    } catch (error) {
        console.log(`Error - ${error}`);
        res.send(error);
    }
});

var server = app.listen(3090, function() {
    console.log('Node server is running..');
});