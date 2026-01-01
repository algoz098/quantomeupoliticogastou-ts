<template>
  <q-page class="ranking-page q-pa-md q-pa-md-lg">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h1 class="page-title q-mb-xs">
          <q-icon :name="filters.ordem === 'DESC' ? 'trending_up' : 'trending_down'" class="q-mr-sm" />
          {{ filters.ordem === 'DESC' ? 'Maiores Gastadores' : 'Menores Gastadores' }}
        </h1>
        <p class="text-grey-6 q-mb-none">Ranking de gastos parlamentares em {{ filters.ano }}</p>
      </div>
    </div>

    <!-- Filtros Modernos -->
    <q-card class="filters-card q-mb-lg">
      <q-card-section>
        <div class="row items-end q-col-gutter-md">
          <div class="col-12 col-sm-6 col-md-2">
            <div class="filter-label">Ano</div>
            <q-select
              v-model="filters.ano"
              :options="anoOptions"
              dense
              outlined
              emit-value
              map-options
              @update:model-value="loadData"
            >
              <template v-slot:prepend>
                <q-icon name="calendar_today" color="grey-6" />
              </template>
            </q-select>
          </div>
          <div class="col-12 col-sm-6 col-md-2">
            <div class="filter-label">Casa</div>
            <q-select
              v-model="filters.casa"
              :options="casaOptions"
              dense
              outlined
              emit-value
              map-options
              clearable
              placeholder="Todas"
              @update:model-value="loadData"
            >
              <template v-slot:prepend>
                <q-icon name="domain" color="grey-6" />
              </template>
            </q-select>
          </div>
          <div class="col-12 col-sm-6 col-md-2">
            <div class="filter-label">UF</div>
            <q-select
              v-model="filters.uf"
              :options="ufOptions"
              dense
              outlined
              emit-value
              map-options
              clearable
              placeholder="Todos"
              @update:model-value="loadData"
            >
              <template v-slot:prepend>
                <q-icon name="location_on" color="grey-6" />
              </template>
            </q-select>
          </div>
          <div class="col-12 col-sm-6 col-md-2">
            <div class="filter-label">Quantidade</div>
            <q-select
              v-model="filters.limit"
              :options="limitOptions"
              dense
              outlined
              emit-value
              map-options
              @update:model-value="loadData"
            >
              <template v-slot:prepend>
                <q-icon name="format_list_numbered" color="grey-6" />
              </template>
            </q-select>
          </div>
          <div class="col-12 col-md-4">
            <div class="filter-label">Ordenacao</div>
            <q-btn-toggle
              v-model="filters.ordem"
              toggle-color="primary"
              :options="ordemOptions"
              spread
              unelevated
              rounded
              class="ordem-toggle"
              @update:model-value="loadData"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Podio Visual (Top 3) -->
    <div v-if="!loading && hasPodium && podium1 && podium2 && podium3" class="podium-section q-mb-xl">
      <div class="row justify-center items-end q-gutter-md">
        <!-- 2o Lugar -->
        <div class="podium-item podium-2" @click="$router.push(`/parlamentares/${podium2.parlamentar.id}`)">
          <div class="podium-medal">
            <q-icon name="workspace_premium" size="28px" />
          </div>
          <q-avatar size="70px" class="podium-avatar">
            <img v-if="podium2.parlamentar.foto_url" :src="podium2.parlamentar.foto_url" @error="onImageError" />
            <q-icon v-else name="person" size="md" color="grey-5" />
          </q-avatar>
          <div class="podium-name">{{ podium2.parlamentar.nome }}</div>
          <div class="podium-party">{{ podium2.parlamentar.partido }} - {{ podium2.parlamentar.uf }}</div>
          <div class="podium-value">{{ formatCurrency(podium2.total_gasto) }}</div>
          <div class="podium-base podium-silver">2</div>
        </div>

        <!-- 1o Lugar -->
        <div class="podium-item podium-1" @click="$router.push(`/parlamentares/${podium1.parlamentar.id}`)">
          <div class="podium-medal podium-medal-gold">
            <q-icon name="emoji_events" size="36px" />
          </div>
          <q-avatar size="90px" class="podium-avatar">
            <img v-if="podium1.parlamentar.foto_url" :src="podium1.parlamentar.foto_url" @error="onImageError" />
            <q-icon v-else name="person" size="lg" color="grey-5" />
          </q-avatar>
          <div class="podium-name text-h6">{{ podium1.parlamentar.nome }}</div>
          <div class="podium-party">{{ podium1.parlamentar.partido }} - {{ podium1.parlamentar.uf }}</div>
          <div class="podium-value text-h6">{{ formatCurrency(podium1.total_gasto) }}</div>
          <div class="podium-base podium-gold">1</div>
        </div>

        <!-- 3o Lugar -->
        <div class="podium-item podium-3" @click="$router.push(`/parlamentares/${podium3.parlamentar.id}`)">
          <div class="podium-medal">
            <q-icon name="workspace_premium" size="24px" />
          </div>
          <q-avatar size="60px" class="podium-avatar">
            <img v-if="podium3.parlamentar.foto_url" :src="podium3.parlamentar.foto_url" @error="onImageError" />
            <q-icon v-else name="person" size="md" color="grey-5" />
          </q-avatar>
          <div class="podium-name">{{ podium3.parlamentar.nome }}</div>
          <div class="podium-party">{{ podium3.parlamentar.partido }} - {{ podium3.parlamentar.uf }}</div>
          <div class="podium-value">{{ formatCurrency(podium3.total_gasto) }}</div>
          <div class="podium-base podium-bronze">3</div>
        </div>
      </div>
    </div>

    <!-- Lista do Ranking -->
    <q-card>
      <q-card-section class="q-pb-none">
        <div class="section-title">
          <div class="section-icon">
            <q-icon name="format_list_numbered" color="primary" />
          </div>
          Ranking Completo
        </div>
      </q-card-section>

      <!-- Skeleton -->
      <q-card-section v-if="loading">
        <div v-for="i in Math.min(filters.limit, 10)" :key="i" class="ranking-skeleton q-mb-md">
          <q-skeleton type="circle" size="40px" />
          <q-skeleton type="QAvatar" size="50px" class="q-mx-md" />
          <div class="flex-grow-1">
            <q-skeleton type="text" width="60%" />
            <q-skeleton type="text" width="40%" class="q-mt-xs" />
          </div>
          <q-skeleton type="text" width="100px" />
        </div>
      </q-card-section>

      <!-- Lista -->
      <q-card-section v-else class="q-pt-sm">
        <div
          v-for="item in rankingFromFourth"
          :key="item.parlamentar.id"
          class="ranking-list-item"
          @click="$router.push(`/parlamentares/${item.parlamentar.id}`)"
        >
          <div class="ranking-position" :class="getPositionClass(item.posicao)">
            {{ item.posicao }}
          </div>
          <q-avatar size="50px" class="q-mx-md">
            <img v-if="item.parlamentar.foto_url" :src="item.parlamentar.foto_url" @error="onImageError" />
            <q-icon v-else name="person" size="md" color="grey-5" />
          </q-avatar>
          <div class="ranking-info">
            <div class="ranking-name">{{ item.parlamentar.nome }}</div>
            <div class="ranking-details">
              <span :class="item.parlamentar.casa === 'camara' ? 'badge-deputado' : 'badge-senador'">
                {{ item.parlamentar.casa === 'camara' ? 'Deputado' : 'Senador' }}
              </span>
              <span class="q-ml-sm text-grey-6">{{ item.parlamentar.partido }} - {{ item.parlamentar.uf }}</span>
            </div>
          </div>
          <div class="ranking-stats">
            <div class="ranking-value text-negative text-weight-bold">
              {{ formatCurrency(item.total_gasto) }}
            </div>
            <div class="text-caption text-grey-6">{{ item.total_despesas }} despesas</div>
            <div class="ranking-bar q-mt-xs">
              <div class="ranking-bar-fill" :style="{ width: getBarWidth(item.total_gasto) }"></div>
            </div>
          </div>
          <q-icon name="chevron_right" color="grey-4" class="q-ml-md" />
        </div>
      </q-card-section>

      <!-- Empty State -->
      <q-card-section v-if="ranking.length === 0 && !loading" class="empty-state">
        <q-icon name="leaderboard" class="empty-icon" color="grey-4" />
        <div class="empty-title">Nenhum resultado encontrado</div>
        <div class="empty-description">{{ emptyMessage || 'Tente ajustar os filtros' }}</div>
      </q-card-section>
    </q-card>

    <q-page-scroller position="bottom-right" :scroll-offset="300" :offset="[18, 18]">
      <q-btn fab icon="keyboard_arrow_up" color="primary" class="shadow-8" />
    </q-page-scroller>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useMeta } from 'quasar';
