const moongose = require('mongoose');

moongose.connect('mongodb://localhost:27017/personsDB', {useNewUrlParser: true, useUnifiedTopology: true});

const fruitsSchema = new moongose.Schema({
    name: String,
    rating: Number,
    review: String
});
const Fruit = moongose.model("Fruit", fruitsSchema);

const peopleSchema = new moongose.Schema({
    name: String,
    age: Number,
    email: String,
    favourite_fruit: fruitsSchema
});
const User = moongose.model("User", peopleSchema);

// Fruit.insertMany([
//     { name: 'Apple', rating: 5, review: 'sweet'},
//     { name: 'Pear', rating: 2, review: 'soar'},
//     { name: 'mango', rating: 1, review: 'biiter'}
// ]).then(function(){
//     console.log("Data inserted")  // Success
// }).catch(function(error){
//     console.log(error)      // Failure
// });

const pineapple = new Fruit({
    name: "pineapple",
    rating: 9,
    review: "Great"
});
// pineapple.save()

const person1 = new User({
    name: 'Gourav', 
    age: 20, 
    email: 'abibang@gmail.com',
    favourite_fruit: pineapple
});
// person1.save()

const mango = new Fruit({
    name: "mango",
    rating: 10,
    review: "really sweet"
});
mango.save()

// const filter = { name: 'Niharika' };
// update = {favourite_fruit:mango}
const query = User.updateOne(filter, update)


query.exec().then((users) => {
  console.log(users);
}).catch((err) => {
  console.log(err);
});

// User.insertMany([
//     { name: 'Gourav', age: 20, email: 'abibang@gmail.com'},
//     { name: 'Kartik', age: 25, email: 'awan@gmail.com'},
//     { name: 'Niharika', age: 30, email: 'brandon@gmail.com'}
// ]).then(function(){
//     console.log("Data inserted")  // Success
// }).catch(function(error){
//     console.log(error)      // Failure
// });

// Find all users who are over 25 years old
// const query = User.find({ age: { $gt: 20 } });

// const query = User.find({ });

// query.exec().then((users) => {
//     users.forEach(function(users){
//         console.log(users.name)
//     })
// //   console.log(users);
// }).catch((err) => {
//   console.log(err);
// });


// const filter = { name: 'Gourav' };
// const update = { age: 60 };

// // const query = User.findOneAndUpdate(filter, update , { new: true },)
// const query = User.deleteOne(filter)

// query.exec().then((users) => {
//   console.log(users);
// }).catch((err) => {
//   console.log(err);
// });



// Backup codes
// app.get("/", function(req, res){

//   const query = Post.find({ });

//   query.exec().then((posts) => {
//       res.render('home', {StartingContent:homeStartingContent, posts:posts});
//       }).catch(function(error){
//         console.log(error)      // Failure
//       });
    
// });
