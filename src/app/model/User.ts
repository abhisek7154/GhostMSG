import mongoose , {Schema , Document} from "mongoose";

export interface Message extends Document {
    content: string;
    createdAt: Date;
}

const MessageSchema: Schema<Message> = new Schema({
    content:{
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    }
})

export interface User extends Document{
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    isVerified?: boolean;
    verifyCodeExpire: Date;
    isAcceptingMessage: boolean;
    message: Message[];
}

const UserSchema: Schema<User> = new Schema({

    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
        unique: true
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],    
        unique: true
    },  

    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
        trim: true
    },
     
    verifyCode: {
        type: String,
        required: [true, "Verification code is required"],
    },

    verifyCodeExpire: {
        type: Date,
        required: [true, "Verification code expiration date is required"],
    },

    isAcceptingMessage: {
        type: Boolean,
        default: true
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    message: [MessageSchema]
})

const UserModel = mongoose.models.User || mongoose.model<User>("User", UserSchema);

export default UserModel;