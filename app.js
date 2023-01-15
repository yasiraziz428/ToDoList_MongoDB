//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { getDate, getDay } = require(__dirname + "/date.js");

const app = express();
app.set("view engine", "ejs");
mongoose.set("strictQuery", false);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/ToDoListDB");

const itemSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemSchema);

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema],
});

const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Work on new project",
});

const item2 = new Item({
  name: "Do exercise",
});

const item3 = new Item({
  name: "Study",
});

const itemsArray = [item1, item2, item3];

// Item.insertMany(itemsArray, (err) => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Successfully inserted");
//   }
// });

app.get("/", function (req, res) {
  const items = Item.find({}, (err, result) => {
    if (result.length === 0) {
      Item.insertMany(itemsArray, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully synced");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: result });
    }
  });
});

app.post("/", function (req, res) {
  const item = req.body.newItem;
  const listName = req.body.list;
  console.log(listName, item);

  const newItem = new Item({
    name: item,
  });

  if (listName == "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    Item.find({ name: listName }, (err, foundList) => {
      if (err) {
        console.log(err);
      } else {
        foundList.push(newItem);
        newItem.save();
        res.redirect("/");
      }
    });
  }
});

app.post("/delete", (req, res) => {
  const checkedItem = req.body.check;
  console.log(checkedItem);
  Item.deleteOne({ name: checkedItem }, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Successfully removed!");
    }
  });
  res.redirect("/");
});

// creating new list and save in the db based on what user requested
app.get("/:customListName", (req, res) => {
  const customListName = req.params.customListName;
  List.findOne({ name: customListName }, (err, results) => {
    if (!err) {
      if (!results) {
        // creating a new list
        const list = new List({
          name: customListName,
          items: itemsArray,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        // render the existing list
        res.render("list", {
          listTitle: customListName,
          newListItems: results.items,
        });
      }
    }
  });
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
