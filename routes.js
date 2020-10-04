import { StatusCommand } from "./Application/Server/StatusCommand";
import { StatusCommandHandler } from "./Application/Server/StatusCommandHandler";

export const status = {
    method: "get",
    path: "/platform/status",
    command: StatusCommand,
    handler: StatusCommandHandler
};
