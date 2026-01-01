/**
 * Testes E2E para a pagina 404 (Error Not Found)
 * Testa exibicao da pagina de erro para rotas invalidas
 */
describe('Pagina 404 (Error Not Found)', () => {
  describe('Rota inexistente', () => {
    beforeEach(() => {
      cy.visit('/rota-que-nao-existe', { failOnStatusCode: false });
    });

    it('deve exibir o codigo 404', () => {
      cy.contains('404').should('be.visible');
    });

    it('deve exibir mensagem de pagina nao encontrada', () => {
      cy.contains('Pagina nao encontrada').should('be.visible');
    });

    it('deve exibir botao para voltar ao inicio', () => {
      cy.contains('Voltar ao Inicio').should('be.visible');
    });

    it('deve navegar para home ao clicar no botao', () => {
      cy.contains('Voltar ao Inicio').click();
      cy.url().should('eq', Cypress.config().baseUrl);
    });

    it('deve ter fundo azul', () => {
      cy.get('.fullscreen').should('have.class', 'bg-blue');
    });

    it('deve ter texto branco', () => {
      cy.get('.fullscreen').should('have.class', 'text-white');
    });
  });

  describe('Diversas rotas invalidas', () => {
    it('deve exibir 404 para rota com path longo', () => {
      cy.visit('/a/b/c/d/e/f/g', { failOnStatusCode: false });
      cy.contains('404').should('be.visible');
    });

    it('deve exibir 404 para rota com caracteres especiais', () => {
      cy.visit('/pagina-@#$%', { failOnStatusCode: false });
      cy.contains('404').should('be.visible');
    });

    it('deve exibir 404 para rota com numeros', () => {
      cy.visit('/123456789', { failOnStatusCode: false });
      cy.contains('404').should('be.visible');
    });
  });
});

// Workaround for Cypress AE + TS + Vite
export {};

