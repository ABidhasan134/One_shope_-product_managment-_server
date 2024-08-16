const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
// console.log(process.env.DB_USER)
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.il352b3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Middleware
app.use(express.json());
app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );


app.get('/', (req, res) => {
    res.send("One shope is open");
});

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        const database = client.db("OneShope");
        const productsCollection = database.collection("products");

        app.get("/products",async(req,res)=>{
            const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
            const pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 items per page

            // Fetch all products
            const allProducts = await productsCollection.find().toArray();
            
            // Calculate pagination details
            const totalProducts = allProducts.length;
            const totalPages = Math.ceil(totalProducts / pageSize);
            const paginatedProducts = allProducts.slice((page - 1) * pageSize, page * pageSize);
            // console.log("Here is the all products",paginatedProducts.length)

            // Send paginated products and total pages
            // res.send(paginatedProducts);
            res.json({
                result: paginatedProducts,
                totalPages,
                currentPage: page,
                totalProducts
            });
        })

        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
    }
}

run().catch(console.log);

app.listen(port, () => {
    console.log(`One shope is open on port ${port}`);
});