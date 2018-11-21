const rp = require('request-promise');
const express = require('express');

const port = 3000;

/* Crime API Request */
const a_opts = {
    uri: 'https://diluo.org/getActivities',
    method: 'GET',
    //json: true
}
const n_opts = {
    uri: 'https://diluo.org/getNeighborhoods',
    method: 'GET',
    //json: true
}
function date_str(neg_days_delta) {
    const today = new Date();
    if(neg_days_delta != 0){
        today.setDate(today.getDate() - neg_days_delta);
    }
    const dd = today.getDate();

    const mm = today.getMonth()+1; 
    const yyyy = today.getFullYear();
    if(dd<10) {
        dd='0'+dd;
    } 
    if(mm<10) {
        mm='0'+mm;
    }
    const mmddyyyy = mm+''+dd+''+yyyy
    console.log(mmddyyyy);
    return mmddyyyy;
}
const e_opts = {
    uri: 'https://diluo.org/getEvents',
    method: 'POST',
    json: true,
    body: {
        date_to:date_str(0),
        date_from:date_str(2),
        neighborhoods:[],
        activities:[],
    }
}

/* application logic */
const app = express();
const process_neighborhoods = async function(res) {
    let neighborhoods;
    try {
        neighborhoods = await rp(n_opts);   
    } catch(e) {
        console.log(e);
    }
    return res.send(neighborhoods);
}
const process_activities = async function(res) {
    let activities;
    try {
        activities = await rp(a_opts);
    } catch(e) {
        console.log(e);
    }
    return res.send(activities);
}
const process_events = async function(req, res){
    let events;
    let e_ops = update_req_opts(req);
    try {
        events = await rp(e_opts);
    } catch(e) {
        console.log(e);
    }
    console.log(req.params);
    if(typeof(req.params['limit']) != 'undefined'){
        console.log('with limit');
        console.log(req.params['limit']);
        return res.send(events.slice(0,parseInt(req.params['limit'])));
    } else {
        console.log('no limit');
        return res.send(events);
    }
}
const update_req_opts = async function(req){
    if(typeof(req.params['from']) != 'undefined' && typeof(req.params['from']) != 'undefined'){
       e_opts['body']['date_from'] = req.params['from']; 
       e_opts['body']['date_to'] = req.params['to'];
    }
    return e_opts;
}

/* routes */
app.get('/neighborhoods', function(req, res){
    process_neighborhoods(res);
});
app.get('/activities', function(req, res){
    process_activities(res);
});
app.get('/events/:from?/:to?/:limit?', function(req, res){
    process_events(req, res);
});
app.listen(port, () => console.log(`listening on port ${port}`));
