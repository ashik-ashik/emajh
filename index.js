const express = require("express");
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5500;
const ObjectId = require("mongodb").ObjectId;
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.muk27.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const run = async () => {
  try{

    await client.connect();
    const database = client.db("ema_jhon_superMarket");
    const productCollection = database.collection("products");
    const orderColloction = database.collection("orders");

    // get all products
    app.get("/products", async (req, res) => {
      const cursor = productCollection.find({});
      const count = await cursor.count();
      const page = parseInt(req.query.page);
      const size = req.query.size;
      let products;
      if(page){
        products = await cursor.skip(page * size).limit(parseInt(size)).toArray();
      }else{
        products = await cursor.limit(15).toArray();
      };

      res.json({count, products});
    });

    // post product by stored cart id
    app.post("/products/carts", async(req, res) => {
      const keys = req.body;
      const query = {key : {$in : keys}};
      const products = await productCollection.find(query).toArray();
      res.json(products);
    });

    // order management
    app.post ("/orders", async (req, res) => {
      const orderDetail = req.body;
      const result = await orderColloction.insertOne(orderDetail);
      res.json(result);
    })

  }finally{
    // await client.close()
  }
};
run().catch(console.dir);



app.get("/", (req, res)=> {
  res.send("This is working");
});


app.listen(port, ()=> {
  console.log("Express Server is Working on", port);
});