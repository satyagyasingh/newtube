
const asyncHandler = (reqHandler) => {
        return (req, res, next) => { // Ensure the function is returned
            Promise.resolve(reqHandler(req, res, next))
                .catch((err) => next(err)); // Pass errors to Express's error handler
        };
    };
    
    export { asyncHandler };


    // const asyncHandler = (reqHandler) => {  
    //     async(req, res, next) => {
    //         Promise.resolve(reqHandler(req, res, next)).
    //         catch((err) => next(err))
    //     }
    // }
    
    // export {asyncHandler}