import { apiService } from 'src/services/api.service';
import type { RankingItem, Casa } from 'src/types/api';
import { useFiltersStore } from 'src/stores/filters.store';
import { formatCurrency, handleImageError, buildEmptyMessage } from 'src/utils/formatters';
import { UF_OPTIONS, CASA_OPTIONS, getAnoOptions, ANO_ATUAL } from 'src/utils/constants';
import { notifyError } from 'src/utils/notify';
import { AbortableRequest } from 'src/utils/abortable';

useMeta({ title: 'Ranking de Gastos - Quanto Meu Politico Gastou' });

const router = useRouter();
const filtersStore = useFiltersStore();
const abortableRanking = new AbortableRequest();

const loading = ref(false);
const ranking = ref<RankingItem[]>([]);

// Determinar ano inicial: usar ano do store se disponivel, senao ano atual
function getAnoInicial(): number {
  const anosDoStore = filtersStore.anosDisponiveis.value;
  if (anosDoStore.length > 0) {
    const anosOrdenados = [...anosDoStore].sort((a, b) => b - a);
    const primeiroAno = anosOrdenados[0];
    if (primeiroAno !== undefined) {
      return anosOrdenados.includes(ANO_ATUAL) ? ANO_ATUAL : primeiroAno;
    }
  }
  return ANO_ATUAL;
}

