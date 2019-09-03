const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://AndrewBubnov:acnot88_0175A@cluster0-shard-00-00-edszp.mongodb.net:27017,cluster0-shard-00-01-' +
    'edszp.mongodb.net:27017,cluster0-shard-00-02-edszp.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true';
const PORT = 3000;
let currentDB;
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(compression());

app.get('', async (req, res) => {
    const contacts = await currentDB.collection('contacts').find().toArray()
    res.send(JSON.stringify(contacts));
})

app.post('/api', (req, res) => {
    currentDB.collection('contacts').insertOne(req.body, (err, result) => {
        if (err) console.log(err);
        console.log('result = ', result)
    });
    res.send(JSON.stringify({status: 'Ok'}));

    // currentDB.collection('passwords').find().toArray(function(err, collArray){
    //     if (err) console.log(err);
    //     else {
    //         if (collArray.map(item => item.login).includes(req.body.login)) {
    //             res.send(JSON.stringify({status: 'Reject'}));
    //         }
    //         else {
    //             const newClient = {
    //                 login: req.body.login,
    //                 password: req.body.password,
    //             };
    //             currentDB.collection('passwords').insertOne(newClient, (err, result) =>{
    //                 if (err) console.log(err);
    //             });
    //             res.send(JSON.stringify({status: 'Ok'}));
    //         }
    //     }
    // });
});



MongoClient.connect(url, {useNewUrlParser: true}, function(err, db) {
    if (err) throw Error;
    console.log("Connected correctly to DB server");
    currentDB = db.db("cluster0");
    app.listen(PORT, () => console.log(`Server started on ${PORT} port`));

});
// exports.api = functions.https.onRequest(app);