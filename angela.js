// ***** *** Require Packages: *** *****
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
 
 
const app = express();
 
app.set('view engine', 'ejs');
 
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
 
// *** Create a New Database inside MongoDB via Connecting mongoose: ***
mongoose.connect("mongodb://localhost:27017/todolistDB");
// mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true}); // ==> use this if deprect a warning 
 
// *** Create a Schema: ***
const itemsSchema = {
  name: String
};
 
// *** Create a Model: (usually Capitalized) ***
const Item = mongoose.model("Item", itemsSchema);
 
// *** Create a Mongoose Documents: ***
const item1 = new Item({
  name: "Welcome to your todolist!"
});
 
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
 
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});
 
const defaultItems = [item1, item2, item3];
 
// *** Create a list Schema: ***
const listSchema = {
  name: String,
  items: [itemsSchema]
};
 
// *** Create a list Model: ***
const List = mongoose.model("list", listSchema);
 
app.get("/", function(req, res) {
  // *** Mongoose find() ***
  Item.find({}, function(err, foundItems){
 
    if (foundItems.length === 0) {
      // *** Mongoose insertMany() ***
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        }
        else{
          console.log("Successfully saved default items to databse.");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }   
  });
});
 
// *** Create a custom parameters Route: ***
app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
 
  List.findOne({name: customListName}, function(err, foundList){
 
    if (!err) {
      if (!foundList) {
        // *** Create a new list: ***
        // *** Create a new Mongoose Document: ***
        const list = new List({
          name: customListName,
          items: defaultItems
        });
 
        list.save();
        res.redirect("/" + customListName);
      }
      else {
        // *** Show an existing list: ***
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
 
  });
  
});
 
app.post("/", function(req, res){
  // *** Adding a New Item: ***
  const itemName = req.body.newItem;
  const listName = req.body.list.trim();
 
  const item = new Item({
    name: itemName
  });
 
  if (listName === "Today"){
    // *** Save item to mongoose: ***
    item.save();
    // *** render item to home page: ***
    res.redirect("/");
  }
  else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});
 
app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox.trim();
  const listName = req.body.listName.trim();
 
  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        // mongoose.connection.close();
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  }
  else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }
});
 
 
app.get("/about", function(req, res){
  res.render("about");
});
 
app.listen(3000, function() {
  console.log("Server started on port 3000");
});