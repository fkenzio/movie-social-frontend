import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  
  // ==================== SET ====================
  set(key: string, value: any): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Error saving to localStorage', error);
    }
  }

  // ==================== GET ====================
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return null;
    }
  }

  // ==================== REMOVE ====================
  remove(key: string): void {
    localStorage.removeItem(key);
  }

  // ==================== CLEAR ====================
  clear(): void {
    localStorage.clear();
  }

  // ==================== HAS ====================
  has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}