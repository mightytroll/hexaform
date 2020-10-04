import fs from "fs";
import path from "path";

export class Finder {
    getFiles(directory) {
        let dirents = fs.readdirSync(directory, { withFileTypes: true });
        let files = dirents.map((dirent) => {
            const res = path.resolve(directory, dirent.name);
            return dirent.isDirectory() ? this.getFiles(res) : res;
        });

        return Array.prototype.concat(...files);
    }
}