#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const process_1 = __importDefault(require("process"));
const commander_1 = require("commander");
const prompts_1 = require("@inquirer/prompts");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
commander_1.program.name("nexorm")
    .version("1.0.0")
    .description("A simple ORM for Node.js");
commander_1.program.command("init")
    .description("Initialize a new database configuration file");
commander_1.program.option("--help", "Display help", false)
    .option("-y, --yes", "Skip all prompts", false)
    .option("-d, --database <type>", "Database type", false)
    .option("-e, --engine <type>", "Database engine", false)
    .option("-b, --babel", "Generate a babel configuration file", false)
    .option("-l, --language <type>", "Language", false);
commander_1.program.parse(process_1.default.argv);
const command = commander_1.program.args[0];
const options = commander_1.program.opts();
if (options.help) {
    commander_1.program.help();
}
if (command === "init") {
    console.log(chalk_1.default.blue.bold("Initializing database configuration..."));
    if (options.yes == true) {
        let databaseType = options.database || "sqlite";
        let databaseEngine = options.engine || "B-tree";
        let babelConfig = options.babel || false;
        let language = options.language || "ts";
        if (["sqlite", "mysql", "postgres", "mariadb", "mssql"].indexOf(databaseType) === -1) {
            databaseType = "sqlite";
            console.log(chalk_1.default.red.bold("Invalid database type. Defaulting to sqlite"));
        }
        ;
        if (["InnoDB", "MyISAM", "MEMORY", "CSV", "BLACKHOLE", "ARCHIVE", "FEDERATED", "TOKUDB", "Aria", "PERFORMANCE_SCHEMA", "MRG_MYISAM", "ISAM", "MERGE", "NDB", "NDBCLUSTER", "EXAMPLE", "MEMORY"].indexOf(databaseEngine) === -1) {
            databaseEngine = "InnoDB";
            console.log(chalk_1.default.red.bold("Invalid database engine. Defaulting to InnoDB"));
        }
        ;
        createConfigFile(databaseType, databaseEngine, language);
        if (babelConfig)
            installBabel();
        console.log(chalk_1.default.hex("#00ff00").bold("Database configuration initialized successfully"));
    }
    else {
        (async () => {
            let databaseType = options.database || null;
            let databaseEngine = options.engine || null;
            let babelConfig = options.babel || false;
            let language = options.language || "ts";
            let packageDownload = false;
            if (!["sqlite", "mysql", "postgres", "mariadb", "mssql"].some((db) => db == databaseType)) {
                var selectDatabase = await (0, prompts_1.select)({
                    message: chalk_1.default.blue.bold("Select a database type"),
                    default: "sqlite",
                    choices: [
                        { name: chalk_1.default.dim.bold("SQLite"), value: "sqlite", description: chalk_1.default.yellow.bold("A simple file-based database") },
                        { name: "MySQL", value: "mysql", description: chalk_1.default.yellow.bold("A popular open-source relational database") },
                        { name: "PostgreSQL", value: "postgres", description: chalk_1.default.yellow.bold("A powerful, open-source object-relational database system") },
                        { name: "MariaDB", value: "mariadb", description: chalk_1.default.yellow.bold("A community-developed fork of MySQL") },
                        { name: "MS SQL Server", value: "mssql", description: chalk_1.default.yellow.bold("A relational database management system developed by Microsoft") }
                    ]
                });
                databaseType = selectDatabase;
            }
            ;
            if (!["InnoDB", "B-tree", "MyISAM", "MEMORY", "CSV", "BLACKHOLE", "ARCHIVE", "FEDERATED", "TOKUDB", "Aria", "PERFORMANCE_SCHEMA", "MRG_MYISAM", "ISAM", "MERGE", "NDB", "NDBCLUSTER", "EXAMPLE", "MEMORY"].some((engine) => engine == databaseEngine)) {
                var selectEngine = await (0, prompts_1.select)({
                    message: chalk_1.default.blue.bold("Select a database engine"),
                    default: "InnoDB",
                    choices: [
                        { name: "B-tree", value: "B-tree" },
                        { name: "InnoDB", value: "InnoDB" },
                        { name: "MyISAM", value: "MyISAM" },
                        { name: "MEMORY", value: "MEMORY" },
                        { name: "CSV", value: "CSV" },
                        { name: "BLACKHOLE", value: "BLACKHOLE" },
                        { name: "ARCHIVE", value: "ARCHIVE" },
                        { name: "FEDERATED", value: "FEDERATED" },
                        { name: "TOKUDB", value: "TOKUDB" },
                        { name: "Aria", value: "Aria" },
                        { name: "PERFORMANCE_SCHEMA", value: "PERFORMANCE_SCHEMA" },
                        { name: "MRG_MYISAM", value: "MRG_MYISAM" },
                        { name: "ISAM", value: "ISAM" },
                        { name: "MERGE", value: "MERGE" },
                        { name: "NDB", value: "NDB" },
                        { name: "NDBCLUSTER", value: "NDBCLUSTER" },
                        { name: "EXAMPLE", value: "EXAMPLE" },
                    ]
                });
                databaseEngine = selectEngine;
            }
            ;
            var selectLanguage = await (0, prompts_1.select)({
                message: chalk_1.default.blue.bold("Select a language"),
                default: "ts",
                choices: [
                    { name: chalk_1.default.blue.bold("TypeScript"), value: "ts" },
                    /* { name: chalk.yellow.bold("JavaScript"), value: "js" } */
                ]
            });
            language = selectLanguage;
            var selectBabel = await (0, prompts_1.select)({
                message: chalk_1.default.blue.bold("Generate a Babel configuration file?"),
                default: false,
                choices: [
                    { name: chalk_1.default.green.bold("Yes"), value: true },
                    { name: chalk_1.default.red.bold("No"), value: false }
                ]
            });
            var selectPackageDownload = await (0, prompts_1.select)({
                message: chalk_1.default.blue.bold("Download packages?"),
                default: true,
                choices: [
                    { name: chalk_1.default.green.bold("Yes"), value: true },
                    { name: chalk_1.default.red.bold("No"), value: false }
                ]
            });
            packageDownload = selectPackageDownload;
            babelConfig = selectBabel;
            createConfigFile(databaseType, databaseEngine, language);
            if (babelConfig)
                installBabel();
            if (packageDownload)
                installDatabasePackage(databaseType);
            console.log(chalk_1.default.hex("#00ff00").bold("Database configuration initialized successfully"));
        })();
    }
    ;
}
function createConfigFile(databaseType, databaseEngine, language) {
    if (fs_1.default.existsSync(path_1.default.join(process_1.default.cwd(), `nexorm.config.${language}`))) {
        console.log(chalk_1.default.red.bold("Database configuration file already exists"));
        return;
    }
    ;
    console.log(chalk_1.default.blue.bold("Creating database configuration file..."));
    let config = `/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('nexorm').NexormConfig} */
${language == 'js' ? '/* ' : ''}import { defineConfig, NexormConfig } from "nexorm";${language == 'js' ? ' */' : ''}

export default defineConfig([{
    $provider: "nexorm",
    $database: "${databaseType}",
    $databaseEngine: "${databaseEngine}",
    ${databaseType == 'sqlite' ? '$filePath: "./nexorm.sqlite",' : ''}
    $entities: [ /* Add your entities here */ ],
    $autoConnect: true,
    $onConnection: () => {
        console.log("[Nexorm] Database ready!");
    },
    $onError: (error: Error) => {
        console.error("[Nexorm] Error connecting to database:", error);
    },
}])${language == 'js' ? '' : ' satisfies NexormConfig;'}`;
    fs_1.default.writeFileSync(path_1.default.join(process_1.default.cwd(), `nexorm.config.${language}`), config, "utf-8");
    console.log(chalk_1.default.hex("#00ff00").bold("Database configuration file created successfully"));
}
;
function installBabel() {
    if (fs_1.default.existsSync(path_1.default.join(process_1.default.cwd(), "babel.config.json"))) {
        console.log(chalk_1.default.red.bold("Babel configuration file already exists"));
        return;
    }
    ;
    console.log(chalk_1.default.blue.bold("Creating Babel configuration file..."));
    fs_1.default.writeFileSync(path_1.default.join(process_1.default.cwd(), "babel.config.json"), `{
    "presets": ["@babel/preset-env"],
    "plugins": [["@babel/plugin-proposal-decorators", { "legacy": true }]]
}`, "utf-8");
    console.log(chalk_1.default.hex("#00ff00").bold("Babel configuration file created successfully"));
    console.log(chalk_1.default.blue.bold("Installing Babel..."));
    (0, child_process_1.execSync)("npm install @babel/core @babel/preset-env @babel/plugin-proposal-decorators", { stdio: "inherit" });
    console.log(chalk_1.default.hex("#00ff00").bold("Babel installed successfully"));
}
;
function installDatabasePackage(dbType) {
    var packages = {
        'sqlite': 'sqlite3',
        'mysql': 'mysql2',
        'postgres': 'pg',
        'mariadb': 'mariadb',
        'mssql': 'tedious',
    };
    console.log(chalk_1.default.blue.bold("Installing database package..."));
    (0, child_process_1.execSync)(`npm install ${packages[dbType]}`, { stdio: "inherit" });
    console.log(chalk_1.default.hex("#00ff00").bold("Database package installed successfully"));
}
;
