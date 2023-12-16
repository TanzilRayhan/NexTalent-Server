const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hlcvkxo.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
  try {

    const jobCollection = client.db("jobDB").collection("jobs");
    const bidCollection = client.db("jobDB").collection("bids");

    //jobs
    app.get("/jobs", async (req, res) => {
      const cursor = jobCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post("/jobs", async (req, res) => {
      const job = req.body;
      const result = await jobCollection.insertOne(job);
      console.log(result);
      res.send(result);
    });

    app.get("/jobs/:id", async (req, res) => {
      try {
        const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await jobCollection.findOne(query);
      res.send(result);
      } catch (error) {
        return res.send({error: true, message: error.message})
      }
      
    })

    app.delete("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await jobCollection.deleteOne(query);
      res.send(result);
    })

    app.put("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedJobs = req.body;
      const jobs = {
        $set: {
          email: updatedJobs.email,
          jobTitle: updatedJobs.jobTitle,
          category: updatedJobs.category,
          deadline: updatedJobs.deadline,
          minPrice: updatedJobs.minPrice,
          maxPrice: updatedJobs.maxPrice,
          description: updatedJobs.description
        }
      }
      const result = await jobCollection.updateOne(filter, jobs, options);
      res.send(result);
    })


    //bids
    app.get("/bids", async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const cursor = bidCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })
    app.post("/bids", async (req, res) => {
      const bid = req.body;
      const result = await bidCollection.insertOne(bid);
      console.log(result);
      res.send(result);
    });
    app.delete("/bids/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await bidCollection.deleteOne(query);
      res.send(result);
    })
    app.patch("/bids/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updateBid = req.body;
      console.log(updateBid);
      const bids = {
        $set: {
          status: updateBid.status
        }
      }
      const result = await bidCollection.updateOne(filter, bids);
      res.send(result);
    })

  } finally {

  }
}
run().catch(console.dir);


// Ping route
app.get('/', (req, res) => {
  res.send('NexTalent server is running');
});

// Start server
app.listen(port, () => {
  console.log(`NexTalent is running on port: ${port}`);
});