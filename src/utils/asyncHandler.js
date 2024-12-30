
const asyncHandler = (reqHandler) => {
  return (req, res, next) => {
    // Ensure the function is returned
    Promise.resolve(reqHandler(req, res, next)).catch((err) => next(err));
    console.log("this is reqhandleer" + reqHandler)
    console.log("\n") // Pass errors to Express's error handler
    console.log("next is being printed here" + next)
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
