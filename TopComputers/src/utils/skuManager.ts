/**
 * SKU Management Utility
 * Handles automatic SKU generation, validation, and tracking
 */

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export class SKUManager {
  private static readonly SKU_START = 100;
  private static readonly SKU_PREFIX = 'TC'; // TopComputers prefix (optional)
  
  /**
   * Get the next available SKU number
   */
  static async getNextAvailableSKU(): Promise<string> {
    try {
      // Get all existing SKUs from products
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      
      const existingSKUs = new Set<number>();
      
      snapshot.docs.forEach(doc => {
        const product = doc.data();
        if (product.sku) {
          // Extract number from SKU (handle both "TC123" and "123" formats)
          const skuNumber = this.extractSKUNumber(product.sku);
          if (skuNumber !== null) {
            existingSKUs.add(skuNumber);
          }
        }
      });
      
      // Find the next available number starting from SKU_START
      let nextNumber = this.SKU_START;
      while (existingSKUs.has(nextNumber)) {
        nextNumber++;
      }
      
      return this.formatSKU(nextNumber);
    } catch (error) {
      console.error('Error getting next SKU:', error);
      // Fallback to a timestamp-based SKU
      return this.formatSKU(this.SKU_START + Date.now() % 1000);
    }
  }
  
  /**
   * Check if a SKU already exists
   */
  static async isSKUExists(sku: string): Promise<boolean> {
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('sku', '==', sku));
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking SKU existence:', error);
      return false;
    }
  }
  
  /**
   * Validate SKU format and uniqueness
   */
  static async validateSKU(sku: string, excludeProductId?: string): Promise<{
    isValid: boolean;
    error?: string;
  }> {
    if (!sku || sku.trim() === '') {
      return { isValid: false, error: 'SKU is required' };
    }
    
    const trimmedSKU = sku.trim();
    
    // Check format (allow letters, numbers, hyphens)
    if (!/^[A-Za-z0-9\-]+$/.test(trimmedSKU)) {
      return { isValid: false, error: 'SKU can only contain letters, numbers, and hyphens' };
    }
    
    // Check length
    if (trimmedSKU.length < 2 || trimmedSKU.length > 20) {
      return { isValid: false, error: 'SKU must be between 2-20 characters' };
    }
    
    // Check uniqueness
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('sku', '==', trimmedSKU));
      const snapshot = await getDocs(q);
      
      // If editing existing product, exclude it from duplicate check
      if (excludeProductId) {
        const duplicates = snapshot.docs.filter(doc => doc.id !== excludeProductId);
        if (duplicates.length > 0) {
          return { isValid: false, error: 'This SKU is already used by another product' };
        }
      } else {
        if (!snapshot.empty) {
          return { isValid: false, error: 'This SKU is already used' };
        }
      }
      
      return { isValid: true };
    } catch (error) {
      console.error('Error validating SKU:', error);
      return { isValid: false, error: 'Error checking SKU availability' };
    }
  }
  
  /**
   * Get all used SKUs for reference
   */
  static async getAllUsedSKUs(): Promise<string[]> {
    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      
      return snapshot.docs
        .map(doc => doc.data().sku)
        .filter(sku => sku)
        .sort();
    } catch (error) {
      console.error('Error getting used SKUs:', error);
      return [];
    }
  }
  
  /**
   * Extract numeric part from SKU
   */
  private static extractSKUNumber(sku: string): number | null {
    // Remove prefix and extract number
    const match = sku.match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
  }
  
  /**
   * Format SKU with consistent pattern
   */
  private static formatSKU(number: number): string {
    // You can change this format as needed
    // Options: "TC123", "123", "TC-123", etc.
    return `${this.SKU_PREFIX}${number}`;
  }
  
  /**
   * Suggest similar available SKUs if the chosen one is taken
   */
  static async suggestAlternativeSKUs(desiredSKU: string, count = 3): Promise<string[]> {
    const baseNumber = this.extractSKUNumber(desiredSKU) || this.SKU_START;
    const suggestions: string[] = [];
    
    try {
      const usedSKUs = await this.getAllUsedSKUs();
      const usedNumbers = new Set(
        usedSKUs.map(sku => this.extractSKUNumber(sku)).filter(num => num !== null)
      );
      
      // Try numbers around the desired number
      for (let i = 1; suggestions.length < count && i <= 50; i++) {
        const tryNumber1 = baseNumber + i;
        const tryNumber2 = baseNumber - i;
        
        if (!usedNumbers.has(tryNumber1)) {
          suggestions.push(this.formatSKU(tryNumber1));
        }
        
        if (tryNumber2 >= this.SKU_START && !usedNumbers.has(tryNumber2)) {
          suggestions.push(this.formatSKU(tryNumber2));
        }
      }
      
      return suggestions.slice(0, count);
    } catch (error) {
      console.error('Error suggesting alternative SKUs:', error);
      return [];
    }
  }
}
