/**
 * 🧹 Storage Manager
 * Gerencia localStorage e detecta problemas de tamanho
 */

export class StorageManager {
  private static readonly MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB (limite seguro)
  private static readonly STORAGE_KEYS_TO_MONITOR = [
    'navigation-store',
    'system-data-cache',
    'mcp-service-cache'
  ];

  /**
   * Verifica o tamanho atual do localStorage
   */
  static getCurrentStorageSize(): number {
    let totalSize = 0;
    
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage.getItem(key) || '';
        totalSize += key.length + value.length;
      }
    }
    
    return totalSize;
  }

  /**
   * Verifica se o localStorage está próximo do limite
   */
  static isStorageNearLimit(): boolean {
    const currentSize = this.getCurrentStorageSize();
    return currentSize > this.MAX_STORAGE_SIZE;
  }

  /**
   * Limpa dados antigos ou desnecessários do localStorage
   */
  static cleanupStorage(): void {
    const sizeBefore = this.getCurrentStorageSize();
    
    // 1. Limpar dados temporários e caches antigos
    Object.keys(localStorage).forEach(key => {
      if (key.includes('cache') || key.includes('temp') || key.includes('debug')) {
        localStorage.removeItem(key);
      }
    });
    
    // 2. Se ainda estiver grande, limpar dados de navegação menos críticos
    if (this.isStorageNearLimit()) {
      const navData = localStorage.getItem('navigation-store');
      if (navData) {
        try {
          const parsed = JSON.parse(navData);
          // Manter apenas estado essencial
          const essential = {
            state: {
              isSidebarCollapsed: parsed.state?.isSidebarCollapsed || false,
              activeItem: parsed.state?.activeItem || null
            }
          };
          localStorage.setItem('navigation-store', JSON.stringify(essential));
        } catch (error) {
          console.warn('🧹 Failed to clean navigation store:', error);
          localStorage.removeItem('navigation-store');
        }
      }
    }
    
    const sizeAfter = this.getCurrentStorageSize();
    const cleaned = sizeBefore - sizeAfter;
    
    if (cleaned > 0) {
      console.log(`🧹 Storage cleanup: Freed ${(cleaned / 1024).toFixed(2)}KB`);
    }
  }

  /**
   * Monitora o localStorage e limpa automaticamente quando necessário
   */
  static startStorageMonitoring(): void {
    // Verificar ao carregar a página
    if (this.isStorageNearLimit()) {
      console.warn('🚨 localStorage near limit, cleaning up...');
      this.cleanupStorage();
    }

    // Verificar periodicamente
    setInterval(() => {
      if (this.isStorageNearLimit()) {
        console.warn('🚨 localStorage near limit, cleaning up...');
        this.cleanupStorage();
      }
    }, 60000); // Check a cada 1 minuto
  }

  /**
   * Obtém estatísticas detalhadas do localStorage
   */
  static getStorageStats(): { [key: string]: number } {
    const stats: { [key: string]: number } = {};
    
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage.getItem(key) || '';
        stats[key] = key.length + value.length;
      }
    }
    
    return stats;
  }

  /**
   * Limpa completamente o localStorage (use com cuidado!)
   */
  static clearAllStorage(): void {
    console.warn('🚨 Clearing all localStorage data');
    localStorage.clear();
  }
}

// Auto-inicializar monitoramento quando o módulo for importado
if (typeof window !== 'undefined') {
  StorageManager.startStorageMonitoring();
}
