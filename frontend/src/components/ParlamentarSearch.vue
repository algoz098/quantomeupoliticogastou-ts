<template>
  <q-select
    ref="selectRef"
    v-model="selected"
    :options="results"
    :label="props.label"
    use-input
    hide-selected
    fill-input
    input-debounce="300"
    option-label="nome"
    option-value="id"
    clearable
    :loading="loading"
    :dense="props.dense"
    :dark="props.dark"
    :outlined="props.outlined"
    :rounded="props.rounded"
    :standout="props.standout"
    :bg-color="props.bgColor"
    popup-content-class="parlamentar-search-popup"
    @filter="onFilter"
    @update:model-value="onSelect"
  >
    <template v-slot:prepend>
      <q-icon name="search" :color="props.dark ? 'white' : undefined" />
    </template>

    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps" class="q-py-sm">
        <q-item-section avatar>
          <q-avatar size="45px" :color="scope.opt.foto_url ? undefined : 'grey-4'">
            <img v-if="scope.opt.foto_url" :src="scope.opt.foto_url" />
            <q-icon v-else name="person" color="grey-7" />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -->
          <q-item-label class="text-weight-medium" v-html="highlightMatch(scope.opt.nome)" />
          <q-item-label caption>
            <q-badge
              :color="scope.opt.casa === 'camara' ? 'blue-7' : 'green-7'"
              :label="scope.opt.casa === 'camara' ? 'Deputado' : 'Senador'"
              class="q-mr-xs"
            />
            {{ scope.opt.partido || 'Sem partido' }} - {{ scope.opt.uf || 'N/A' }}
          </q-item-label>
          <q-item-label v-if="scope.opt.total_gasto" caption class="text-negative text-weight-medium">
            Total gasto: {{ formatCurrency(scope.opt.total_gasto) }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" color="grey" />
        </q-item-section>
      </q-item>
    </template>

    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey">
          <template v-if="!searchTerm">
            Digite o nome do parlamentar...
          </template>
          <template v-else-if="searchTerm.length < 2">
            Digite pelo menos 2 caracteres...
          </template>
          <template v-else>
            Nenhum parlamentar encontrado
          </template>
        </q-item-section>
      </q-item>
    </template>

    <template v-slot:append>
      <q-icon v-if="loading" name="hourglass_empty" class="rotate" :color="props.dark ? 'white' : undefined" />
      <template v-else-if="results.length > 0">
        <q-badge color="primary" :label="results.length" />
      </template>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { apiService } from 'src/services/api.service';
import type { Parlamentar } from 'src/types/api';
import { formatCurrency } from 'src/utils/formatters';
import { AbortableRequest } from 'src/utils/abortable';

interface Props {
  label?: string;
  dense?: boolean;
  dark?: boolean;
  outlined?: boolean;
  rounded?: boolean;
  standout?: boolean | string;
  bgColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Buscar parlamentar...',
  dense: false,
  dark: false,
  outlined: false,
  rounded: false,
  standout: false,
});

// bgColor is optional without default

const emit = defineEmits<{
  select: [parlamentar: Parlamentar];
}>();

const router = useRouter();
const selected = ref<Parlamentar | null>(null);
const results = ref<Parlamentar[]>([]);
const loading = ref(false);
const searchTerm = ref('');
const abortableSearch = new AbortableRequest();

function highlightMatch(text: string): string {
  if (!searchTerm.value || searchTerm.value.length < 2) return text;
  const regex = new RegExp(`(${searchTerm.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-3">$1</mark>');
}

async function onFilter(val: string, update: (fn: () => void) => void, abort: () => void) {
  searchTerm.value = val;

  if (!val || val.length < 2) {
    update(() => {
      results.value = [];
    });
    return;
  }

  loading.value = true;
  try {
    const response = await apiService.getParlamentares(
      { nome: val, limit: 15 },
      abortableSearch.getConfig()
    );
    update(() => {
      results.value = response.data;
    });
  } catch (error) {
    if (AbortableRequest.isAbortError(error)) {
      return; // Requisicao cancelada, ignorar
    }
    console.error('Erro na busca:', error);
    abort();
  } finally {
    loading.value = false;
  }
}

function onSelect(parlamentar: Parlamentar | null) {
  if (parlamentar) {
    emit('select', parlamentar);
    void router.push(`/parlamentares/${parlamentar.id}`);
    selected.value = null;
    searchTerm.value = '';
  }
}

onBeforeUnmount(() => {
  abortableSearch.abort();
});
</script>

<style scoped>
.rotate {
  animation: rotate 1s linear infinite;
}
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

