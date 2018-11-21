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
    var today = new Date();
    if(neg_days_delta != 0){
        today.setDate(today.getDate() - neg_days_delta);
    }
    var dd = today.getDate();

    var mm = today.getMonth()+1; 
    var yyyy = today.getFullYear();
    if(dd<10) {
        dd='0'+dd;
    } 
    if(mm<10) {
        mm='0'+mm;
    }
    var mmddyyyy = mm+''+dd+''+yyyy
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

/* app */
const app = express();
app.get('/neighborhoods', function(req, res){
    rp(n_opts).then(function(neighborhoods){
            console.log(neighborhoods);
            res.send(neighborhoods);
    }).catch(function(err) {
        console.log(err);
    });
});
app.get('/activities', function(req, res){
    rp(a_opts).then(function(neighborhoods){
            console.log(neighborhoods);
            res.send(neighborhoods);
    }).catch(function(err) {
        console.log(err);
    });
});
app.get('/events/:from?/:to?/:limit?', function(req, res){
    if(typeof(req.params['from']) != 'undefined' && typeof(req.params['from']) != 'undefined'){
       e_opts['body']['date_from'] = req.params['from']; 
       e_opts['body']['date_to'] = req.params['to'];
    }
    rp(e_opts).then(function(events){
        console.log(req.params);
        if(typeof(req.params['limit']) != 'undefined'){
            console.log('with limit');
            console.log(req.params['limit']);
            res.send(events.slice(0,parseInt(req.params['limit'])));
        } else {
            console.log('no limit');
            res.send(events);
        }
    }).catch(function(err){
        console.log(err);
    });
});
app.listen(port, () => console.log(`listening on port ${port}`));
