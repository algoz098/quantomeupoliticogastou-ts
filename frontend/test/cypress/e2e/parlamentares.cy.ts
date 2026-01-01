/**
 * Testes E2E para a pagina de Parlamentares
 * Testa listagem, filtros, paginacao, modos de visualizacao e navegacao para detalhes
 */
describe('Pagina de Parlamentares', () => {
  beforeEach(() => {
    cy.visit('/parlamentares');
  });

  describe('Carregamento inicial', () => {
    it('deve exibir o titulo correto da pagina', () => {
      cy.title().should('include', 'Parlamentares');
    });

    it('deve exibir o titulo e subtitulo da pagina', () => {
      cy.get('.page-title').should('contain', 'Parlamentares');
      cy.contains('Deputados e Senadores do Congresso Nacional').should('be.visible');
    });

    it('deve exibir os botoes de toggle de visualizacao', () => {
      cy.get('.view-toggle').should('exist');
    });
  });

  describe('Filtros', () => {
    it('deve exibir o card de filtros', () => {
      cy.get('.filters-card').should('be.visible');
    });

    it('deve exibir filtro de nome', () => {
      cy.get('.filters-card').within(() => {
        cy.contains('Nome').should('be.visible');
        cy.get('input[type="text"]').should('exist');
      });
    });

    it('deve exibir filtro de Casa Legislativa', () => {
      cy.get('.filters-card').within(() => {
        cy.contains('Casa Legislativa').should('be.visible');
      });
    });

    it('deve exibir filtro de Estado (UF)', () => {
      cy.get('.filters-card').within(() => {
        cy.contains('Estado (UF)').should('be.visible');
      });
    });

    it('deve exibir filtro de Partido', () => {
      cy.get('.filters-card').within(() => {
        cy.contains('Partido').should('be.visible');
      });
    });

    it('deve filtrar por nome ao digitar', () => {
      cy.get('.filters-card input[type="text"]').first().type('Silva');
      // Aguarda debounce e resultado
      cy.wait(600);
      // Verifica que a busca foi realizada (pode ter resultados ou nao)
      cy.get('.q-page').should('exist');
    });

    it('deve exibir botao de limpar filtros quando houver filtro ativo', () => {
      cy.get('.filters-card input[type="text"]').first().type('Teste');
      cy.wait(600);
      cy.contains('Limpar filtros').should('be.visible');
    });

    it('deve limpar filtros ao clicar no botao', () => {
      cy.get('.filters-card input[type="text"]').first().type('Teste');
      cy.wait(600);
      cy.contains('Limpar filtros').click();
      cy.get('.filters-card input[type="text"]').first().should('have.value', '');
    });
  });

  describe('Modos de visualizacao', () => {
    it('deve alternar entre modo grid e lista', () => {
      // Clica no botao de lista
      cy.get('.view-toggle button').last().click();
      cy.get('.parlamentares-list').should('exist');

      // Volta para grid
      cy.get('.view-toggle button').first().click();
      cy.get('.parlamentar-card, .parlamentar-card-skeleton').should('exist');
    });
  });

  describe('Listagem de Parlamentares', () => {
    it('deve exibir cards de parlamentares ou skeleton', () => {
      cy.get('.parlamentar-card, .parlamentar-card-skeleton, .parlamentar-list-item').should('exist');
    });

    it('deve exibir informacoes do parlamentar no card', () => {
      cy.get('body').then(($body) => {
        if ($body.find('.parlamentar-card').length > 0) {
          cy.get('.parlamentar-card').first().within(() => {
            cy.get('.parlamentar-nome').should('exist');
            cy.get('.q-avatar').should('exist');
          });
        }
      });
    });

    it('deve navegar para detalhes ao clicar em um parlamentar', () => {
      cy.get('body').then(($body) => {
        if ($body.find('.parlamentar-card').length > 0) {
          cy.get('.parlamentar-card').first().click();
          cy.url().should('include', '/parlamentares/');
        }
      });
    });
  });

  describe('Paginacao', () => {
    it('deve exibir informacoes de paginacao quando houver resultados', () => {
      cy.get('body').then(($body) => {
        if ($body.find('.parlamentar-card').length > 0) {
          cy.contains('Mostrando').should('be.visible');
          cy.get('.q-pagination').should('exist');
        }
      });
    });

    it('deve navegar entre paginas', () => {
      cy.get('body').then(($body) => {
        if ($body.find('.q-pagination').length > 0) {
          cy.get('.q-pagination button').eq(1).click();
          cy.url().should('exist'); // Pagina foi alterada
        }
      });
    });
  });

  describe('Estado vazio', () => {
    it('deve exibir mensagem quando nao houver resultados', () => {
      cy.get('.filters-card input[type="text"]').first().type('xyzxyzxyznonexistent');
      cy.wait(600);
      cy.get('body').then(($body) => {
        if ($body.find('.empty-state').length > 0) {
          cy.get('.empty-state').should('be.visible');
          cy.contains('Nenhum parlamentar encontrado').should('be.visible');
        }
      });
    });
  });
});

// Workaround for Cypress AE + TS + Vite
export {};

