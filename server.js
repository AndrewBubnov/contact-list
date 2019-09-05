const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://AndrewBubnov:acnot88_0175A@cluster0-shard-00-00-edszp.mongodb.net:27017,cluster0-shard-00-01-' +
    'edszp.mongodb.net:27017,cluster0-shard-00-02-edszp.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true';
const PORT = process.env.PORT || 3000;
let currentDB;
const fields = ['firstName', 'lastName', 'phone', 'cellPhone', 'address', 'fullName'];
const letters = /[a-zA-Z]+/;
const phoneNumber = /^\+?[0-9]{10}/
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(compression());
app.use(express.static(__dirname + '/client/app/'));


const addContact = (req, res) => {
            currentDB.collection('contacts').insertOne(req.body, (err, result) => {
                if (err) res.status(503).send('An error recording to DB occurs');
                res.send(req.body);
            });
}

const validation = (req, res, fn) => {
    if (JSON.stringify(Object.keys(req.body)) === JSON.stringify(fields)) {
        if (req.body.firstName.match(letters) && req.body.lastName.match(letters)) {
            if (req.body.phone.match(phoneNumber) && req.body.cellPhone.match(phoneNumber)){
                fn(req, res)
            } else {
                res.status(503).send('Please enter phone and cell phone in valid format')
            }
        } else {
            res.status(503).send('First name and last name fields should consist of Latin alphabet letters only')
        }
    }
}

app.get('/contacts', async (req, res) => {
    try {
        const contacts = await currentDB.collection('contacts').find().toArray();
        res.send(contacts);
    } catch (error) {
        console.log(error);
    }
})

app.post('/contacts/add', (req, res) => {
    // if (JSON.stringify(Object.keys(req.body)) === JSON.stringify(fields)) {
    //     if (req.body.firstName.match(letters) && req.body.lastName.match(letters)) {
    //         if (req.body.phone.match(phoneNumber) && req.body.cellPhone.match(phoneNumber)){
    //             addContact(req,res)
    //         } else {
    //             res.status(503).send('Please enter phone and cell phone in valid format')
    //         }
    //     } else {
    //         res.status(503).send('First name and last name fields should consist of Latin alphabet letters only')
    //     }
    // }
    validation(req, res, addContact(req, res))

});

app.put('/contacts/edit', (req, res) => {
    const set = {}
    const newKeys = Object.keys(req.body).filter(item => item.substring(0, 2) !== '$$' && item.substring(0, 1) !== '_')
    newKeys.forEach(item => set[item] = req.body[item])
    currentDB.collection('contacts').updateOne({_id: mongodb.ObjectID(req.body._id)}, { $set: set }, (err, result) => {
        if (err) res.sendStatus(503);
        res.sendStatus(200)
    })
});

app.delete('/contacts/delete/:id', (req, res) => {
    currentDB.collection('contacts').deleteOne({_id: mongodb.ObjectID(req.params.id)}, (err, result) => {
        if (err) res.sendStatus(503);
        res.sendStatus(200)
    });
})

MongoClient.connect(url, {useNewUrlParser: true}, function(err, db) {
    if (err) throw Error;
    console.log("Connected correctly to DB server");
    currentDB = db.db("cluster0");
    app.listen(PORT, () => console.log(`Server started on ${PORT} port`));

});
