const mongodb = require('mongodb');
const express = require('express');
const exphbs = require('express-handlebars');

// Create an Express application
const app = express();

// Set up Handlebars as the view engine with '.hbs' file extension and 'main' as the default layout
app.engine('hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main'
}));
app.set('view engine', 'hbs');

// Serve static files from the 'public' directory (e.g., CSS, JavaScript, images)
app.use(express.static('public'));

// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: true }));

// Helper function to connect to MongoDB and get the 'Recipes' collection
async function getCollection() {
    const client = new mongodb.MongoClient("mongodb://localhost");
    await client.connect();
    const db = client.db("RecipesDB");
    return db.collection("Recipes");
}

// Home route: Fetch all recipes and render the home page
app.get('/', async (req, res) => {
    try {
        // Get the 'Recipes' collection
        const collection = await getCollection();
        
        // Fetch all recipes from the collection
        const recipes = await collection.find().toArray();
        
        // Render the home page with the list of recipes
        res.render('home', { recipes });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Route to render the form for creating a new recipe
app.get('/Recipes/create', (req, res) => {
    res.render('create');
});

// Route to handle form submission for creating a new recipe
app.post('/Recipes/create', async (req, res) => {
    const { Name, Summary, Description, Image } = req.body;
    try {
        // Get the 'Recipes' collection
        const collection = await getCollection();
        
        // Insert the new recipe into the collection
        await collection.insertOne({ Name, Summary, Description, Image });
        
        // Redirect to the home page after creation
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Route to view a specific recipe by its ID
app.get('/Recipes/:id', async (req, res) => {
    const _id = new mongodb.ObjectId(req.params.id);
    try {
        // Get the 'Recipes' collection
        const collection = await getCollection();
        
        // Find the recipe by its ID
        const recipe = await collection.findOne({ _id });
        
        // Render the details page if the recipe is found
        if (recipe) {
            res.render('details', { recipe });
        } else {
            res.status(404).send('Recipe not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Route to render the form for editing a specific recipe
app.get('/Recipes/:id/edit', async (req, res) => {
    const _id = new mongodb.ObjectId(req.params.id);
    try {
        // Get the 'Recipes' collection
        const collection = await getCollection();
        
        // Find the recipe by its ID
        const recipe = await collection.findOne({ _id });
        
        // Render the edit page with the recipe data if found
        if (recipe) {
            res.render('edit', { recipe });
        } else {
            res.status(404).send('Recipe not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Route to handle form submission for editing a specific recipe
app.post('/Recipes/:id/edit', async (req, res) => {
    const _id = new mongodb.ObjectId(req.params.id);
    const updatedRecipe = {
        Name: req.body.Name,
        Summary: req.body.Summary,
        Description: req.body.Description
        // The Image property is intentionally omitted
    };
    try {
        // Get the 'Recipes' collection
        const collection = await getCollection();
        
        // Update the recipe with new data
        const result = await collection.updateOne({ _id }, { $set: updatedRecipe });
        
        // Redirect to the recipe details page if modified
        if (result.modifiedCount > 0) {
            res.redirect(`/Recipes/${_id}`);
        } else {
            res.status(404).send('Recipe not found or not modified');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Route to render the delete confirmation page for a specific recipe
app.get('/Recipes/:id/delete', async (req, res) => {
    const _id = new mongodb.ObjectId(req.params.id);
    try {
        // Get the 'Recipes' collection
        const collection = await getCollection();
        
        // Find the recipe by its ID
        const recipe = await collection.findOne({ _id });
        
        // Render the delete confirmation page if the recipe is found
        if (recipe) {
            res.render('delete', { recipe });
        } else {
            res.status(404).send('Recipe not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Route to handle the deletion of a specific recipe
app.post('/Recipes/:id/delete', async (req, res) => {
    const _id = new mongodb.ObjectId(req.params.id);
    try {
        // Get the 'Recipes' collection
        const collection = await getCollection();
        
        // Delete the recipe from the collection
        const result = await collection.deleteOne({ _id });
        
        // Redirect to the home page after successful deletion
        if (result.deletedCount > 0) {
            res.redirect('/');
        } else {
            res.status(404).send('Recipe not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Start the server and listen on port 8000
app.listen(8000, () => {
    console.log("http://localhost:8000/");
});
