export interface ScenarioFile {
    scenario: Scenario;
}
export interface Scenario {
    name: string;
    root: string;
    log: string;
    processes: Processes;
    execution: Step[];
}
export interface Processes {
    [processName: string]: Command;
}
export interface Command {
    command: string;
    arguments: string[];
    stdout: string;
    stderr: string;
}
export interface Step {
    [processName: string]: string;
}
