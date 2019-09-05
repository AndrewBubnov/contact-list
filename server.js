const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const compression = require('compression');
const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://AndrewBubnov:acnot88_0175A@cluster0-shard-00-00-edszp.mongodb.net:27017,cluster0-shard-00-01-' +
    'edszp.mongodb.net:27017,cluster0-shard-00-02-edszp.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true';
const PORT = process.env.PORT || 3000;
const table = 'contacts'
let currentDB;
const addFields = ['firstName', 'lastName', 'phone', 'cellPhone', 'address', 'fullName', 'edited'];
const editFields = ['_id','firstName', 'lastName', 'phone', 'cellPhone', 'address', 'fullName', 'edited'];
const letters = /[a-zA-Z]+/;
const phoneNumber = /^\+?[0-9]{10}/

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(compression());
app.use(express.static(__dirname + '/client/app/'));


const addContact = (req, res) => {
            currentDB.collection(table).insertOne(req.body, (err, result) => {
                if (err) res.status(503).send('An error recording to DB occurs');
                else res.send(req.body);
            });
}

const editContact = (req, res) => {
    currentDB.collection(table).updateOne({_id: mongodb.ObjectID(req.body._id)}, { $set: req.body }, (err, result) => {
        if (err) res.status(503).send('An error editing record in DB occurs');
        else res.send(req.body)
    })
}

const validation = (req, res, fn) => {
    const keys = Object.keys(req.body)
    if (keys.every(item => addFields.includes(item)) || keys.every(item => editFields.includes(item))) {
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
        const contacts = await currentDB.collection(table).find().toArray();
        res.send(contacts);
    } catch (error) {
        res.status(503).send("Something wrong's happened on server. Please reload the page")
    }
})

app.post('/contacts/add', (req, res) => {
    validation(req, res, addContact)
});

app.put('/contacts/edit', (req, res) => {
    validation(req, res, editContact)
});

app.delete('/contacts/delete/:id', (req, res) => {
    currentDB.collection(table).deleteOne({_id: mongodb.ObjectID(req.params.id)}, (err, result) => {
        if (err) res.status(503).send('An error deleting record in DB occurs')
        res.status(200).send(req.params.id)
    });
})

MongoClient.connect(url, {useNewUrlParser: true}, function(err, db) {
    if (err) throw Error;
    console.log("Connected correctly to DB server");
    currentDB = db.db("cluster0");
    app.listen(PORT, () => console.log(`Server started on ${PORT} port`));

});