const filters = ref({
  ano: getAnoInicial(),
  casa: filtersStore.casa.value as Casa | null,
  uf: null as string | null,
  limit: 50,
  ordem: 'DESC' as 'ASC' | 'DESC',
});

// Ranking a partir do 4o lugar (exclui podio)
const rankingFromFourth = computed(() => ranking.value.slice(3));

// Itens do podio (com verificacao de existencia)
const podium1 = computed(() => ranking.value[0]);
const podium2 = computed(() => ranking.value[1]);
const podium3 = computed(() => ranking.value[2]);
const hasPodium = computed(() => ranking.value.length >= 3);

// Valor maximo para calcular barras de progresso
const maxRankingValue = computed(() => {
  if (ranking.value.length === 0) return 1;
  return Math.max(...ranking.value.map(r => r.total_gasto));
});

watch(() => filtersStore.casa.value, (newCasa) => {
  filters.value.casa = newCasa;
  filters.value.uf = null;
  void loadData();
});

const anoOptions = computed(() => {
  const anosDoStore = filtersStore.anosDisponiveis.value;
  if (anosDoStore.length > 0) {
    return anosDoStore.map(a => ({ label: String(a), value: a }));
  }
  return getAnoOptions();
});
const casaOptions = CASA_OPTIONS;
const ufOptions = UF_OPTIONS;
const limitOptions = [10, 20, 50, 100].map(n => ({ label: `Top ${n}`, value: n }));
const ordemOptions = [
  { label: 'Mais Gastadores', value: 'DESC', icon: 'trending_up' },
  { label: 'Menos Gastadores', value: 'ASC', icon: 'trending_down' },
];

const emptyMessage = computed(() => buildEmptyMessage(filters.value));

function getPositionClass(posicao: number): string {
  if (posicao <= 10) return 'position-top10';
  if (posicao <= 25) return 'position-top25';
  return 'position-default';
}

function getBarWidth(value: number): string {
  return `${(value / maxRankingValue.value) * 100}%`;
}

const onImageError = handleImageError;

