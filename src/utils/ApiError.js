class ApiError extends Error{
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        satck = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message =message
        this.success = false;
        this.errors = this.errors

         if(stack){
            this.stack = this.stack
        }else{
            Error.captureStackTrace(this, this.contructor)
        }
    }
}

export {ApiError}