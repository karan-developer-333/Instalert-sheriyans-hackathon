import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
    organizationName:{
        type:String,
        required:true,
    },
    organizationJoinCode:{
        type:String,
        required:true,
        unique:true,
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true,
    },
    apiKey:{
        type: String,
        select: false
    },
    apiKeyGeneratedAt:{
        type: Date,
    },
    customAiPrompt:{
        type: String,
        default: ''
    }
});

const OrganizationModel = mongoose.model('Organization', organizationSchema);

export default OrganizationModel;