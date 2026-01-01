import { ref, computed, watch } from 'vue';
import type { Casa } from 'src/types/api';

/**
 * Tipo para filtro de casa (inclui null para "todas")
 */
export type CasaFilter = Casa | null;

const STORAGE_KEY_CASA = 'filters:casa';
const STORAGE_KEY_ANOS = 'filters:anos';

/**
 * Carrega valor do localStorage de forma segura
 */
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch {
    // Ignorar erros de parse
  }
  return defaultValue;
}

/**
 * Salva valor no localStorage de forma segura
 */
function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignorar erros de storage (quota excedida, etc)
  }
}

// Inicializar com valores do localStorage
const selectedCasa = ref<CasaFilter>(loadFromStorage<CasaFilter>(STORAGE_KEY_CASA, null));
const anosDisponiveis = ref<number[]>(loadFromStorage<number[]>(STORAGE_KEY_ANOS, []));
const anosLoaded = ref<boolean>(anosDisponiveis.value.length > 0);

// Persistir mudancas no localStorage
watch(selectedCasa, (newValue) => {
  saveToStorage(STORAGE_KEY_CASA, newValue);
});

watch(anosDisponiveis, (newValue) => {
  saveToStorage(STORAGE_KEY_ANOS, newValue);
});

export function useFiltersStore() {
  const casa = computed(() => selectedCasa.value);

  function setCasa(value: CasaFilter) {
    selectedCasa.value = value;
  }

  function clearCasa() {
    selectedCasa.value = null;
  }

  function setAnosDisponiveis(anos: number[]) {
    anosDisponiveis.value = anos;
    anosLoaded.value = true;
  }

  return {
    casa,
    setCasa,
    clearCasa,
    anosDisponiveis,
    anosLoaded,
    setAnosDisponiveis,
  };
}

