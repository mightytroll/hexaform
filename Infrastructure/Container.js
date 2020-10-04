import _ from "lodash";
import { Params } from "../Domain/Params";

export class Container {
    constructor(parameterBag) {
        this.parameterBag = parameterBag;

        let services = require(`${process.cwd()}/config/services`).default;
        this.services = services;
        this.serviceInstances = {};
    }

    get(param) {
        if (param == "container") {
            return this;
        }

        if (param == Params) {
            return this.parameterBag;
        }

        if (!this.serviceInstances[param.name]) {
            let serviceClass = this.services[param.name];

            this.serviceInstances[param.name] = new serviceClass(
                ..._.get(serviceClass, "params", []).map((param) => {
                    return this.get(param);
                })
            );
        }

        return this.serviceInstances[param.name];
    }
}
