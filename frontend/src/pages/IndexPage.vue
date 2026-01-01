<template>
  <q-page class="dashboard-page">
    <!-- Hero Section -->
    <div class="hero-section q-mx-md q-mx-md-lg q-mt-md">
      <div class="row items-center">
        <div class="col-12 col-md-7">
          <h1 class="hero-title q-mb-sm">Acompanhe os gastos dos seus representantes</h1>
          <p class="hero-subtitle q-mb-lg">Transparencia e fiscalizacao cidada dos gastos parlamentares brasileiros</p>
          <div class="hero-search">
            <ParlamentarSearch
              outlined
              label="Buscar deputado ou senador..."
              bg-color="white"
              class="search-input"
            />
          </div>
        </div>
        <div class="col-12 col-md-5 gt-sm text-center">
          <q-icon name="account_balance" size="180px" class="hero-icon" />
        </div>
      </div>
    </div>

    <div class="q-pa-md q-pa-md-lg">
      <!-- Cards de Estatisticas - Skeleton -->
      <div v-if="loading && !stats" class="row q-col-gutter-lg q-mb-xl">
        <div v-for="i in 4" :key="i" class="col-12 col-sm-6 col-lg-3">
          <q-card class="stat-card">
            <q-card-section>
              <q-skeleton type="text" width="40%" class="q-mb-sm" />
              <q-skeleton type="text" width="70%" height="2.5rem" />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Cards de Estatisticas -->
      <div v-else class="row q-col-gutter-lg q-mb-xl">
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card class="stat-card bg-gradient-primary text-white card-hover-lift">
            <q-card-section class="relative-position">
              <div class="stat-label">Parlamentares</div>
              <div class="stat-value">{{ formatNumber(stats?.total_parlamentares || 0) }}</div>
              <q-icon name="people" class="stat-icon" />
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card class="stat-card bg-gradient-secondary text-white card-hover-lift">
            <q-card-section class="relative-position">
              <div class="stat-label">Total de Despesas</div>
              <div class="stat-value">{{ formatNumber(stats?.total_despesas || 0) }}</div>
              <q-icon name="receipt_long" class="stat-icon" />
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card class="stat-card bg-gradient-negative text-white card-hover-lift">
            <q-card-section class="relative-position">
              <div class="stat-label">Valor Total Gasto</div>
              <div class="stat-value">{{ formatCurrency(stats?.valor_total || 0) }}</div>
              <q-icon name="payments" class="stat-icon" />
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card class="stat-card bg-gradient-info text-white card-hover-lift">
            <q-card-section class="relative-position">
              <div class="stat-label">Periodo de Dados</div>
              <div class="stat-value text-h5">{{ stats?.anos_disponiveis?.join(' - ') || '-' }}</div>
              <q-icon name="date_range" class="stat-icon" />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Top Gastadores e Categorias -->
      <div class="row q-col-gutter-lg">
        <!-- Top Gastadores -->
        <div class="col-12 col-lg-7">
          <q-card class="full-height">
            <q-card-section class="row items-center q-pb-none">
              <div class="section-title">
                <div class="section-icon">
                  <q-icon name="leaderboard" color="primary" />
                </div>
                Top 10 Gastadores ({{ anoAtual }})
              </div>
              <q-space />
              <q-btn
                flat
                dense
                color="primary"
                label="Ver ranking completo"
                to="/ranking"
                no-caps
              />
            </q-card-section>

            <!-- Skeleton para ranking -->
            <q-card-section v-if="loadingRanking && ranking.length === 0">
              <div v-for="i in 5" :key="i" class="ranking-item-skeleton q-mb-md">
                <q-skeleton type="QAvatar" size="48px" />
                <div class="flex-grow-1 q-ml-md">
                  <q-skeleton type="text" width="60%" />
                  <q-skeleton type="text" width="40%" class="q-mt-xs" />
                </div>
                <q-skeleton type="text" width="100px" />
              </div>
            </q-card-section>

            <template v-else>
              <q-card-section v-if="ranking.length > 0" class="q-pt-sm">
                <div
                  v-for="(item, index) in ranking"
                  :key="item.parlamentar.id"
                  class="ranking-item q-mb-sm"
                  @click="$router.push(`/parlamentares/${item.parlamentar.id}`)"
                >
                  <div class="ranking-position" :class="getRankingClass(index)">
                    {{ item.posicao }}
                  </div>
                  <q-avatar size="48px" class="q-mr-md">
                    <img v-if="item.parlamentar.foto_url" :src="item.parlamentar.foto_url" @error="onImageError" />
                    <q-icon v-else name="person" color="grey-5" />
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
                  <div class="ranking-value">
                    <div class="text-negative text-weight-bold">{{ formatCurrency(item.total_gasto) }}</div>
                    <div class="ranking-bar">
                      <div
                        class="ranking-bar-fill"
                        :style="{ width: getBarWidth(item.total_gasto) }"
                      ></div>
                    </div>
                  </div>
                  <q-icon name="chevron_right" color="grey-4" class="q-ml-sm" />
                </div>
              </q-card-section>
              <q-card-section v-else class="empty-state">
                <q-icon name="search_off" class="empty-icon" />
                <div class="empty-title">Nenhum resultado encontrado</div>
                <div class="empty-description">
                  Nao ha dados para {{ anoAtual }}{{ filtersStore.casa.value ? ` (${filtersStore.casa.value === 'camara' ? 'Camara' : 'Senado'})` : '' }}
                </div>
              </q-card-section>
            </template>
            <q-inner-loading :showing="loadingRanking && ranking.length > 0" />
          </q-card>
        </div>

        <!-- Gastos por Categoria -->
        <div class="col-12 col-lg-5">
          <q-card class="full-height">
            <q-card-section class="q-pb-none">
              <div class="section-title">
                <div class="section-icon">
                  <q-icon name="category" color="secondary" />
                </div>
                Gastos por Categoria
              </div>
            </q-card-section>

            <!-- Skeleton para categorias -->
            <q-card-section v-if="loadingCategorias && categorias.length === 0">
              <div v-for="i in 6" :key="i" class="q-mb-lg">
                <q-skeleton type="text" width="50%" class="q-mb-xs" />
                <q-skeleton type="rect" height="8px" />
                <div class="row justify-between q-mt-xs">
                  <q-skeleton type="text" width="60px" />
                  <q-skeleton type="text" width="80px" />
                </div>
              </div>
            </q-card-section>

            <q-card-section v-else>
              <div v-for="cat in categorias" :key="cat.categoria" class="categoria-item q-mb-md">
                <div class="row justify-between items-center q-mb-xs">
                  <div class="categoria-nome text-weight-medium">{{ cat.categoria }}</div>
                  <div class="categoria-valor text-weight-bold">{{ formatCurrency(cat.total) }}</div>
                </div>
                <q-linear-progress
                  :value="cat.total / maxCategoriaTotal"
                  color="secondary"
                  track-color="grey-3"
                  rounded
                  size="8px"
                />
                <div class="text-caption text-grey-6 q-mt-xs">{{ cat.quantidade }} despesas</div>
              </div>

              <div v-if="categorias.length === 0" class="empty-state">
                <q-icon name="category" class="empty-icon" />
                <div class="empty-title">Sem dados de categorias</div>
              </div>
            </q-card-section>
            <q-inner-loading :showing="loadingCategorias && categorias.length > 0" />
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useMeta } from 'quasar';
import { apiService } from 'src/services/api.service';
import type { Estatisticas, RankingItem, CategoriaGasto } from 'src/types/api';
import ParlamentarSearch from 'src/components/ParlamentarSearch.vue';
import { useFiltersStore } from 'src/stores/filters.store';
import { formatCurrency as formatCurrencyUtil, formatNumber as formatNumberUtil, handleImageError } from 'src/utils/formatters';
import { notifyError } from 'src/utils/notify';
import { AbortableRequest } from 'src/utils/abortable';
import { ANO_ATUAL } from 'src/utils/constants';

