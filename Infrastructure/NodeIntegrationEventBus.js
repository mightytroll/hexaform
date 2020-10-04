import { EventEmitter } from "events";
import { IntegrationEvent } from "../Domain/IntegrationEvent";
import { IntegrationEventBus } from "../Domain/IntegrationEventBus";
import _ from "lodash";

export class NodeIntegrationEventBus extends IntegrationEventBus {
    constructor(container) {
        super();
        this.container = container;
        this.emmitter = new EventEmitter();

        let eventSubscribers = require(`${process.cwd()}/cache/cache`).IntegrationEventSubscribers;
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
            this.emmitter.on(event.name, instance.handle.bind(instance));
        });
    }

    /**
     * @param {IntegrationEvent} event
     */
    dispatch(event) {
        this.emmitter.emit(event.constructor.name, event);
    }
}

NodeIntegrationEventBus.params = ["container"];
