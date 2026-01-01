import { ParlamentarRepository } from './parlamentar.repository';
import { DespesaRepository } from './despesa.repository';
import { PartidoRepository } from './partido.repository';

// Instancias singleton dos repositories
export const parlamentarRepository = new ParlamentarRepository();
export const despesaRepository = new DespesaRepository();
export const partidoRepository = new PartidoRepository();

// Exportar classes para casos onde nova instancia seja necessaria
export { ParlamentarRepository, DespesaRepository, PartidoRepository };

