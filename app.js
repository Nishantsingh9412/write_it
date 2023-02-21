//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://nishantsingh9412ns:IntmyxPFNinkthjh@cluster0.uelmcqh.mongodb.net/todolistDB", { useNewUrlParser: true });


// ------------------------------------------- Schema one ------------------------------------------------

const itemSchema = new mongoose.Schema({
  title: String
});


const Item = mongoose.model('item', itemSchema);


////------------------------------- Schema two ----------------------------------------------------
const list_schema = {
  name: String,
  d_item: [itemSchema],
};

const list_model = mongoose.model("dynamic", list_schema);


app.get("/:list_from_url", function (req, res) {
  const dynamic_route = _.capitalize(req.params.list_from_url);
  list_model.findOne({name:dynamic_route},function(err,result){
    if(!err){
      if(!result){
        const newList = new list_model({
          name: dynamic_route,
          d_item:ItemsArr
        });
        newList.save();
        res.redirect("/"+dynamic_route);
      }else{
        res.render("list",{listTitle: result.name, newListItems:result.d_item});
      }
    }
   
  });
  
});
// ---------------------------------->>>>>>  ItemsList <<<<<<---------------------------------------

const item1 = new Item(
  {
    title: "Task 1"
  });

const item2 = new Item({
  title: "Development karenge"
});
const item3 = new Item({
  title: "Party me jayenge  "
});

const ItemsArr = [item1, item2, item3];
// item1.save();

// Item.insertMany(ItemsArr,function(error){
//   if(error){
//     console.log(error);
//   }else{
//     console.log("----------------- >>>>   Insertion Done   <<<<<<<<--------------------");
//   }
// })
// raman.save();
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

Item.find({ title: 'DSA' }, { title: "Development karenge" }, function (error, results) {
  if (error) {
    console.log(error);
  } else {
    console.log(results);
  }
});




app.get("/", function (req, res) {
  // const day = date.getDate();
  // res.render()

  Item.find({}, function (err, results) {
    if (results.length === 0) {
      Item.insertMany(ItemsArr, function (error) {
        if (error) {
          console.log(error);
        } else {     
          console.log("----------------- >>>>   Insertion Done   <<<<<<<<--------------------");
        }
      });
      res.redirect("/");
      // res.render("list", {listTitle: "day", newListItems:results});
    } else {
      Item.find({}, function (err, results) {
        res.render("list", { listTitle: "Today", newListItems: results });

      });
    }
  });

});



app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    title: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    list_model.findOne({name:listName},function(err,foundList){
      if(err){
        console.log(err);
      }else{
      console.log(listName);
      foundList.d_item.push(item);
      foundList.save();
      res.redirect("/" + listName);
      }
    });
  }

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});


app.post("/delete", function (req, res) {
  const del = req.body.checkbox_name;
  const list_from_heading = req.body.listName;
  console.log(list_from_heading);

  if(list_from_heading === "Today"){
    console.log(` This is deleted checkbox name  ${del} `);
    Item.findByIdAndRemove(del, function (error) {
      if (!error) {
        console.log("----------->>>>> Deletion Done <<<<<<<----------- ");
        res.redirect("/");
      }
    });
  }else{
    list_model.findOneAndUpdate({name:list_from_heading},{$pull:{d_item:{_id:del}}},function(err,result){
      if(!err){
        res.redirect("/"+list_from_heading);
      }
    });
  }

    // else{
    //   console.log("------------------------ Deletion Done ############################### ");
    //   console.log(del);
    //   // res.redirect("/");
    // }
});
// });

// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "Work List", newListItems: workItems });
// });

// const itemsArr2 = [item1,item2,item3];



app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
