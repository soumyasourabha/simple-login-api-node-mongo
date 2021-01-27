const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    username: { type: String, unique: true, required: true },
    hash: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    createdDate: { type: Date, default: Date.now },
    roles : {type:Array,required:true},
    ip : {type:String,required:false},
    logInDtm : {type:Date,required:false},
    logOutDtm : {type:Date,required:false},
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', schema);