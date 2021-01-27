const config = require('config.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const User = db.User;

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function authenticate({ username, password, role , logInDtm, ip}) {
    const user = await User.findOne({ username });
    if (user && bcrypt.compareSync(password, user.hash)) {
        if(user.roles.filter(roles => roles == role).length > 0){
            await User.updateOne({ username : username },{ $set: { logInDtm : logInDtm , ip : ip} });
            const { hash, ...userWithoutHash } = user.toObject();
            const token = jwt.sign({ sub: user.id }, config.secret);
            return {
                ...userWithoutHash,
                token
            };
        }else{
            throw 'Username "' + username + '" is Not Assigned For ' + role + ' Role';
        } 
    }
}

async function getAll() {
    return await User.find().select('-hash');
}

async function getById(id) {
    return await User.findById(id).select('-hash');
}

async function create(userParam,res) {
    // validate

    const userInfo = await User.findOne({ username: userParam.username });
    if (userInfo) {
        if(userInfo.roles.filter(role => role == userParam.roles).length > 0){
            throw 'Username "' + userParam.username + '" is Already Assigned For ' + userParam.roles + ' Role';
        }else{
            await User.updateOne({ username: userParam.username },{$addToSet : { roles : userParam.roles } });  
            res["message"] = 'Username "' + userParam.username + '" is Assigned For ' + userParam.roles + ' Role'; 
        }
    }
    else{
        const user = new User(userParam);

        // hash password
        if (userParam.password) {
            user.hash = bcrypt.hashSync(userParam.password, 10);
        }
    
        // save user
        await user.save();
        res["message"] = 'Registration successful';
        
    }
}
async function update(id, userParam) {
    const user = await User.findById(id);

    // validate
    if (!user) throw 'User not found';
    if (user.username !== userParam.username && await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    // hash password if it was entered
    if (userParam.password) {
        userParam.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // copy userParam properties to user
    Object.assign(user, userParam);

    await user.save();
}

async function _delete(id) {
    await User.findByIdAndRemove(id);
}