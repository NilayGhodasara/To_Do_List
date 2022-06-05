const express = require("express");

const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set("view engine","ejs");

app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://Nilay_Ghodasara:Nilay%402508@cluster0.qdlox.mongodb.net/to_do_listDB",{useNewUrlParser: true});

const itemsSchema={
    name: String
};

const item = mongoose.model("item",itemsSchema);

const item1 = new item({
    name : "Welcome to to_do_list!"
});

const item2 = new item({
    name : "Hit the + button to add a new item."
});

const defaultitems = [item1,item2];

const listSchema = {
    name: String,
    item: [itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/",function(req,res){
    item.find({},function(err,founditems){
    
    if(founditems.length==0)
    {
        item.insertMany(defaultitems,function(err){
            if(err)
                console.log(err);
            else
                console.log("Successfully added default Items to Database.");
        });
        res.redirect("/");
    }
    res.render("list",{KindOfDay: "Today",newitems: founditems});
    });
});

app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name:customListName},function(err,foundlist){
        if(!err)
        {
            if(!foundlist)
            {
                const list = new List({
                    name: customListName,
                    item:  defaultitems
                });
                // console.log("List Created");
                list.save();
                res.redirect("/"+customListName);
            }
            else
            {
                res.render("list",{KindOfDay: foundlist.name,newitems: foundlist.item});
            }
        }
    });

});

app.post("/",function(req,res){
    const x=req.body.item;
    const listname = req.body.list;
    const newitem = new item({
        name: x
    });
    
    if(listname=="Today"){
        item.insertMany(newitem,function(err){
            if(err)
                console.log(err);
        });
        res.redirect("/");
    }
    else{
        List.findOne({name:listname},function(err,foundlist){
            foundlist.item.push(newitem);
            foundlist.save();
            res.redirect("/"+listname);
        });
    }
});

app.post("/delete",function(req,res){
    const id=req.body.checkbox;
    const listname = req.body.listname;

    if(listname=="Today"){
        item.findByIdAndDelete(id,function(err){
            if(!err)
                console.log("Successfully Deleted Selected Item.");
            res.redirect("/");
            });
        }
        else{
            List.findOneAndUpdate({name: listname},{$pull: {item: {_id:id}}},function(err,foundlist){
            if(!err)
                console.log("Successfully Deleted Selected Item.");
            res.redirect("/"+listname);
        });
    }
});

app.listen(3000,function(){
    console.log("Server is running on port: 3000");
});