export class HttpException {
    constructor(message, status = 500, context = null) {
        this.message = message;
        this.status = status;
        this.context = context;
    }
}