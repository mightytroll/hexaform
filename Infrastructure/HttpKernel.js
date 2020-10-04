import _ from "lodash";
import cors from "cors";
import express from "express";
import { Log } from "./Log";
import { HttpException } from "./HttpException";
import { Kernel } from "../Domain/Kernel";
import { Params } from "../Domain/Params";

export class HttpKernel extends Kernel {
    constructor(container) {
        super(container);

        this.express = express();
        this.express.use(express.json());
        this.express.use(cors());

        this.router = express.Router();
        this.express.use(this.router);

        let routes = require(`${process.cwd()}/config/routes`).default;
        for (const name in routes) {
            let route = routes[name];

            this.addRoute(route.method, route.path, route.command, route.handler);
        }

        this.express.use((error, request, response, next) => {
            if (error instanceof HttpException) {
                Log.error(error.message, error.context);

                response.status(error.status);
                response.send(error.message);
            }
            else {
                Log.error("An unexpected error occurred.", error);

                response.status(500);
                response.send("An unexpected error occurred.");
            }
        });
    }

    addRoute(method, path, commandClass, commandHandlerClass) {
        this.router[method](path, async (request, response, next) => {
            try {
                let command = new commandClass(
                    ..._.get(commandClass, "params", []).map((param) => {
                        return request.body[param];
                    })
                );
                let commandHandler = new commandHandlerClass(
                    ..._.get(commandHandlerClass, "params", []).map((param) => {
                        return this.container.get(param);
                    })
                );
                let result = await commandHandler.handle(command);
                response.json(result);
            } catch (error) {
                next(error);
            }
        });
    }

    run() {
        let port = this.container.get(Params).has("server.port") ? this.container.get(Params).get("server.port") : 3000;

        return this.express.listen(port, () => {
            Log.debug(`Listening on port ${port}...`);
        });
    }
}
