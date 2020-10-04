import { Params } from "../../Domain/Params";

export class StatusCommandHandler {
    constructor(params) {
        this.params = params;
    }

    handle(statusCommand) {
        return {
            server: this.params.get("server.name"),
            status: this.params.get("server.status.text")
        };
    }
}

StatusCommandHandler.params = [Params];
