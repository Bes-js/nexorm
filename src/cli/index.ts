#!/usr/bin/env node
import process from "process";
import { program } from "commander";
import { select } from '@inquirer/prompts';
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { execSync } from "child_process";


program.name("nexorm")
.version("1.0.0")
.description("A simple ORM for Node.js")

program.command("init")
.description("Initialize a new database configuration file");

program.option("--help", "Display help", false)
.option("-y, --yes", "Skip all prompts", false)
.option("-d, --database <type>", "Database type", false)
.option("-e, --engine <type>", "Database engine", false)
.option("-b, --babel", "Generate a babel configuration file", false)
.option("-l, --language <type>", "Language", false);

program.parse(process.argv);
const command = program.args[0];
const options = program.opts();

if (options.help) {
    program.help();
}

if (command === "init") {
   console.log(chalk.blue.bold("Initializing database configuration..."));
   
    if (options.yes == true) {
        let databaseType = options.database || "sqlite";
        let databaseEngine = options.engine || "B-tree";
        let babelConfig = options.babel || false;
        let language = options.language || "ts";

        if (["sqlite", "mysql", "postgres", "mariadb", "mssql"].indexOf(databaseType) === -1) {
            databaseType = "sqlite";
            console.log(chalk.red.bold("Invalid database type. Defaulting to sqlite"));
        };

        if (["InnoDB", "MyISAM", "MEMORY", "CSV", "BLACKHOLE", "ARCHIVE", "FEDERATED", "TOKUDB", "Aria", "PERFORMANCE_SCHEMA", "MRG_MYISAM", "ISAM", "MERGE", "NDB", "NDBCLUSTER", "EXAMPLE", "MEMORY"].indexOf(databaseEngine) === -1) {
            databaseEngine = "InnoDB";
            console.log(chalk.red.bold("Invalid database engine. Defaulting to InnoDB"));
        };


        createConfigFile(databaseType, databaseEngine, language);
        if (babelConfig) installBabel();

        console.log(chalk.hex("#00ff00").bold("Database configuration initialized successfully"));

    } else {
        
    
     (async () => {
        
        let databaseType = options.database || null;
        let databaseEngine = options.engine || null;
        let babelConfig = options.babel || false;
        let language = options.language || "ts";
        let packageDownload = false;

        if (!["sqlite", "mysql", "postgres", "mariadb", "mssql"].some((db) => db == databaseType)) {

           var selectDatabase = await select({
            message: chalk.blue.bold("Select a database type"),
            default: "sqlite",
            choices: [
                { name: chalk.dim.bold("SQLite"), value: "sqlite", description: chalk.yellow.bold("A simple file-based database") },
                { name: "MySQL", value: "mysql", description: chalk.yellow.bold("A popular open-source relational database") },
                { name: "PostgreSQL", value: "postgres", description: chalk.yellow.bold("A powerful, open-source object-relational database system") },
                { name: "MariaDB", value: "mariadb", description: chalk.yellow.bold("A community-developed fork of MySQL") },
                { name: "MS SQL Server", value: "mssql", description: chalk.yellow.bold("A relational database management system developed by Microsoft") }
            ]
           });

              databaseType = selectDatabase;
        };

        if (!["InnoDB", "B-tree", "MyISAM", "MEMORY", "CSV", "BLACKHOLE", "ARCHIVE", "FEDERATED", "TOKUDB", "Aria", "PERFORMANCE_SCHEMA", "MRG_MYISAM", "ISAM", "MERGE", "NDB", "NDBCLUSTER", "EXAMPLE", "MEMORY"].some((engine) => engine == databaseEngine)) {
            var selectEngine = await select({
                message: chalk.blue.bold("Select a database engine"),
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
        };

        var selectLanguage = await select({
            message: chalk.blue.bold("Select a language"),
            default: "ts",
            choices: [
                { name: chalk.blue.bold("TypeScript"), value: "ts" },
               /* { name: chalk.yellow.bold("JavaScript"), value: "js" } */
            ]
        });

        language = selectLanguage;

        var selectBabel = await select({
            message: chalk.blue.bold("Generate a Babel configuration file?"),
            default: false,
            choices: [
                { name: chalk.green.bold("Yes"), value: true },
                { name: chalk.red.bold("No"), value: false }
            ]
        });

        var selectPackageDownload = await select({
            message: chalk.blue.bold("Download packages?"),
            default: true,
            choices: [
                { name: chalk.green.bold("Yes"), value: true },
                { name: chalk.red.bold("No"), value: false }
            ]
        });

        packageDownload = selectPackageDownload;
        babelConfig = selectBabel;


        createConfigFile(databaseType, databaseEngine, language);
        if (babelConfig) installBabel();
        if (packageDownload) installDatabasePackage(databaseType);

        console.log(chalk.hex("#00ff00").bold("Database configuration initialized successfully"));

     })();

    };



}


function createConfigFile(databaseType: string, databaseEngine: string, language: 'ts' | 'js') {

    if (fs.existsSync(path.join(process.cwd(), `nexorm.config.${language}`))) {
        console.log(chalk.red.bold("Database configuration file already exists"));
        return;
    };

    console.log(chalk.blue.bold("Creating database configuration file..."));
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

    fs.writeFileSync(path.join(process.cwd(), `nexorm.config.${language}`), config, "utf-8");
    console.log(chalk.hex("#00ff00").bold("Database configuration file created successfully"));
};



function installBabel() {
    if (fs.existsSync(path.join(process.cwd(), "babel.config.json"))) {
        console.log(chalk.red.bold("Babel configuration file already exists"));
        return;
    };

    console.log(chalk.blue.bold("Creating Babel configuration file..."));
    fs.writeFileSync(path.join(process.cwd(), "babel.config.json"), `{
    "presets": ["@babel/preset-env"],
    "plugins": [["@babel/plugin-proposal-decorators", { "legacy": true }]]
}`, "utf-8");
    console.log(chalk.hex("#00ff00").bold("Babel configuration file created successfully"));

    console.log(chalk.blue.bold("Installing Babel..."));
    execSync("npm install @babel/core @babel/preset-env @babel/plugin-proposal-decorators", { stdio: "inherit" });
    console.log(chalk.hex("#00ff00").bold("Babel installed successfully"));
};



function installDatabasePackage(dbType: string) {
    var packages = {
        'sqlite': 'sqlite3',
        'mysql': 'mysql2',
        'postgres': 'pg',
        'mariadb': 'mariadb',
        'mssql': 'tedious',
    } as Record<string, string>;

    console.log(chalk.blue.bold("Installing database package..."));
    execSync(`npm install ${packages[dbType]}`, { stdio: "inherit" });
    console.log(chalk.hex("#00ff00").bold("Database package installed successfully"));
};