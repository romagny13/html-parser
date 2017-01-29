interface RInfos {
    index: number;
    end: number;
}

interface RNode {
    name: string;
    innerHTML: string;
    children: Array<RNode>;
    infos: RInfos;
}

interface HTMLParserStatic {
    parse(html: string): Array<RNode>
}

declare var HTMLParser: HTMLParserStatic;

declare module "romagny13-html-parser" {
    export = HTMLParser;
}
