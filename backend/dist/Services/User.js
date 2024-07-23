"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
exports.getAllUsers = getAllUsers;
exports.getUser = getUser;
exports.deleteUser = deleteUser;
exports.createUser = createUser;
exports.logInUser = logInUser;
exports.updateUser = updateUser;
const config_1 = require("../config");
const UserModel_1 = __importDefault(require("../models/UserModel"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = require("../Utils/User");
function getAllUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const users = yield UserModel_1.default.find().populate('products');
            return users;
        }
        catch (error) {
            console.log(error);
        }
    });
}
function getUser(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield UserModel_1.default.findById(id).populate('products').populate('orders').populate('cart');
            if (!user) {
                throw new Error("No user was found with that id");
            }
            else {
                return user;
            }
        }
        catch (e) {
            console.log(e);
        }
    });
}
function deleteUser(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const deletedUser = yield UserModel_1.default.findByIdAndDelete(id);
            if (!deleteUser) {
                throw new Error("the user with id does not exist");
            }
            else {
                return "Successfully deleted user";
            }
        }
        catch (error) {
            console.log(error);
        }
    });
}
function createUser(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const rounds = config_1.config.server.rounds;
        try {
            const hashedPassword = yield bcrypt_1.default.hash(user.password, rounds);
            const savedUser = new UserModel_1.default(Object.assign(Object.assign({}, user), { password: hashedPassword }));
            return yield savedUser.save();
        }
        catch (error) {
            throw new User_1.UnableToSaveUserError(error.message);
        }
    });
}
function logInUser(Details) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, password } = Details;
        try {
            const user = yield UserModel_1.default.findOne({ email });
            if (!user) {
                throw new User_1.invalidEmailorPasswordError("Invalid Email");
            }
            else {
                const isMatch = yield bcrypt_1.default.compare(password, user.password);
                if (!isMatch) {
                    throw new User_1.invalidEmailorPasswordError("Invalid Password");
                }
                else {
                    return user;
                }
            }
        }
        catch (error) {
            throw error;
        }
    });
}
function updateUser(id, updateData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const updatedUser = yield UserModel_1.default.findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true
            });
            if (!updatedUser) {
                throw new Error(`User with id ${id} not found`);
            }
            return updatedUser;
        }
        catch (error) {
            console.error('Error updating user:', error);
            throw new Error(`Could not update user: ${error.message}`);
        }
    });
}
const generateToken = (user) => {
    console.log(config_1.config.server.jwtSecret);
    return jsonwebtoken_1.default.sign({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
    }, config_1.config.server.jwtSecret, { expiresIn: '1h' });
};
exports.generateToken = generateToken;
