export class IDGenerator {
    private next = 0;

    public generate(): number {
        return this.next++;
    }
}
