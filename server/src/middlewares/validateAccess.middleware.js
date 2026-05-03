
const validateAdmin = (req,res,next)=>{
    if(req.user.role !== "admin"){
        return res.status(403).json({error: "Forbidden"});
    }
    next();
}


const validateOrganization = (req,res,next)=>{
    console.log("Validating organization access for user:", req.user);
    if(req.user.role !== "organization"){
        
        return res.status(403).json({error: "Forbidden"});
    }
    next();
}

export default {
    validateAdmin,
    validateOrganization
};