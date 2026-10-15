const { calculateQuote, parsePageRange } = require('../src/services/pricingService');

describe('Pricing Service and Calculations', () => {
  describe('Page Range Parser', () => {
    test('should parse "all" as all document pages', () => {
      const res = parsePageRange('all', 5);
      expect(res.valid).toBe(true);
      expect(res.count).toBe(5);
      expect(res.pages).toEqual([1, 2, 3, 4, 5]);
    });

    test('should parse explicit range "1-3"', () => {
      const res = parsePageRange('1-3', 10);
      expect(res.valid).toBe(true);
      expect(res.count).toBe(3);
      expect(res.pages).toEqual([1, 2, 3]);
    });

    test('should parse comma-separated pages "1,3,5"', () => {
      const res = parsePageRange('1,3,5', 10);
      expect(res.valid).toBe(true);
      expect(res.count).toBe(3);
      expect(res.pages).toEqual([1, 3, 5]);
    });

    test('should reject invalid range formats like "5-2"', () => {
      const res = parsePageRange('5-2', 10);
      expect(res.valid).toBe(false);
      expect(res.error).toBeDefined();
    });
  });

  describe('Authoritative Quote Calculation', () => {
    test('should calculate A4 BW single-sided (₹2/side)', async () => {
      const quote = await calculateQuote({
        paperSize: 'A4',
        printMode: 'BW',
        copies: 1,
        pageRange: 'all',
        duplex: false,
        totalDocumentPages: 4
      });

      expect(quote.ratePerSide).toBe(2.0);
      expect(quote.totalSides).toBe(4);
      expect(quote.totalSheets).toBe(4); // Simplex: 4 sides = 4 sheets
      expect(quote.subtotal).toBe(8.0);
      expect(quote.totalAmount).toBe(8.0);
    });

    test('should calculate A4 Color duplex with 2 copies', async () => {
      const quote = await calculateQuote({
        paperSize: 'A4',
        printMode: 'COLOR',
        copies: 2,
        pageRange: 'all',
        duplex: true,
        totalDocumentPages: 3
      });

      // 3 pages * 2 copies = 6 total sides
      expect(quote.totalSides).toBe(6);
      // Duplex: ceil(6 / 2) = 3 physical sheets
      expect(quote.totalSheets).toBe(3);
      expect(quote.ratePerSide).toBe(10.0);
      expect(quote.subtotal).toBe(60.0);
    });

    test('should calculate A3 BW and A3 Color rates', async () => {
      const a3Bw = await calculateQuote({
        paperSize: 'A3',
        printMode: 'BW',
        copies: 1,
        pageRange: 'all',
        duplex: false,
        totalDocumentPages: 1
      });
      expect(a3Bw.ratePerSide).toBe(5.0);
      expect(a3Bw.totalAmount).toBe(5.0);

      const a3Color = await calculateQuote({
        paperSize: 'A3',
        printMode: 'COLOR',
        copies: 1,
        pageRange: 'all',
        duplex: false,
        totalDocumentPages: 1
      });
      expect(a3Color.ratePerSide).toBe(20.0);
      expect(a3Color.totalAmount).toBe(20.0);
    });

    test('should reject unsupported paper size or print mode', async () => {
      await expect(
        calculateQuote({ paperSize: 'B5', printMode: 'BW' })
      ).rejects.toThrow('Unsupported paper size');

      await expect(
        calculateQuote({ paperSize: 'A4', printMode: 'SEPIA' })
      ).rejects.toThrow('Unsupported print mode');
    });
  });
});
