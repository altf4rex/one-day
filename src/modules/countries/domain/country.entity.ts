export class Country {
    constructor(
        public readonly id: string,
        public name: string,
        public importance?: string,
        public wishes?: string,
        public region?: string,
        public quote?: string,
    ) {}
}