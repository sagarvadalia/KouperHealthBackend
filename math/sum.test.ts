import { sum } from "./sum";

describe('Math Utils', () => {
    describe('sum', () => {
      it('should add two numbers correctly', () => {
        expect(sum(1, 2)).toBe(3);
      });
  
      it('should handle negative numbers', () => {
        expect(sum(-1, -2)).toBe(-3);
      });
  
      it('should handle zero', () => {
        expect(sum(0, 5)).toBe(5);
      });
    });
  });