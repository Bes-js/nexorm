import chalk from "chalk";


export default class ErrorHandler extends Error {
    constructor(message: string, hexCode?: string) {
        super(chalk.hex(hexCode || "#FF0000").bold(message));
        this.name = "Nexorm Error";
        this.message = message;
    };

};