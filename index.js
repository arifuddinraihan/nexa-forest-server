const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express()
const port = process.env.PORT || 5000

// middle ware
app.use(cors());
app.use(express.json())
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.tsvgbta.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const serviceCollection = client.db('nexaForestDB').collection('services')
        const reviewCollection = client.db('nexaForestDB').collection('reviews')
        //    console.log(serviceCollection)
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const services = await cursor.limit(3).toArray()
            res.send(services)
        })
        app.get('/all-services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const allservices = await cursor.toArray()
            res.send(allservices)
        })
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query)
            res.send(service)
        })
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review)
            res.send(result)
        })
        app.get('/reviews', async (req, res) => {
            const query = {}
            const cursor = reviewCollection.find(query).sort({ "reviewTime": -1, "_id": 1 })
            const allReviews = await cursor.toArray()
            res.send(allReviews)
        })
    }
    finally {

    }
}
run().catch(err => console.error(err))



app.get('/', (req, res) => {
    res.send("Nexa Forest server is running")
})

app.listen(port, () => {
    console.log(`Nexa Forest Server running on port: ${port}`)
})