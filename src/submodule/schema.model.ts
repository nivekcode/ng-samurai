export interface Schema {
    name: string;
    path: string;
    project: string;
    generateComponent: boolean;
    generateModule: boolean;
    style: string;
    inlineStyle: boolean;
    skipTests: boolean;
}
