import Pusher from "pusher-js";
import { Kernel } from "../Domain/Kernel";
import { Params } from "../Domain/Params";
import _ from "lodash";

export class WebsocketKernel extends Kernel {
    constructor(container) {
        super(container);

        this.pusher = new Pusher(this.container.get(Params).get("pusher.app"), {
            cluster: this.container.get(Params).get("pusher.cluster"),
        });
        this.channel = this.pusher.subscribe(this.container.get(Params).get("pusher.channel"));
    }

    addRoute(event, commandClass, commandHandlerClass) {
        this.channel.bind(event, async (data) => {
            let command = new commandClass(
                ..._.get(commandClass, "params", []).map((param) => {
                    return data[param];
                })
            );
            let commandHandler = new commandHandlerClass(
                ..._.get(commandHandlerClass, "params", []).map((param) => {
                    return this.container.get(param);
                })
            );
            let result = await commandHandler.handle(command);
        })
    }

    run() {
        let events = require(`${process.cwd()}/config/events`).default;
        for (const name in events) {
            let route = events[name];

            this.addRoute(route.event, route.command, route.handler);
        }
    }
}