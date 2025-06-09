export class Country {
  constructor(
    public readonly id: number,
    public name: string,
    public importance?: number,
    public wishes?: string,
    public region?: string,
    public quote?: string,
    public readonly userId?: number,
  ) {}
}