useMeta({ title: 'Dashboard - Quanto Meu Politico Gastou' });

const router = useRouter();
const filtersStore = useFiltersStore();
const abortableStats = new AbortableRequest();
const abortableRanking = new AbortableRequest();
const abortableCategorias = new AbortableRequest();

const loading = ref(false);
const loadingRanking = ref(false);
const loadingCategorias = ref(false);
const stats = ref<Estatisticas | null>(null);
const ranking = ref<RankingItem[]>([]);
const categorias = ref<CategoriaGasto[]>([]);

function formatCurrency(value: number): string {
  return formatCurrencyUtil(value, true);
}

function formatNumber(value: number): string {
  return formatNumberUtil(value, true);
}

const anoAtual = ref(ANO_ATUAL);

const onImageError = handleImageError;

// Calcular o valor maximo de categoria para a barra de progresso
const maxCategoriaTotal = computed(() => {
  if (categorias.value.length === 0) return 1;
  return Math.max(...categorias.value.map(c => c.total));
});

// Calcular o valor maximo do ranking para as barras
const maxRankingTotal = computed(() => {
  if (ranking.value.length === 0) return 1;
  return Math.max(...ranking.value.map(r => r.total_gasto));
});

function getBarWidth(value: number): string {
  return `${(value / maxRankingTotal.value) * 100}%`;
}

function getRankingClass(index: number): string {
  if (index === 0) return 'podium-gold';
  if (index === 1) return 'podium-silver';
  if (index === 2) return 'podium-bronze';
  return 'podium-default';
}

