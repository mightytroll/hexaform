import { DomainEventBus } from "./Domain/DomainEventBus";
import { NodeDomainEventBus } from "./Infrastructure/NodeDomainEventBus";

let services = {};

services[DomainEventBus.name] = NodeDomainEventBus;

export default services;
