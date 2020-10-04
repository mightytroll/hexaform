import _ from "lodash";
import path from "path";
import { DomainEvent } from "../Domain/DomainEvent";
import { DomainEventBus } from "../Domain/DomainEventBus";
import { DomainEventSubscriber } from "../Domain/DomainEventSubscriber";
import { Finder } from "./Finder";

export class NodeDomainEventBus extends DomainEventBus {
    constructor(container) {
        super();
        this.container = container;
        this.events = {};

        let finder = new Finder();
        let eventSubscribers = [];
        finder.getFiles(`${process.cwd()}/src`).forEach((file) => {
            if (file == path.resolve(process.cwd(), "src/index.js")) return;

            let name = path.basename(file, ".js");
            let module = require(file);
            let exportedClass = module[name];

            if (exportedClass && exportedClass.prototype instanceof DomainEventSubscriber) {
                eventSubscribers.push(exportedClass);
            }
        });
        if (eventSubscribers) {
            eventSubscribers.forEach((subscriber) => {
                this.subscribe(subscriber);
            });
        }
    }

    subscribe(subscriber) {
        let instance = new subscriber(
            ..._.get(subscriber, "params", []).map((param) => {
                return this.container.get(param);
            })
        );

        subscriber.subscribedTo().forEach((event) => {
            if (!_.has(this.events, event.name)) {
                this.events[event.name] = [];
            }
            this.events[event.name].push(instance);
        });
    }

    /**
     * @param {DomainEvent} event
     */
    async dispatch(event) {
        await Promise.all(_.map(this.events[event.constructor.name], (handler) => { return handler.handle(event) }));
    }
}

NodeDomainEventBus.params = ["container"];