async function loadData() {
  loading.value = true;
  loadingRanking.value = true;
  loadingCategorias.value = true;
  try {
    const casa = filtersStore.casa.value || undefined;

    // Primeiro buscar estatisticas para saber os anos disponiveis
    const statsData = await apiService.getEstatisticas(casa, abortableStats.getConfig());
    stats.value = statsData;

    // Determinar o ano a usar: mais recente disponivel ou ano atual
    if (statsData.anos_disponiveis?.length > 0) {
      filtersStore.setAnosDisponiveis(statsData.anos_disponiveis);
      // Usar o ano mais recente disponivel se o ano atual nao tiver dados
      const anosOrdenados = [...statsData.anos_disponiveis].sort((a, b) => b - a);
      const primeiroAno = anosOrdenados[0];
      if (primeiroAno !== undefined) {
        anoAtual.value = anosOrdenados.includes(ANO_ATUAL) ? ANO_ATUAL : primeiroAno;
      }
    }

    // Buscar ranking e categorias com o ano correto
    const [rankingData, categoriasData] = await Promise.all([
      apiService.getRanking({ ano: anoAtual.value, limit: 10, casa }, abortableRanking.getConfig()),
      apiService.getCategorias(anoAtual.value, casa, abortableCategorias.getConfig()),
    ]);

    ranking.value = rankingData.data;
    categorias.value = categoriasData.data.slice(0, 10);
  } catch (error) {
    if (AbortableRequest.isAbortError(error)) {
      return;
    }
    console.error('Erro ao carregar dados:', error);
    notifyError('Erro ao carregar dados do dashboard');
  } finally {
    loading.value = false;
    loadingRanking.value = false;
    loadingCategorias.value = false;
  }
}

watch(() => filtersStore.casa.value, () => {
  void loadData();
});

onMounted(() => void loadData());

onBeforeUnmount(() => {
  abortableStats.abort();
  abortableRanking.abort();
  abortableCategorias.abort();
});

// Necessario para usar $router no template
defineExpose({ router });
</script>

<style lang="sass" scoped>
.dashboard-page
  background: transparent

.hero-section
  background: linear-gradient(135deg, #1a365d 0%, #2563eb 100%)
  color: white
  padding: 40px
  border-radius: 16px
  position: relative
  overflow: hidden

  &::before
    content: ''
    position: absolute
    top: -50%
    right: -10%
    width: 400px
    height: 400px
    background: rgba(255, 255, 255, 0.05)
    border-radius: 50%

.hero-title
  font-size: 2rem
  font-weight: 700
  line-height: 1.3
  margin: 0
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1)

.hero-subtitle
  font-size: 1.1rem
  opacity: 1
  max-width: 500px
  line-height: 1.5
  font-weight: 400

.hero-search
  max-width: 450px

  .search-input
    :deep(.q-field__control)
      background: white !important
      border-radius: 12px

    :deep(.q-field__native)
      color: #1a365d !important

.hero-icon
  opacity: 0.15

.ranking-item-skeleton
  display: flex
  align-items: center
  padding: 12px
  background: #f8fafc
  border-radius: 12px

.ranking-item
  display: flex
  align-items: center
  padding: 12px 16px
  background: #f8fafc
  border-radius: 12px
  cursor: pointer
  transition: all 0.2s ease

  &:hover
    background: #f1f5f9
    transform: translateX(4px)

.ranking-position
  width: 32px
  height: 32px
  border-radius: 8px
  display: flex
  align-items: center
  justify-content: center
  font-weight: 700
  font-size: 0.875rem
  margin-right: 12px

.podium-gold
  background: linear-gradient(135deg, #d4a017 0%, #fbbf24 100%)
  color: white

.podium-silver
  background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)
  color: white

.podium-bronze
  background: linear-gradient(135deg, #b45309 0%, #d97706 100%)
  color: white

.podium-default
  background: #e5e7eb
  color: #374151

.ranking-info
  flex: 1
  min-width: 0

.ranking-name
  font-weight: 600
  color: #1a365d
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
  font-size: 0.95rem

.ranking-details
  font-size: 0.8rem
  margin-top: 2px
  color: #4b5563

.ranking-value
  text-align: right
  min-width: 120px
  font-size: 0.95rem

.ranking-bar
  height: 4px
  background: #e5e7eb
  border-radius: 2px
  margin-top: 4px
  overflow: hidden

.ranking-bar-fill
  height: 100%
  background: linear-gradient(90deg, #dc2626 0%, #ef4444 100%)
  border-radius: 2px

.categoria-item
  .categoria-nome
    font-size: 0.9rem
    color: #374151
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis
    max-width: 200px
    font-weight: 500

  .categoria-valor
    font-size: 0.9rem
    color: #1a365d
    font-weight: 600

@media (max-width: 599px)
  .hero-section
    padding: 24px

  .hero-title
    font-size: 1.5rem

  .ranking-value
    min-width: 90px
</style>
