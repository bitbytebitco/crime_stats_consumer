const rp = require('request-promise');
const express = require('express');
const bodyparser = require('body-parser');
const app = express();
app.use(bodyparser.json({
  strict: false,
}));
const swaggerJSDoc = require('swagger-jsdoc');
 
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
const process_neighborhoods = async function(res) {
    let neighborhoods;
    try {
        neighborhoods = await rp(n_opts);   
    } catch(e) {
        console.log(e);
    }
  	res.setHeader('Content-Type', 'application/json');
    return res.send(neighborhoods);
}
const process_activities = async function(res) {
    let activities;
    try {
        activities = await rp(a_opts);
    } catch(e) {
        console.log(e);
    }
  	res.setHeader('Content-Type', 'application/json');
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
  	res.setHeader('Content-Type', 'application/json');
    if(typeof(req.query['limit']) != 'undefined'){
        console.log('with limit');
        console.log(req.query['limit']);
        return res.send(events.slice(0,parseInt(req.query['limit'])));
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

/**
 * @swagger
 * /neighborhoods:
 *   get:
 *     summary: Get all neighborhoods  
 *     description: Get all neighborhoods, used for categorizing crime events.
 *     tags:
 *       - Neighborhoods 
 *     responses:
 *       200:
 *         description: Returns a json array of neighborhoods 
 *         content:
 *           application/json: 
 *             schema:
 *               type: array 
 *               items: 
 *                 type: string 
 *             example:
 *               - "Ancarows Landing" 
 *               - "Beaufont" 
 *               - "Belle And Mayo Islands" 
 */
app.get('/neighborhoods', function(req, res){
    process_neighborhoods(res);
});

/**
 * @swagger
 * /activities:
 *   get:
 *     summary: Get all activities  
 *     description: Get all activity types used for categorizing crime events.
 *     tags:
 *       - Activities 
 *     responses:
 *       200:
 *         description: Returns a json array of neighborhoods 
 *         content:
 *           application/json: 
 *             schema:
 *               type: array 
 *               items: 
 *                 type: string 
 *             example:
 *               - "911" 
 *               - "Abandoned Vehicle" 
 *               - "Accidental Death" 
 *
 */
app.get('/activities', function(req, res){
    process_activities(res);
});
/**
 * @swagger
 * /events/{date_from}/{date_to}:
 *   get:
 *     summary: List all the crime events 
 *     description: Returns a list of crime events, selected by date range, optionally limited  
 *     tags:
 *       - Events 
 *     parameters:
 *       - in: path 
 *         name: date_from 
 *         description: a date in `mmddyyyy` format
 *         type: string
 *         required: true 
 *         schema:
 *           type: string
 *           example: 11012018 
 *       - in: path 
 *         name: date_to 
 *         description: a date in `mmddyyyy` format
 *         type: string
 *         required: true 
 *         schema:
 *           type: string
 *           example: 11052018 
*       - in: query 
 *         name: limit 
 *         description: response size limiter
 *         type: integer 
 *         required: false 
 *         schema:
 *           type: integer 
 *     responses:
 *       200:
 *         description: List of json array of crime events json objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array 
 *               items:
 *                 type: object 
 *                 description: crime events 
 *                 properties: 
 *                     activity: 
 *                       type: string 
 *                       example: DRUG/NARCOTIC VIOLATION 
 *                     address: 
 *                       type: string 
 *                       example: 2855 Broad Rock Blvd, Richmond, Virginia, 23224 
 *                     event_date: 
 *                       type: object
 *                       properties:
 *                         $date: 
 *                           type: integer 
 *                           example: 1542672000000 
 *                     loc: 
 *                       type: object 
 *                       properties:
 *                         coordinates: 
 *                           type: array 
 *                           example: [-77.48044627264343, 37.478520560210626] 
 *                     neighborhood: 
 *                       type: string 
 *                       example: SOUTH GARDEN 
 *                     _id: 
 *                       type: string 
 *                       example: 20181120-0772 
 *				        
 */
app.get('/events/:from?/:to?', function(req, res){
    process_events(req, res);
});

// -- setup up swagger-jsdoc --
const swaggerDefinition = {
  info: {
    title: 'Crime Stats API',
    version: '1.0.0',
    description: 'Simple HTTP Application to consume private Crime Stats API.',
  },
  host: 'localhost:3000',
  basePath: '/',
};
const options = {
  swaggerDefinition,
  docExpansion:"full",
  apis: ['index.js'],
};
const swaggerSpec = swaggerJSDoc(options);
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.get('/docs', (req, res) => {
  res.sendFile(__dirname + '/redoc.html');
});

app.listen(port, () => console.log(`listening on port ${port}`));