async function loadData() {
  loading.value = true;
  try {
    const response = await apiService.getRanking({
      ano: filters.value.ano,
      casa: filters.value.casa || undefined,
      uf: filters.value.uf || undefined,
      limit: filters.value.limit,
      ordem: filters.value.ordem,
    }, abortableRanking.getConfig());
    ranking.value = response.data;
  } catch (error) {
    if (AbortableRequest.isAbortError(error)) {
      return;
    }
    console.error('Erro ao carregar ranking:', error);
    notifyError('Erro ao carregar ranking');
  } finally {
    loading.value = false;
  }
}

onMounted(() => void loadData());

onBeforeUnmount(() => {
  abortableRanking.abort();
});

defineExpose({ router });
</script>

<style lang="sass" scoped>
.ranking-page
  background: transparent

.filter-label
  font-size: 0.7rem
  text-transform: uppercase
  letter-spacing: 0.5px
  color: #6b7280
  margin-bottom: 6px
  font-weight: 500

.ordem-toggle
  :deep(.q-btn)
    border-radius: 8px

// Podium Section
.podium-section
  padding: 24px 0

.podium-item
  display: flex
  flex-direction: column
  align-items: center
  cursor: pointer
  transition: transform 0.2s ease

  &:hover
    transform: translateY(-4px)

.podium-1
  z-index: 3

.podium-2, .podium-3
  margin-top: 24px

.podium-medal
  margin-bottom: 8px
  color: #9ca3af

.podium-medal-gold
  color: #d4a017

.podium-avatar
  border: 3px solid white
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)
  margin-bottom: 12px

.podium-name
  font-weight: 700
  color: #1a365d
  text-align: center
  max-width: 150px
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
  font-size: 1rem

.podium-party
  font-size: 0.85rem
  color: #4b5563
  margin-top: 4px
  font-weight: 500

.podium-value
  font-weight: 700
  color: #dc2626
  margin-top: 8px
  font-size: 1rem

.podium-base
  width: 80px
  height: 60px
  display: flex
  align-items: center
  justify-content: center
  font-size: 1.5rem
  font-weight: 700
  color: white
  margin-top: 12px
  border-radius: 8px 8px 0 0

.podium-gold
  background: linear-gradient(135deg, #d4a017 0%, #fbbf24 100%)
  height: 80px

.podium-silver
  background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)

.podium-bronze
  background: linear-gradient(135deg, #b45309 0%, #d97706 100%)
  height: 50px

// Ranking List
.ranking-skeleton
  display: flex
  align-items: center
  padding: 12px
  background: #f8fafc
  border-radius: 12px

.ranking-list-item
  display: flex
  align-items: center
  padding: 16px
  background: #f8fafc
  border-radius: 12px
  margin-bottom: 8px
  cursor: pointer
  transition: all 0.2s ease

  &:hover
    background: #f1f5f9
    transform: translateX(4px)

.ranking-position
  width: 40px
  height: 40px
  border-radius: 10px
  display: flex
  align-items: center
  justify-content: center
  font-weight: 700
  font-size: 0.875rem
  flex-shrink: 0

.position-top10
  background: linear-gradient(135deg, #1a365d 0%, #2563eb 100%)
  color: white

.position-top25
  background: #e5e7eb
  color: #374151

.position-default
  background: #f3f4f6
  color: #6b7280

.ranking-info
  flex: 1
  min-width: 0

.ranking-name
  font-weight: 600
  color: #1a365d
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
  font-size: 1rem

.ranking-details
  font-size: 0.85rem
  margin-top: 4px
  color: #4b5563

.ranking-stats
  text-align: right
  min-width: 140px

.ranking-value
  font-size: 1rem
  font-weight: 700
  color: #1a365d

.ranking-bar
  height: 4px
  background: #e5e7eb
  border-radius: 2px
  width: 100px
  overflow: hidden

.ranking-bar-fill
  height: 100%
  background: linear-gradient(90deg, #dc2626 0%, #ef4444 100%)
  border-radius: 2px
  transition: width 0.3s ease

@media (max-width: 1023px)
  .podium-section
    display: none

@media (max-width: 599px)
  .ranking-stats
    min-width: 100px

  .ranking-bar
    width: 60px
</style>

